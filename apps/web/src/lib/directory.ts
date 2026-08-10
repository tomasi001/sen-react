import type { ProfileTypeSlug, SectorSlug } from "@sen-react/shared";

import { createServiceRoleSupabase } from "@/lib/supabase/service";

/**
 * Public-directory row — the column-projected view of user_profiles
 * created in supabase/migrations/20260511_000000_directory_profiles_view.sql.
 *
 * Importantly does NOT include phone, email, parental fields, or
 * verification_notes — those stay on the underlying table behind RLS.
 */
export interface DirectoryProfile {
  directory_slug: string;
  profile_type: ProfileTypeSlug;
  display_name: string;
  sector_slug: SectorSlug | null;
  region: string | null;
  photo_url: string | null;
  summary: string | null;
  organisation_label: string | null;
  verification_status: "verified" | "auto_verified";
  /** Optional differentiation badge per roadmap row 92. Free-text. */
  tier: string | null;
  created_at: string;
}

export interface DirectoryFilters {
  /** Profile type — entrepreneur, organisation, government, partner (admin excluded by the view). */
  type?: ProfileTypeSlug;
  sector?: SectorSlug;
  /** Free-text region match (`ilike` on the stored value). */
  region?: string;
  limit?: number;
}

/**
 * Read verified + auto_verified profiles from the public directory view.
 * Filters are applied at the Postgres layer for cheap pagination later.
 * Sorted newest-first so freshly verified members surface to the top.
 */
export async function listDirectoryProfiles(
  filters: DirectoryFilters = {},
): Promise<DirectoryProfile[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return [];
  const sb = createServiceRoleSupabase();
  let query = sb
    .from("directory_profiles")
    .select(
      "directory_slug, profile_type, display_name, sector_slug, region, photo_url, summary, organisation_label, verification_status, tier, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(filters.limit ?? 60);

  if (filters.type) query = query.eq("profile_type", filters.type);
  if (filters.sector) query = query.eq("sector_slug", filters.sector);
  if (filters.region) query = query.ilike("region", `%${filters.region}%`);

  const { data, error } = await query.returns<DirectoryProfile[]>();
  if (error) {
    console.warn("[directory] listDirectoryProfiles failed:", error.message);
    return [];
  }
  return data ?? [];
}

/**
 * Single profile fetch by directory_slug. Public fields only — no
 * phone / email. Returns null if no row matches (caller should
 * notFound()).
 */
export async function getDirectoryProfileBySlug(slug: string): Promise<DirectoryProfile | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  const sb = createServiceRoleSupabase();
  const { data, error } = await sb
    .from("directory_profiles")
    .select(
      "directory_slug, profile_type, display_name, sector_slug, region, photo_url, summary, organisation_label, verification_status, tier, created_at",
    )
    .eq("directory_slug", slug)
    .maybeSingle<DirectoryProfile>();
  if (error) {
    console.warn("[directory] getDirectoryProfileBySlug failed:", error.message);
    return null;
  }
  return data;
}

export interface ProfileContact {
  phone: string | null;
  email: string | null;
}

/**
 * Authenticated-only fetcher for the gated D020 contact fields. Reads
 * phone from user_profiles (service-role bypasses the own-row RLS)
 * and email from auth.users (gated by the user's email_public flag).
 *
 * Returns null if the user_profiles row is missing or both fields
 * collapse to null after gating.
 *
 * **Caller is responsible for confirming the visitor is authenticated**
 * before calling this. The function does not re-check; it just exposes
 * the gated fields. Calling from an anonymous code path is a leak.
 */
export async function getProfileContactBySlug(slug: string): Promise<ProfileContact | null> {
  // PostgREST can't apply LIKE to a uuid column, so we resolve the
  // 8-char directory_slug → full user_id via the public view first
  // (which already does the substr projection), then fetch the gated
  // fields by full UUID equality on user_profiles.
  const sbAnon = createServiceRoleSupabase();
  const { data: directoryRow, error: dirErr } = await sbAnon
    .from("directory_profiles")
    .select("directory_slug")
    .eq("directory_slug", slug)
    .maybeSingle<{ directory_slug: string }>();
  if (dirErr || !directoryRow) return null;

  const sb = createServiceRoleSupabase();
  // Now look up the matching user_profiles row by prefix. We need to
  // do an in-memory match on user_id::text because there's no
  // computed slug column to index against directly. The pool is small
  // (verified-profile count) so this is bounded.
  const { data: candidates, error } = await sb
    .from("user_profiles")
    .select("user_id, phone, email_public, verification_status")
    .in("verification_status", ["verified", "auto_verified"])
    .returns<
      Array<{
        user_id: string;
        phone: string | null;
        email_public: boolean;
        verification_status: string;
      }>
    >();
  if (error || !candidates) return null;
  const profile = candidates.find((c) => c.user_id.startsWith(slug));
  if (!profile) return null;

  let email: string | null = null;
  if (profile.email_public) {
    const { data: userData } = await sb.auth.admin.getUserById(profile.user_id);
    email = userData.user?.email ?? null;
  }

  if (!profile.phone && !email) return null;
  return { phone: profile.phone, email };
}
