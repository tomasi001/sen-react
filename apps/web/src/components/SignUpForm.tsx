"use client";

import { useActionState, useState } from "react";

import { PROFILE_TYPES, type ProfileTypeSlug } from "@sen-react/shared";

import type { AuthFormState } from "@/lib/auth";

interface SignUpFormProps {
  action: (prevState: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  emailLabel: string;
  passwordLabel: string;
  submitLabel: string;
  passwordHint: string;
  pendingLabel: string;
}

const INITIAL_STATE: AuthFormState = { status: "idle" };

// Only the 4 public signup paths — admin profiles are seeded server-side.
const PUBLIC_PROFILE_TYPES = PROFILE_TYPES.filter((p) => p.slug !== "admin");

/**
 * Sign-up form with discriminated per-type fields.
 *
 * Type selection is via radio cards (keyboard-accessible + obvious tap
 * target on mobile). Selected type drives which extra fields render —
 * client-state only (the server-action schema is the authoritative
 * validator).
 *
 * Parental-consent flow (15–17 yo entrepreneurs): when the `is_minor`
 * checkbox toggles, `parental_consent` + optional `parent_email` appear.
 * Server-side Zod refinement enforces consent must be checked when
 * is_minor is set.
 */
export function SignUpForm({
  action,
  emailLabel,
  passwordLabel,
  submitLabel,
  passwordHint,
  pendingLabel,
}: SignUpFormProps) {
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);
  const [profileType, setProfileType] = useState<ProfileTypeSlug>("entrepreneur");
  const [isMinor, setIsMinor] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-medium">Vous êtes…</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {PUBLIC_PROFILE_TYPES.map((t) => {
            const checked = profileType === t.slug;
            return (
              <label
                key={t.slug}
                className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm transition-colors ${
                  checked
                    ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent)]/5"
                    : "border-slate-300 hover:border-slate-400"
                }`}
              >
                <input
                  type="radio"
                  name="profile_type"
                  value={t.slug}
                  checked={checked}
                  onChange={() => setProfileType(t.slug)}
                  className="mt-0.5"
                  required
                />
                <span className="flex flex-col">
                  <span className="font-semibold">{t.fr}</span>
                  <span className="text-xs text-[color:var(--color-muted)]">{t.description}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label htmlFor="display_name" className="mb-1 block text-sm font-medium">
          {profileType === "organisation" || profileType === "partner"
            ? "Nom de la personne contact"
            : profileType === "government"
              ? "Nom de l'agent référent"
              : "Nom complet"}
        </label>
        <input
          id="display_name"
          name="display_name"
          type="text"
          required
          maxLength={120}
          autoComplete="name"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[color:var(--color-accent)] focus:outline-none"
        />
      </div>

      {profileType === "organisation" ? (
        <div>
          <label htmlFor="organisation_name" className="mb-1 block text-sm font-medium">
            Nom de l&apos;organisation
          </label>
          <input
            id="organisation_name"
            name="organisation_name"
            type="text"
            required
            maxLength={200}
            autoComplete="organization"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[color:var(--color-accent)] focus:outline-none"
          />
        </div>
      ) : null}

      {profileType === "government" ? (
        <>
          <div>
            <label htmlFor="ministry_name" className="mb-1 block text-sm font-medium">
              Ministère ou agence
            </label>
            <input
              id="ministry_name"
              name="ministry_name"
              type="text"
              required
              maxLength={200}
              autoComplete="organization"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[color:var(--color-accent)] focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="government_role" className="mb-1 block text-sm font-medium">
              Fonction <span className="text-[color:var(--color-muted)]">(facultatif)</span>
            </label>
            <input
              id="government_role"
              name="government_role"
              type="text"
              maxLength={120}
              autoComplete="organization-title"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[color:var(--color-accent)] focus:outline-none"
            />
          </div>
        </>
      ) : null}

      {profileType === "partner" ? (
        <div>
          <label htmlFor="partner_org_name" className="mb-1 block text-sm font-medium">
            Nom de l&apos;organisation partenaire
          </label>
          <input
            id="partner_org_name"
            name="partner_org_name"
            type="text"
            required
            maxLength={200}
            autoComplete="organization"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[color:var(--color-accent)] focus:outline-none"
          />
        </div>
      ) : null}

      {profileType === "entrepreneur" ? (
        <fieldset className="rounded-md border border-slate-200 bg-slate-50/50 p-3">
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              name="is_minor"
              checked={isMinor}
              onChange={(e) => setIsMinor(e.target.checked)}
              className="mt-1"
            />
            <span>J&apos;ai entre 15 et 17 ans (consentement parental requis)</span>
          </label>
          {isMinor ? (
            <div className="mt-3 space-y-3">
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" name="parental_consent" required className="mt-1" />
                <span>
                  Mon parent ou tuteur autorise la création de ce compte
                  <span className="ml-1 text-[color:var(--color-accent)]">*</span>
                </span>
              </label>
              <div>
                <label htmlFor="parent_email" className="mb-1 block text-sm font-medium">
                  E-mail du parent / tuteur{" "}
                  <span className="text-[color:var(--color-muted)]">(facultatif)</span>
                </label>
                <input
                  id="parent_email"
                  name="parent_email"
                  type="email"
                  maxLength={200}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[color:var(--color-accent)] focus:outline-none"
                />
              </div>
            </div>
          ) : null}
        </fieldset>
      ) : null}

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          {emailLabel}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[color:var(--color-accent)] focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          {passwordLabel}
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            minLength={8}
            className="w-full rounded-md border border-slate-300 px-3 py-2 pr-10 text-sm focus:border-[color:var(--color-accent)] focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-[color:var(--color-muted)] hover:text-[color:var(--color-fg)]"
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            )}
          </button>
        </div>
        <p className="mt-1 text-xs text-[color:var(--color-muted)]">{passwordHint}</p>
      </div>

      {state.status === "error" ? (
        <p
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {state.message}
        </p>
      ) : null}

      {state.status === "success" ? (
        <p
          role="status"
          className="rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700"
        >
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-[color:var(--color-accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {pending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
