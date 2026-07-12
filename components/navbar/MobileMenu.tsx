"use client";

import { useState } from "react";
import Link from "next/link";
import ClubLogo from "@/components/ui/ClubLogo";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";
import { GuestAuthTiles, LoggedInAuthTiles } from "./AuthTiles";
import PobierzNavLink, { isPobierzLink } from "./PobierzNavLink";
import { getPanelLabel } from "@/lib/panel-routes";
import { publicLinks } from "./navLinks";

type MobileMenuProps = {
  onLogout: () => void;
};

export default function MobileMenu({ onLogout }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const { user, profile, panelHref } = useAuth();

  const closeMenu = () => setOpen(false);

  const panelLabel = getPanelLabel(profile?.rola);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? "Zamknij menu" : "Otwórz menu"}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="relative z-[60] flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-lg border border-zks-gold-mid/30 bg-zks-charcoal/80 backdrop-blur-sm transition hover:border-zks-gold-mid hover:shadow-gold-glow-sm"
      >
        <motion.span
          animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
          className="block h-0.5 w-5 rounded-full bg-zks-gold-bright"
        />
        <motion.span
          animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
          className="block h-0.5 w-5 rounded-full bg-zks-gold-bright"
        />
        <motion.span
          animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
          className="block h-0.5 w-5 rounded-full bg-zks-gold-bright"
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[55] bg-black/80 backdrop-blur-md"
              onClick={closeMenu}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 right-0 z-[58] flex w-full max-w-sm flex-col border-l border-zks-gold-mid/20 bg-zks-black shadow-[-20px_0_60px_rgba(247,209,84,0.08)]"
            >
              <div className="flex items-center justify-between border-b border-zks-gold-mid/15 px-6 py-5">
                <div className="flex items-center gap-3">
                  <ClubLogo size={48} glow />
                  <div>
                    <p className="font-[family-name:var(--font-heading)] text-lg font-bold text-white">
                      ZKS
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-zks-gold-mid">
                      Białogard — Manager
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  aria-label="Zamknij menu"
                  onClick={closeMenu}
                  className="rounded-lg p-2 text-zks-gold-mid transition hover:bg-zks-charcoal hover:text-zks-gold-bright"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-6">
                {publicLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + index * 0.05 }}
                  >
                    {isPobierzLink(link.href) ? (
                      <PobierzNavLink
                        href={link.href}
                        label={link.label}
                        onNavigate={closeMenu}
                        className="group flex items-center rounded-xl px-4 py-4 font-[family-name:var(--font-heading)] text-base font-medium uppercase tracking-wide text-zks-text transition hover:bg-zks-charcoal hover:text-zks-gold-bright"
                      >
                        <span className="mr-3 h-1.5 w-1.5 rounded-full bg-zks-gold-mid opacity-0 transition group-hover:opacity-100" />
                        {link.label}
                      </PobierzNavLink>
                    ) : (
                      <Link
                        href={link.href}
                        onClick={closeMenu}
                        className="group flex items-center rounded-xl px-4 py-4 font-[family-name:var(--font-heading)] text-base font-medium uppercase tracking-wide text-zks-text transition hover:bg-zks-charcoal hover:text-zks-gold-bright"
                      >
                        <span className="mr-3 h-1.5 w-1.5 rounded-full bg-zks-gold-mid opacity-0 transition group-hover:opacity-100" />
                        {link.label}
                      </Link>
                    )}
                  </motion.div>
                ))}
              </nav>

              <div className="border-t border-zks-gold-mid/15 p-6">
                {user && profile ? (
                  <LoggedInAuthTiles
                    panelHref={panelHref}
                    panelLabel={panelLabel}
                    userName={profile.imie ?? user.email ?? "Użytkownik"}
                    userRole={profile.rola ?? "rodzic"}
                    onLogout={onLogout}
                    onNavigate={closeMenu}
                  />
                ) : (
                  <GuestAuthTiles onNavigate={closeMenu} compact />
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
