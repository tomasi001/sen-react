"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";

interface NavLinkProps {
  href: string;
  external?: boolean | null;
  className?: string;
  activeClassName?: string;
  children: React.ReactNode;
}

/**
 * Renders a CMS-driven link safely under Next 16's typedRoutes, with
 * active-state highlighting based on the current pathname.
 *
 * Active matching: exact for "/", prefix for all other paths so that
 * e.g. "/opportunites/123" highlights the "Opportunités" nav item.
 */
export function NavLink({ href, external, className, activeClassName, children }: NavLinkProps) {
  const pathname = usePathname();

  const isAbsolute = /^(https?:|mailto:|tel:)/.test(href);
  if (isAbsolute || external) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  const safeHref = href as unknown as Route;

  return (
    <Link href={safeHref} className={isActive ? (activeClassName ?? className) : className}>
      {children}
    </Link>
  );
}
