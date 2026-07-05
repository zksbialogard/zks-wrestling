"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { publicLinks } from "./navLinks";

export default function NavbarMenu() {
  const pathname = usePathname();

  return (
    <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
      {publicLinks.map((link) => {
        const active =
          pathname === link.href ||
          (link.href !== "/" && pathname.startsWith(link.href));

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`group relative px-4 py-2 font-[family-name:var(--font-heading)] text-sm font-medium uppercase tracking-wide transition-colors ${
              active
                ? "text-zks-gold-bright"
                : "text-zks-text hover:text-zks-gold-mid"
            }`}
          >
            {link.label}

            <span
              className={`absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-zks-gold transition-transform duration-300 ${
                active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
              }`}
            />
          </Link>
        );
      })}
    </nav>
  );
}
