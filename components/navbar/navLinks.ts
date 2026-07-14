export type NavLink = {
  label: string;
  href: string;
};

export const publicLinks: NavLink[] = [
  { label: "Strona główna", href: "/" },
  { label: "Klub", href: "/klub/o-klubie" },
  { label: "Kalendarz imprez", href: "/kalendarz-imprez" },
  { label: "Wyniki zawodów", href: "/zawody/wyniki-zawodow" },
  { label: "Aktualności", href: "/aktualnosci" },
  { label: "Wideo", href: "/wideo" },
  { label: "Pobierz Aplikację", href: "/pobierz" },
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