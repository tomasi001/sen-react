import { DirectoryTeaser } from "@/components/home/DirectoryTeaser";
import { PageHeroImage } from "@/components/content/PageHeroImage";
import { Domaines } from "@/components/home/Domaines";
import { Hero } from "@/components/home/Hero";
import { LatestNews } from "@/components/home/LatestNews";
import { PartnerStrip } from "@/components/home/PartnerStrip";
import { Programmes } from "@/components/home/Programmes";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://senreact.vercel.app";

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Sen React",
  alternateName: "Réseau des Entrepreneurs Actifs",
  url: BASE_URL,
  logo: `${BASE_URL}/logo-react.jpg`,
  description:
    "Plateforme dédiée à la transition numérique et écologique des entrepreneurs sénégalais et africains.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Sacrée Coeur 3 Lot N° 128/B",
    addressLocality: "Dakar",
    addressCountry: "SN",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: "senreactsen@gmail.com",
  },
  sameAs: [
    "https://instagram.com/senreact",
    "https://linkedin.com/company/senreact",
    "https://youtube.com/@senreact",
  ],
};

// ISR: regenerate every 5 min — matches the CMS fetch revalidation window.
// DirectoryTeaser now uses the service-role client (no cookies) so the
// page is cache-eligible. Supabase env guard in listDirectoryProfiles
// returns [] gracefully when env vars are absent (CI build).
export const revalidate = 300;

/**
 * Homepage shell — Phase 2 step 2 per the roadmap §4.
 *
 * Sections, top to bottom: Hero → Domaines (4 pillars) → Programmes
 * (Sen React headline + 3 placeholders awaiting Q1) → LatestNews
 * (Phase 3 placeholder) → PartnerStrip (real list pending). Each
 * section is its own component to keep this composition file
 * trivially scannable and to make per-section A/B-style tweaks
 * easy in later phases.
 *
 * Phase 0's "Plateforme en cours de construction" placeholder + the
 * 10-sectors list are now retired from the homepage — sectors get
 * their own routes in Phase 2 step 6 (Sector pages × 10) and the
 * "construction" wording is no longer needed once real content
 * lives here.
 */
export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <main>
        <PageHeroImage pageKey="accueil" />
        <Hero />
        <DirectoryTeaser />
        <Domaines />
        <Programmes />
        <LatestNews />
        <PartnerStrip />
      </main>
    </>
  );
}
