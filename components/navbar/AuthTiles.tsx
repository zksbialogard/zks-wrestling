"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  LogIn,
  LogOut,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

type TileLinkProps = {
  href: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  variant?: "gold" | "outline" | "danger";
  onClick?: () => void;
};

function AuthTile({
  href,
  icon: Icon,
  title,
  subtitle,
  variant = "outline",
  onClick,
}: TileLinkProps) {
  const iconWrap =
    variant === "gold"
      ? "border-zks-gold-bright/40 bg-zks-gold-bright/10 text-zks-gold-bright"
      : variant === "danger"
        ? "border-red-500/40 bg-red-500/10 text-red-400"
        : "border-zks-gold-mid/30 bg-zks-gold-mid/10 text-zks-gold-bright";

  const cardHover =
    variant === "danger"
      ? "hover:border-red-400/50 hover:shadow-[0_0_24px_rgba(239,68,68,0.15)]"
      : "hover:border-zks-gold-bright/50 hover:shadow-gold-glow-sm";

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`zks-card group flex flex-col items-center gap-2.5 p-4 text-center transition ${cardHover}`}
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl border transition group-hover:scale-105 ${iconWrap}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-[family-name:var(--font-heading)] text-xs font-bold uppercase tracking-wide text-white">
          {title}
        </p>
        <p className="mt-0.5 text-[10px] leading-snug text-zks-text-muted">{subtitle}</p>
      </div>
    </Link>
  );
}

function AuthTileButton({
  icon: Icon,
  title,
  subtitle,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="zks-card group flex w-full flex-col items-center gap-2.5 p-4 text-center transition hover:border-red-400/50 hover:shadow-[0_0_24px_rgba(239,68,68,0.15)]"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/40 bg-red-500/10 text-red-400 transition group-hover:scale-105">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-[family-name:var(--font-heading)] text-xs font-bold uppercase tracking-wide text-red-300">
          {title}
        </p>
        <p className="mt-0.5 text-[10px] leading-snug text-zks-text-muted">{subtitle}</p>
      </div>
    </button>
  );
}

type GuestAuthTilesProps = {
  onNavigate?: () => void;
  compact?: boolean;
};

export function GuestAuthTiles({ onNavigate, compact = false }: GuestAuthTilesProps) {
  return (
    <div className={`grid gap-3 ${compact ? "grid-cols-2" : "grid-cols-2 sm:max-w-xs"}`}>
      <AuthTile
        href="/login"
        icon={LogIn}
        title="Zaloguj się"
        subtitle="Wejdź do panelu"
        onClick={onNavigate}
      />
      <AuthTile
        href="/rejestracja"
        icon={UserPlus}
        title="Zarejestruj się"
        subtitle="Dołącz do klubu"
        variant="gold"
        onClick={onNavigate}
      />
    </div>
  );
}

type LoggedInAuthTilesProps = {
  panelHref: string;
  panelLabel: string;
  userName: string;
  userRole: string;
  onLogout: () => void;
  onNavigate?: () => void;
};

export function LoggedInAuthTiles({
  panelHref,
  panelLabel,
  userName,
  userRole,
  onLogout,
  onNavigate,
}: LoggedInAuthTilesProps) {
  return (
    <div className="space-y-3">
      <div className="zks-card px-4 py-3 text-center">
        <p className="font-[family-name:var(--font-heading)] text-sm font-bold text-white">
          {userName}
        </p>
        <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-zks-gold-mid">
          {userRole}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <AuthTile
          href={panelHref}
          icon={LayoutDashboard}
          title={panelLabel}
          subtitle="Zarządzaj kontem"
          variant="gold"
          onClick={onNavigate}
        />
        <AuthTileButton
          icon={LogOut}
          title="Wyloguj"
          subtitle="Zakończ sesję"
          onClick={() => {
            onNavigate?.();
            onLogout();
          }}
        />
      </div>
    </div>
  );
}
