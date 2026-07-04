"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  {
    name: "Panel główny",
    href: "/panel-rodzica",
    icon: "🏠",
  },
  {
    name: "Moje dzieci",
    href: "/panel-rodzica/moje-dzieci",
    icon: "👦",
  },
  {
    name: "Moje zgłoszenia",
    href: "/panel-rodzica/moje-zgloszenia",
    icon: "📝",
  },
  {
    name: "Wyniki",
    href: "/panel-rodzica/wyniki",
    icon: "🏆",
  },
  {
    name: "Profil",
    href: "/panel-rodzica/profil",
    icon: "👤",
  },
];

export default function ParentSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-zinc-900 border-r border-yellow-500 min-h-screen p-6">

      <h2 className="text-3xl font-bold text-yellow-400 mb-10">
        Panel Rodzica
      </h2>

      <div className="space-y-2">

        {menu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded-xl px-4 py-3 transition ${
              pathname === item.href
                ? "bg-yellow-500 text-black font-bold"
                : "text-white hover:bg-zinc-800"
            }`}
          >
            {item.icon} {item.name}
          </Link>
        ))}

      </div>
    </aside>
  );
}