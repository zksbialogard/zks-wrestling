"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LogOut } from "lucide-react";

import {
  MODERATOR_NAV_ITEMS,
  isModeratorNavActive,
} from "@/lib/moderator-nav";

type ModeratorBottomNavProps = {
  onLogout: () => void;
};

export default function ModeratorBottomNav({ onLogout }: ModeratorBottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="admin-bottom-nav lg:hidden">
      <div className="admin-bottom-nav-inner">
        {MODERATOR_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isModeratorNavActive(pathname, item.href);

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
          onClick={onLogout}
          className="admin-bottom-nav-item text-red-300"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span>Wyloguj</span>
        </button>

        <Link href="/" className="admin-bottom-nav-item">
          <Home className="h-5 w-5 shrink-0" />
          <span>Strona</span>
        </Link>
      </div>
    </nav>
  );
}
