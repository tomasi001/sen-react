import type { SiteHeaderGlobal } from "@sen-react/shared";
import Link from "next/link";

import { AuthNav } from "./AuthNav";
import { MobileNav } from "./MobileNav";
import { NavLink } from "./NavLink";
import { SiteLogo } from "./SiteLogo";

interface SiteHeaderProps {
  data: SiteHeaderGlobal;
}

export function SiteHeader({ data }: SiteHeaderProps) {
  const navItems = data.navItems ?? [];
  return (
    <header className="relative z-50 border-b border-[color:var(--color-border)] bg-white">
      <div className="mx-auto flex max-w-[1700px] items-center justify-between gap-x-6 px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <SiteLogo height={40} decorative />
          <span className="flex flex-col">
            <span className="whitespace-nowrap text-base font-semibold leading-tight">
              {data.siteTitle}
            </span>
            {data.tagline ? (
              <span className="hidden text-xs text-[color:var(--color-muted)] sm:block">
                {data.tagline}
              </span>
            ) : null}
          </span>
        </Link>

        {/* Desktop: inline nav + auth (lg and up). */}
        <div className="hidden items-center gap-x-6 gap-y-3 lg:flex lg:flex-wrap lg:justify-end">
          {navItems.length > 0 ? (
            <nav aria-label="Primary">
              <ul className="flex flex-wrap items-center gap-1.5">
                {navItems.map((item) => (
                  <li key={`${item.href}-${item.label}`}>
                    <NavLink
                      href={item.href}
                      external={item.external}
                      className="whitespace-nowrap rounded-full border border-[color:var(--color-border)] bg-white px-2.5 py-1.5 text-sm font-medium text-[color:var(--color-fg)] hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
                      activeClassName="whitespace-nowrap rounded-full border border-[color:var(--color-accent)] bg-[color:var(--color-accent)] px-2.5 py-1.5 text-sm font-medium text-white"
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          <AuthNav />
        </div>

        {/* Mobile: hamburger drawer (below lg). */}
        <div className="lg:hidden">
          <MobileNav navItems={navItems}>
            <AuthNav />
          </MobileNav>
        </div>
      </div>
    </header>
  );
}
