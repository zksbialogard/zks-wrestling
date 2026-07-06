"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Baby,
  CalendarDays,
  ClipboardList,
  Home,
  LogOut,
  Menu,
  Newspaper,
  Trophy,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import ClubLogo from "@/components/ui/ClubLogo";
import { fetchNotifications } from "@/lib/notifications-client";

const primaryLinks = [
  { href: "/panel-rodzica", label: "Panel", icon: Home },
  { href: "/panel-rodzica/moje-dzieci", label: "Dzieci", icon: Baby },
  { href: "/panel-rodzica/moje-zgloszenia", label: "Zgłoszenia", icon: ClipboardList },
  { href: "/panel-rodzica/powiadomienia", label: "Powiadomienia", icon: Bell, badge: true },
];

const moreLinks = [
  { href: "/zawody", label: "Zawody", icon: CalendarDays },
  { href: "/aktualnosci", label: "Aktualności", icon: Newspaper },
  { href: "/panel-rodzica/wyniki", label: "Wyniki", icon: Trophy },
  { href: "/panel-rodzica/profil", label: "Profil", icon: User },
];

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== "/panel-rodzica" && pathname.startsWith(href));
}

export default function ParentMobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
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
    setDrawerOpen(false);
    await logout();
    router.push("/login");
  };

  const moreActive = moreLinks.some((link) => isActive(pathname, link.href));

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zks-gold-mid/20 bg-zks-black/95 backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-0.5 px-1 py-1.5">
          {primaryLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(pathname, link.href);
            const showBadge = link.badge && unreadCount > 0;

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

          <button
            type="button"
            aria-label="Więcej opcji"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
            className={`flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[10px] font-medium uppercase tracking-wide transition ${
              moreActive || drawerOpen
                ? "bg-zks-gold/10 text-zks-gold-bright"
                : "text-zks-text-muted active:bg-zks-charcoal"
            }`}
          >
            <Menu className="h-5 w-5 shrink-0" />
            Więcej
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[65] bg-black/80 backdrop-blur-sm lg:hidden"
              onClick={() => setDrawerOpen(false)}
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 right-0 z-[68] flex w-full max-w-sm flex-col border-l border-zks-gold-mid/20 bg-zks-black shadow-[-20px_0_60px_rgba(247,209,84,0.08)] lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-zks-gold-mid/15 px-5 py-5">
                <div className="flex items-center gap-3">
                  <ClubLogo size={40} glow />
                  <div>
                    <p className="font-[family-name:var(--font-heading)] text-lg font-bold text-white">
                      Panel rodzica
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-zks-gold-mid">
                      Menu
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  aria-label="Zamknij menu"
                  onClick={() => setDrawerOpen(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-lg text-zks-gold-mid transition hover:bg-zks-charcoal hover:text-zks-gold-bright"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 space-y-1 overflow-y-auto p-4">
                {[...primaryLinks, ...moreLinks].map((link) => {
                  const Icon = link.icon;
                  const active = isActive(pathname, link.href);
                  const showBadge = "badge" in link && link.badge && unreadCount > 0;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setDrawerOpen(false)}
                      className={`flex min-h-[48px] items-center gap-3 rounded-xl px-4 py-3 font-[family-name:var(--font-heading)] text-sm font-medium uppercase tracking-wide transition ${
                        active
                          ? "bg-zks-gold/15 text-zks-gold-bright shadow-gold-glow-sm"
                          : "text-zks-text hover:bg-zks-charcoal hover:text-zks-gold-mid"
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
              </nav>

              <div className="border-t border-zks-gold-mid/15 p-4">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="zks-btn-outline flex w-full min-h-[48px] items-center justify-center gap-2 py-3 text-sm text-red-300"
                >
                  <LogOut className="h-4 w-4" />
                  Wyloguj
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
