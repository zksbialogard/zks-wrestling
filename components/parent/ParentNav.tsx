"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Baby,
  CalendarDays,
  ClipboardList,
  Home,
  LogOut,
  Newspaper,
  Trophy,
  User,
} from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";

const links = [
  { href: "/panel-rodzica", label: "Panel", icon: Home },
  { href: "/panel-rodzica/moje-dzieci", label: "Dzieci", icon: Baby },
  { href: "/zawody", label: "Zawody", icon: CalendarDays },
  { href: "/aktualnosci", label: "News", icon: Newspaper },
  { href: "/panel-rodzica/powiadomienia", label: "Powiadomienia", icon: Bell },
  { href: "/panel-rodzica/moje-zgloszenia", label: "Zgłoszenia", icon: ClipboardList },
  { href: "/panel-rodzica/wyniki", label: "Wyniki", icon: Trophy },
  { href: "/panel-rodzica/profil", label: "Profil", icon: User },
];

export default function ParentNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-zks-gold-mid/15 bg-zks-charcoal lg:block">
        <nav className="space-y-1 p-4">
          {links.map((link) => {
            const Icon = link.icon;
            const active =
              pathname === link.href ||
              (link.href !== "/panel-rodzica" && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 font-[family-name:var(--font-heading)] text-sm font-medium uppercase tracking-wide transition ${
                  active
                    ? "bg-zks-gold/15 text-zks-gold-bright shadow-gold-glow-sm"
                    : "text-zks-text hover:bg-zks-black hover:text-zks-gold-mid"
                }`}
              >
                <Icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-red-400 transition hover:bg-red-500/10"
          >
            <LogOut className="h-5 w-5" />
            Wyloguj
          </button>
        </nav>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zks-gold-mid/20 bg-zks-black/95 backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-4 gap-1 px-2 py-2">
          {links.slice(0, 4).map((link) => {
            const Icon = link.icon;
            const active =
              pathname === link.href ||
              (link.href !== "/panel-rodzica" && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-medium uppercase tracking-wide transition ${
                  active ? "text-zks-gold-bright" : "text-zks-text-muted"
                }`}
              >
                <Icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
