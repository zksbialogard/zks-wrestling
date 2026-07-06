export type NavLink = {
  label: string;
  href: string;
};

export const publicLinks: NavLink[] = [
  { label: "Strona główna", href: "/" },
  { label: "Klub", href: "/klub/o-klubie" },
  { label: "Zawody", href: "/zawody" },
  { label: "Aktualności", href: "/aktualnosci" },
  { label: "Pobierz", href: "/pobierz" },
  { label: "Kontakt", href: "/kontakt" },
];

export const parentLinks: NavLink[] = [
  { label: "Panel Rodzica", href: "/panel-rodzica" },
  { label: "Moje dzieci", href: "/moje-dzieci" },
];

export const adminLinks: NavLink[] = [
  { label: "Dashboard", href: "/admin" },
  { label: "Zawody", href: "/admin/zawody" },
  { label: "Posty", href: "/admin/posty" },
];