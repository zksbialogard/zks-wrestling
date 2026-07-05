"use client";

import Link from "next/link";
import { LayoutDashboard, LogOut } from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";

interface UserMenuProps {
  onLogout: () => void;
}

export default function UserMenu({ onLogout }: UserMenuProps) {
  const { user, profile, panelHref } = useAuth();

  if (!user || !profile) {
    return (
      <div className="hidden items-center gap-2 lg:flex">
        <Link href="/login" className="zks-btn-outline px-4 py-2.5 text-xs">
          Zaloguj się
        </Link>
        <Link href="/rejestracja" className="zks-btn-primary px-4 py-2.5 text-xs">
          Zarejestruj się
        </Link>
      </div>
    );
  }

  return (
    <div className="hidden items-center gap-3 lg:flex">
      <Link
        href={panelHref}
        className="zks-btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-xs"
      >
        <LayoutDashboard className="h-4 w-4" />
        {profile.rola === "admin" ? "Panel admina" : "Panel rodzica"}
      </Link>

      <div className="text-right">
        <p className="text-sm font-semibold text-white">{profile.imie}</p>
        <p className="text-xs capitalize text-zks-gold-mid">{profile.rola}</p>
      </div>

      <button
        type="button"
        onClick={onLogout}
        className="rounded-lg border border-red-500/60 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500 hover:text-white"
      >
        <LogOut className="mr-1 inline h-4 w-4" />
        Wyloguj
      </button>
    </div>
  );
}
