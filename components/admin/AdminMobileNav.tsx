"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  Home,
  Images,
  LayoutDashboard,
  LogOut,
  Newspaper,
  Trophy,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import ClubLogo from "@/components/ui/ClubLogo";
import { publicLinks } from "@/components/navbar/navLinks";

const menu = [
  { id: "dashboard", name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { id: "zawody", name: "Zawody", href: "/admin/zawody", icon: Trophy },
  { id: "zawodnicy", name: "Zawodnicy", href: "/admin/zawodnicy", icon: Users },
  { id: "rodzice", name: "Rodzice", href: "/admin/uzytkownicy", icon: UserRound },
  { id: "zgloszenia", name: "Zgłoszenia", href: "/admin/zgloszenia", icon: ClipboardList },
  { id: "aktualnosci", name: "Aktualności", href: "/admin/aktualnosci", icon: Newspaper },
  { id: "galeria", name: "Galeria", href: "/admin/galeria", icon: Images },
];

type AdminMobileNavProps = {
  onLogout: () => void;
};

export default function AdminMobileNav({ onLogout }: AdminMobileNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Zamknij menu" : "Otwórz menu"}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="relative z-[70] flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-lg border border-zks-gold-mid/30 bg-zks-charcoal/80 backdrop-blur-sm transition hover:border-zks-gold-mid hover:shadow-gold-glow-sm lg:hidden"
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
              className="fixed inset-0 z-[65] bg-black/80 backdrop-blur-sm lg:hidden"
              onClick={() => setOpen(false)}
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
                  <ClubLogo size={44} glow />
                  <div>
                    <p className="font-[family-name:var(--font-heading)] text-lg font-bold text-white">
                      Admin
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-zks-gold-mid">
                      ZKS Manager
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  aria-label="Zamknij menu"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-2 text-zks-gold-mid transition hover:bg-zks-charcoal hover:text-zks-gold-bright"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 space-y-1 overflow-y-auto p-4">
                {menu.map((item) => {
                  const Icon = item.icon;
                  const active =
                    pathname === item.href ||
                    (item.href !== "/admin" && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 font-[family-name:var(--font-heading)] text-sm font-medium uppercase tracking-wide transition ${
                        active
                          ? "bg-zks-gold/15 text-zks-gold-bright"
                          : "text-zks-text hover:bg-zks-charcoal"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}

                <div className="pt-4">
                  <p className="px-4 pb-2 text-[10px] uppercase tracking-[0.2em] text-zks-text-muted">
                    Strona klubu
                  </p>
                  {publicLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zks-text transition hover:bg-zks-charcoal hover:text-zks-gold-mid"
                    >
                      {link.href === "/" ? <Home className="h-5 w-5" /> : null}
                      {link.label}
                    </Link>
                  ))}
                </div>
              </nav>

              <div className="border-t border-zks-gold-mid/15 p-4">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onLogout();
                  }}
                  className="zks-btn-outline flex w-full items-center justify-center gap-2 py-3 text-sm text-red-300"
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
