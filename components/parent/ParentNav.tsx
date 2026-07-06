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
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { fetchNotifications } from "@/lib/notifications-client";

import ParentMobileNav from "./ParentMobileNav";

const links = [
  { href: "/panel-rodzica", label: "Panel", icon: Home },
  { href: "/panel-rodzica/moje-dzieci", label: "Moje dzieci", icon: Baby },
  { href: "/zawody", label: "Zawody", icon: CalendarDays },
  { href: "/aktualnosci", label: "Aktualności", icon: Newspaper },
  { href: "/panel-rodzica/powiadomienia", label: "Powiadomienia", icon: Bell, badge: true },
  { href: "/panel-rodzica/moje-zgloszenia", label: "Zgłoszenia", icon: ClipboardList },
  { href: "/panel-rodzica/wyniki", label: "Wyniki", icon: Trophy },
  { href: "/panel-rodzica/profil", label: "Profil", icon: User },
];

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== "/panel-rodzica" && pathname.startsWith(href));
}

export default function ParentNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnread();

    const interval = window.setInterval(loadUnread, 60000);
    return () => window.clearInterval(interval);
  }, []);

  async function loadUnread() {
    try {
      const result = await fetchNotifications();
      setUnreadCount(result.unreadCount);
    } catch {
      setUnreadCount(0);
    }
  }

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
            const active = isActive(pathname, link.href);
            const showBadge = link.badge && unreadCount > 0;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex min-h-[48px] items-center gap-3 rounded-xl px-4 py-3 font-[family-name:var(--font-heading)] text-sm font-medium uppercase tracking-wide transition ${
                  active
                    ? "bg-zks-gold/15 text-zks-gold-bright shadow-gold-glow-sm"
                    : "text-zks-text hover:bg-zks-black hover:text-zks-gold-mid"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="flex-1">{link.label}</span>
                {showBadge && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 flex w-full min-h-[48px] items-center gap-3 rounded-xl px-4 py-3 text-sm text-red-400 transition hover:bg-red-500/10"
          >
            <LogOut className="h-5 w-5" />
            Wyloguj
          </button>
        </nav>
      </aside>

      <ParentMobileNav />
    </>
  );
}
