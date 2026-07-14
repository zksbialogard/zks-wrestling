import type { LucideIcon } from "lucide-react";
import { Images, Film, LayoutDashboard, Newspaper, Trophy } from "lucide-react";

export type ModeratorNavItem = {
  id: string;
  name: string;
  href: string;
  icon: LucideIcon;
  description: string;
};

export const MODERATOR_NAV_ITEMS: ModeratorNavItem[] = [
  {
    id: "dashboard",
    name: "Szybki dostęp",
    href: "/moderator",
    icon: LayoutDashboard,
    description: "Skróty do najważniejszych sekcji",
  },
  {
    id: "aktualnosci",
    name: "Aktualności",
    href: "/moderator/aktualnosci",
    icon: Newspaper,
    description: "Dodawaj i edytuj komunikaty klubowe",
  },
  {
    id: "galeria",
    name: "Galeria",
    href: "/moderator/galeria",
    icon: Images,
    description: "Publikuj zdjęcia z wydarzeń",
  },
  {
    id: "wideo",
    name: "Wideo",
    href: "/moderator/wideo",
    icon: Film,
    description: "Dodawaj filmy z YouTube lub krótkie nagrania",
  },
  {
    id: "zawody",
    name: "Zawody",
    href: "/moderator/zawody",
    icon: Trophy,
    description: "Twórz i zarządzaj zawodami",
  },
];

export function isModeratorNavActive(pathname: string, href: string) {
  return pathname === href || (href !== "/moderator" && pathname.startsWith(href));
}
