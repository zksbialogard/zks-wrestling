import type { LucideIcon } from "lucide-react";
import {
  ClipboardList,
  Dumbbell,
  Images,
  LayoutDashboard,
  Mail,
  Newspaper,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";

export type AdminNavItem = {
  id: string;
  name: string;
  href: string;
  icon: LucideIcon;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
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

export const ADMIN_BOTTOM_PRIMARY: AdminNavItem[] = [
  ADMIN_NAV_ITEMS[0],
  ADMIN_NAV_ITEMS[1],
  ADMIN_NAV_ITEMS[5],
  ADMIN_NAV_ITEMS[3],
];

export const ADMIN_BOTTOM_MORE: AdminNavItem[] = [
  ADMIN_NAV_ITEMS[2],
  ADMIN_NAV_ITEMS[4],
  ADMIN_NAV_ITEMS[6],
  ADMIN_NAV_ITEMS[8],
  ADMIN_NAV_ITEMS[7],
];

export function isAdminNavActive(pathname: string, href: string) {
  return pathname === href || (href !== "/admin" && pathname.startsWith(href));
}
