"use client";

import Link from "next/link";
import { LayoutDashboard, LogOut } from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";
import { GuestAuthTiles } from "./AuthTiles";
import { getPanelButtonLabel } from "@/lib/panel-routes";
import { canAccessPanel, getRoleLabel, isGuestRole } from "@/lib/user-roles";

interface UserMenuProps {
  onLogout: () => void;
}

export default function UserMenu({ onLogout }: UserMenuProps) {
  const { user, profile, panelHref } = useAuth();

  if (!user || !profile) {
    return (
      <div className="hidden lg:block">
        <GuestAuthTiles />
      </div>
    );
  }

  const isGuest = isGuestRole(profile.rola);
  const showPanel = canAccessPanel(profile.rola);

  return (
    <div className="hidden items-center gap-3 lg:flex">
      {showPanel ? (
        <Link
          href={panelHref}
          className="zks-btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-xs"
        >
          <LayoutDashboard className="h-4 w-4" />
          {getPanelButtonLabel(profile.rola)}
        </Link>
      ) : null}

      <div className="text-right">
        <p className="text-sm font-semibold text-white">{profile.imie}</p>
        <p className="text-xs text-zks-gold-mid">{getRoleLabel(profile.rola)}</p>
        {isGuest ? (
          <p className="text-[10px] text-zks-text-muted">Tylko podgląd strony</p>
        ) : null}
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
