"use client";

import type { SiteHeaderGlobal } from "@sen-react/shared";
import { useEffect, useState } from "react";

import { NavLink } from "./NavLink";

type NavItem = NonNullable<SiteHeaderGlobal["navItems"]>[number];

interface MobileNavProps {
  navItems: NavItem[];
  /** Server-rendered auth slot (AuthNav) — passed through and shown in the drawer. */
  children: React.ReactNode;
}

/**
 * Mobile header navigation — a standard hamburger button that opens a
 * full-width dropdown drawer with the nav links stacked vertically plus the
 * auth slot. Replaces the old flex-wrap pills that piled up into several
 * messy rows on small screens. Rendered only below `lg` (the parent hides it
 * on desktop, where the inline nav is used instead).
 */
export function MobileNav({ navItems, children }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  // Close on Escape and lock body scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        className="inline-flex h-10 w-10 items-center justify-center rounded-md text-[color:var(--color-fg)] hover:bg-[color:var(--color-border)]/40"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="h-6 w-6"
        >
          {open ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          ) : (
            <>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </>
          )}
        </svg>
      </button>

      {open ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
          <div
            id="mobile-nav-panel"
            className="absolute left-0 right-0 top-full z-50 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-[color:var(--color-border)] bg-white shadow-lg"
          >
            <nav
              aria-label="Primary"
              className="mx-auto max-w-6xl px-4 py-3"
              onClick={() => setOpen(false)}
            >
              <ul className="flex flex-col">
                {navItems.map((item) => (
                  <li key={`${item.href}-${item.label}`}>
                    <NavLink
                      href={item.href}
                      external={item.external}
                      className="block rounded-md px-3 py-3 text-base font-medium text-[color:var(--color-fg)] hover:bg-[color:var(--color-border)]/40 hover:text-[color:var(--color-accent)]"
                      activeClassName="block rounded-md bg-[color:var(--color-accent)]/10 px-3 py-3 text-base font-medium text-[color:var(--color-accent)]"
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
              <div className="mt-3 border-t border-[color:var(--color-border)] px-3 pt-4">
                {children}
              </div>
            </nav>
          </div>
        </>
      ) : null}
    </>
  );
}
