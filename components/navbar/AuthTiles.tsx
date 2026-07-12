"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  LayoutDashboard,
  LogIn,
  LogOut,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { loginAsGuest } from "@/lib/guest-auth";
import { getPanelButtonLabel } from "@/lib/panel-routes";
import { canAccessPanel, getRoleLabel, isGuestRole } from "@/lib/user-roles";

type TileLinkProps = {
  href: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  variant?: "gold" | "outline" | "danger";
  onClick?: () => void;
  className?: string;
};

function AuthTile({
  href,
  icon: Icon,
  title,
  subtitle,
  variant = "outline",
  onClick,
  className = "p-4",
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
      className={`zks-card group flex flex-col items-center gap-2.5 text-center transition ${cardHover} ${className}`}
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
  className = "p-4",
  variant = "default",
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  onClick: () => void;
  className?: string;
  variant?: "default" | "danger";
}) {
  const iconWrap =
    variant === "danger"
      ? "border-red-500/40 bg-red-500/10 text-red-400"
      : "border-zks-gold-mid/30 bg-zks-gold-mid/10 text-zks-gold-bright";

  const cardHover =
    variant === "danger"
      ? "hover:border-red-400/50 hover:shadow-[0_0_24px_rgba(239,68,68,0.15)]"
      : "hover:border-zks-gold-bright/50 hover:shadow-gold-glow-sm";

  const titleClass =
    variant === "danger" ? "text-red-300" : "text-white";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`zks-card group flex w-full flex-col items-center gap-2.5 text-center transition ${cardHover} ${className}`}
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl border transition group-hover:scale-105 ${iconWrap}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className={`font-[family-name:var(--font-heading)] text-xs font-bold uppercase tracking-wide ${titleClass}`}>
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
  const router = useRouter();
  const tilePadding = compact ? "p-3" : "p-4";

  const continueAsGuest = async () => {
    onNavigate?.();

    try {
      await loginAsGuest();
      toast.success("Tryb gościa — przeglądasz stronę bez panelu.");
      router.push("/");
    } catch {
      toast.error("Nie udało się wejść jako gość.");
    }
  };

  return (
    <div className={`grid grid-cols-3 gap-3 sm:gap-4 ${compact ? "" : "sm:max-w-md lg:max-w-none"}`}>
      <AuthTile
        href="/login"
        icon={LogIn}
        title="Zaloguj się"
        subtitle="Wejdź do konta"
        onClick={onNavigate}
        className={tilePadding}
      />
      <AuthTile
        href="/rejestracja"
        icon={UserPlus}
        title="Zarejestruj się"
        subtitle="Dołącz do klubu"
        variant="gold"
        onClick={onNavigate}
        className={tilePadding}
      />
      <AuthTileButton
        icon={Eye}
        title="Gość"
        subtitle="Tylko podgląd"
        onClick={continueAsGuest}
        className={tilePadding}
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
  const isGuest = isGuestRole(userRole);
  const showPanel = canAccessPanel(userRole);

  const panelButtonLabel = getPanelButtonLabel(userRole);

  return (
    <div className="space-y-3">
      <div className="zks-card px-4 py-3 text-center">
        <p className="font-[family-name:var(--font-heading)] text-sm font-bold text-white">
          {userName}
        </p>
        <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-zks-gold-mid">
          {getRoleLabel(userRole)}
        </p>
      </div>

      <div className={`grid gap-3 ${showPanel ? "grid-cols-2" : "grid-cols-1"}`}>
        {showPanel ? (
          <AuthTile
            href={panelHref}
            icon={LayoutDashboard}
            title={panelButtonLabel}
            subtitle={panelLabel}
            variant="gold"
            onClick={onNavigate}
          />
        ) : (
          <div className="zks-card px-4 py-3 text-center text-xs leading-relaxed text-zks-text-muted">
            {isGuest
              ? "Tryb gościa — przeglądasz stronę bez dostępu do paneli."
              : "Brak przypisanego panelu dla tej roli."}
          </div>
        )}
        <AuthTileButton
          icon={LogOut}
          title="Wyloguj"
          subtitle="Zakończ sesję"
          variant="danger"
          onClick={() => {
            onNavigate?.();
            onLogout();
          }}
        />
      </div>
    </div>
  );
}
