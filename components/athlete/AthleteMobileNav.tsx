"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CalendarDays,
  Dumbbell,
  Home,
  Images,
  LogOut,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

import { fetchNotifications } from "@/lib/notifications-client";

const links = [
  { href: "/panel-zawodnika", label: "Panel", icon: Home },
  { href: "/panel-zawodnika/treningi", label: "Treningi", icon: Dumbbell },
  { href: "/panel-zawodnika/zawody", label: "Zawody", icon: CalendarDays },
  { href: "/panel-zawodnika/galeria", label: "Galeria", icon: Images },
  { href: "/panel-zawodnika/powiadomienia", label: "Powiad.", icon: Bell, badge: true },
  { href: "/panel-zawodnika/profil", label: "Profil", icon: User },
];

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== "/panel-zawodnika" && pathname.startsWith(href));
}

export default function AthleteMobileNav() {
  const pathname = usePathname();
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

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zks-gold-mid/20 bg-zks-black/95 backdrop-blur-xl lg:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5 gap-0.5 px-1 py-1.5">
        {links.map((link) => {
          const Icon = link.icon;
          const active = isActive(pathname, link.href);
          const showBadge = Boolean(link.badge) && unreadCount > 0;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[10px] font-medium uppercase tracking-wide transition ${
                active
                  ? "bg-zks-gold/10 text-zks-gold-bright"
                  : "text-zks-text-muted active:bg-zks-charcoal"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="max-w-full truncate">{link.label}</span>
              {showBadge && (
                <span className="absolute right-2 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
