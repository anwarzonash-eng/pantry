"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Recipes" },
  { href: "/plan", label: "Plan" },
  { href: "/shopping", label: "Shopping" },
  { href: "/pantry", label: "Pantry" },
  { href: "/import", label: "Import" },
  { href: "/settings", label: "Settings" },
];

export function NavLinks() {
  const path = usePathname();
  const active = (href: string) => (href === "/" ? path === "/" || path.startsWith("/recipes") : path.startsWith(href));
  return (
    <div className="nav-links">
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} aria-current={active(l.href) ? "page" : undefined}>
          {l.label}
        </Link>
      ))}
    </div>
  );
}
