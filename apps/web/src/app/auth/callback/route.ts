import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { createServerSupabase } from "@/lib/supabase/server";

/**
 * Email-confirmation callback.
 *
 * Handles two flows Supabase may send here:
 *
 * 1. token_hash + type  — OTP / email-link flow. The email template links
 *    directly to this route with the hash. Works cross-browser and cross-
 *    device because there is no session-bound PKCE verifier.
 *
 * 2. code               — PKCE code flow (OAuth, magic-link same-session).
 *    Requires the code verifier from the originating browser's localStorage.
 *    Kept as a fallback for OAuth providers.
 *
 * `next` query param controls the post-auth redirect (defaults to `/`).
 * Same-origin guard: only paths starting with `/`, no protocol.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const token_hash = url.searchParams.get("token_hash");
  // EmailOtpType is a union of string literals; the raw param is `string | null`
  // so the cast is needed to satisfy verifyOtp's signature.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";

  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  const supabase = await createServerSupabase();

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) return NextResponse.redirect(new URL(safeNext, url.origin));
    return NextResponse.redirect(new URL("/connexion?error=exchange-failed", url.origin));
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(safeNext, url.origin));
    return NextResponse.redirect(new URL("/connexion?error=exchange-failed", url.origin));
  }

  return NextResponse.redirect(new URL("/connexion?error=no-code", url.origin));
}
