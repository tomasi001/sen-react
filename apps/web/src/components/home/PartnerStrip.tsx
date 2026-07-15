import Image from "next/image";
import Link from "next/link";

import { absoluteMediaUrl, listPartners } from "@/lib/cms";

export async function PartnerStrip() {
  const partners = await listPartners();
  if (partners.length === 0) return null;

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <header className="mb-10 max-w-2xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[color:var(--color-accent)]">
            Partenaires
          </p>
          <h2 className="text-3xl font-bold leading-tight">Nos partenaires</h2>
        </header>

        <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5">
          {partners.map((partner) => {
            const logoUrl =
              absoluteMediaUrl(
                typeof partner.logo === "object" && partner.logo ? partner.logo.url : null,
              ) ?? null;
            const logoAlt =
              typeof partner.logo === "object" && partner.logo
                ? (partner.logo.alt ?? partner.name)
                : partner.name;

            return (
              <li
                key={partner.slug}
                className="flex min-h-[5rem] items-center justify-center rounded-md border border-[color:var(--color-border)] px-4 py-4"
              >
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={logoAlt}
                    width={120}
                    height={60}
                    className="max-h-12 w-auto object-contain"
                  />
                ) : (
                  <span className="text-center text-xs font-semibold leading-tight text-[color:var(--color-fg)]">
                    {partner.name}
                  </span>
                )}
              </li>
            );
          })}
        </ul>

        <div className="mt-8">
          <Link
            href="/partenaires"
            className="text-sm font-semibold text-[color:var(--color-accent)] hover:underline"
          >
            Voir tous les partenaires →
          </Link>
        </div>
      </div>
    </section>
  );
}
