"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Home, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

import ClubLogo from "@/components/ui/ClubLogo";
import {
  ADMIN_BOTTOM_MORE,
  ADMIN_BOTTOM_PRIMARY,
  ADMIN_NAV_ITEMS,
  isAdminNavActive,
} from "@/lib/admin-nav";
import { publicLinks } from "@/components/navbar/navLinks";

type AdminBottomNavProps = {
  onLogout: () => void;
};

export default function AdminBottomNav({ onLogout }: AdminBottomNavProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const moreActive = ADMIN_BOTTOM_MORE.some((item) => isAdminNavActive(pathname, item.href));

  const handleLogout = () => {
    setDrawerOpen(false);
    onLogout();
  };

  return (
    <>
      <nav className="admin-bottom-nav lg:hidden">
        <div className="admin-bottom-nav-inner">
          {ADMIN_BOTTOM_PRIMARY.map((item) => {
            const Icon = item.icon;
            const active = isAdminNavActive(pathname, item.href);

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`admin-bottom-nav-item ${active ? "admin-bottom-nav-item-active" : ""}`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className={`admin-bottom-nav-item ${moreActive || drawerOpen ? "admin-bottom-nav-item-active" : ""}`}
          >
            <Menu className="h-5 w-5 shrink-0" />
            <span>Więcej</span>
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
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-x-0 bottom-0 z-[68] max-h-[85vh] overflow-hidden rounded-t-2xl border-t border-zks-gold-mid/20 bg-zks-black shadow-[0_-20px_60px_rgba(247,209,84,0.08)] lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-zks-gold-mid/15 px-5 py-4">
                <div className="flex items-center gap-3">
                  <ClubLogo size={40} glow />
                  <div>
                    <p className="font-[family-name:var(--font-heading)] text-lg font-bold text-white">
                      Admin
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-zks-gold-mid">
                      Wszystkie sekcje
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Zamknij menu"
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-lg p-2 text-zks-gold-mid transition hover:bg-zks-charcoal hover:text-zks-gold-bright"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="grid max-h-[50vh] grid-cols-2 gap-2 overflow-y-auto p-4">
                {ADMIN_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = isAdminNavActive(pathname, item.href);

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setDrawerOpen(false)}
                      className={`flex min-h-[72px] flex-col items-center justify-center gap-2 rounded-xl border px-2 py-3 text-center transition ${
                        active
                          ? "border-zks-gold-mid/40 bg-zks-gold/10 text-zks-gold-bright"
                          : "border-zks-gold-mid/15 bg-zks-charcoal/50 text-zks-text hover:border-zks-gold-mid/30"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                      <span className="text-[11px] font-medium uppercase tracking-wide">
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
              </nav>

              <div className="space-y-1 border-t border-zks-gold-mid/15 p-4">
                <p className="px-1 pb-1 text-[10px] uppercase tracking-[0.2em] text-zks-text-muted">
                  Strona klubu
                </p>
                <Link
                  href="/"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zks-text transition hover:bg-zks-charcoal"
                >
                  <Home className="h-5 w-5 text-zks-gold-bright" />
                  Strona główna
                </Link>
                {publicLinks.slice(1, 4).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setDrawerOpen(false)}
                    className="block rounded-xl px-3 py-2 text-sm text-zks-text-muted transition hover:bg-zks-charcoal hover:text-zks-gold-mid"
                  >
                    {link.label}
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/40 py-3 text-sm text-red-300 transition hover:bg-red-500/10"
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
