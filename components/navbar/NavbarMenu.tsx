"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import PobierzNavLink, { isPobierzLink } from "./PobierzNavLink";
import { publicLinks } from "./navLinks";

export default function NavbarMenu() {
  const pathname = usePathname();

  return (
    <nav className="hidden flex-1 items-center justify-center gap-2 xl:gap-3 lg:flex">
      {publicLinks.map((link) => {
        const active =
          pathname === link.href ||
          (link.href !== "/" && pathname.startsWith(link.href));

        const className = `group relative px-5 py-2 font-[family-name:var(--font-heading)] text-sm font-medium uppercase tracking-wide transition-colors xl:px-6 ${
          active
            ? "text-zks-gold-bright"
            : "text-zks-text hover:text-zks-gold-mid"
        }`;

        if (isPobierzLink(link.href)) {
          return (
            <PobierzNavLink
              key={link.href}
              href={link.href}
              label={link.label}
              className={className}
            >
              {link.label}
              <span
                className={`absolute bottom-0 left-5 right-5 h-0.5 rounded-full bg-zks-gold transition-transform duration-300 xl:left-6 xl:right-6 ${
                  active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </PobierzNavLink>
          );
        }

        return (
          <Link key={link.href} href={link.href} className={className}>
            {link.label}

            <span
              className={`absolute bottom-0 left-5 right-5 h-0.5 rounded-full bg-zks-gold transition-transform duration-300 xl:left-6 xl:right-6 ${
                active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
              }`}
            />
          </Link>
        );
      })}
    </nav>
  );
}
