"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  Dumbbell,
  Home,
  Images,
  LayoutDashboard,
  LogOut,
  Mail,
  Newspaper,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";

import ClubLogo from "@/components/ui/ClubLogo";
import { publicLinks } from "@/components/navbar/navLinks";

const menu = [
  { id: "dashboard", name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { id: "zawody", name: "Zawody", href: "/admin/zawody", icon: Trophy },
  { id: "zawodnicy", name: "Zawodnicy", href: "/admin/zawodnicy", icon: Users },
  { id: "treningi", name: "Treningi", href: "/admin/treningi", icon: Dumbbell },
  { id: "rodzice", name: "Rodzice", href: "/admin/uzytkownicy", icon: UserRound },
  { id: "zgloszenia", name: "Zgłoszenia", href: "/admin/zgloszenia", icon: ClipboardList },
  { id: "aktualnosci", name: "Aktualności", href: "/admin/aktualnosci", icon: Newspaper },
  { id: "szablony", name: "Szablony", href: "/admin/szablony", icon: Mail },
  { id: "galeria", name: "Galeria", href: "/admin/galeria", icon: Images },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-72 shrink-0 flex-col border-r border-zks-gold-mid/15 bg-zks-charcoal lg:flex">
      <div className="flex h-24 items-center gap-3 border-b border-zks-gold-mid/15 px-6">
        <ClubLogo size={48} glow />
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-xl font-bold text-white">
            ZKS
          </h1>
          <p className="text-[10px] uppercase tracking-[0.25em] text-zks-gold-mid">
            Admin — Manager
          </p>
        </div>
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
              className={`flex items-center gap-3 rounded-xl px-4 py-3 font-[family-name:var(--font-heading)] text-sm font-medium uppercase tracking-wide transition ${
                active
                  ? "bg-zks-gold/15 text-zks-gold-bright shadow-gold-glow-sm"
                  : "text-zks-text hover:bg-zks-black hover:text-zks-gold-mid"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-zks-gold-mid/15 p-4">
        <p className="px-4 pb-1 text-[10px] uppercase tracking-[0.2em] text-zks-text-muted">
          Strona klubu
        </p>
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-4 py-3 font-[family-name:var(--font-heading)] text-sm font-medium uppercase tracking-wide text-zks-text transition hover:bg-zks-black hover:text-zks-gold-mid"
        >
          <Home className="h-5 w-5" />
          Strona główna
        </Link>
        {publicLinks.slice(1).map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-zks-text-muted transition hover:bg-zks-black hover:text-zks-gold-mid"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </aside>
  );
}

