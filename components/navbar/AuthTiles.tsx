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
import { getPanelButtonLabel, hasModeratorPanelAccess, hasParentPanelAccess } from "@/lib/panel-routes";
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
  className = "p-5",
}: TileLinkProps) {
  const iconWrap =
    variant === "gold"
      ? "border-zks-gold-bright/45 bg-zks-gold-bright/10 text-zks-gold-bright"
      : variant === "danger"
        ? "border-red-400/40 bg-red-500/10 text-red-300"
        : "border-zks-gold-mid/40 bg-zks-gold-mid/10 text-zks-gold-bright";

  const cardHover =
    variant === "danger"
      ? "hover:border-red-400/55 hover:shadow-[var(--zks-glow-danger)]"
      : "hover:border-zks-gold-bright/55 hover:shadow-[var(--zks-glow-sm)]";

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`zks-card group flex flex-col items-center gap-2.5 text-center transition ${cardHover} ${className}`}
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl border-[1.5px] transition group-hover:scale-105 ${iconWrap}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-[family-name:var(--font-heading)] text-sm font-bold uppercase tracking-wide text-white">
          {title}
        </p>
        <p className="mt-1 text-xs leading-snug text-zks-text-muted">{subtitle}</p>
      </div>
    </Link>
  );
}

function AuthTileButton({
  icon: Icon,
  title,
  subtitle,
  onClick,
  className = "p-5",
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
      ? "border-red-400/40 bg-red-500/10 text-red-300"
      : "border-zks-gold-mid/40 bg-zks-gold-mid/10 text-zks-gold-bright";

  const cardHover =
    variant === "danger"
      ? "hover:border-red-400/55 hover:shadow-[var(--zks-glow-danger)]"
      : "hover:border-zks-gold-bright/55 hover:shadow-[var(--zks-glow-sm)]";

  const titleClass =
    variant === "danger" ? "text-red-300" : "text-white";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`zks-card group flex w-full flex-col items-center gap-2.5 text-center transition ${cardHover} ${className}`}
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl border-[1.5px] transition group-hover:scale-105 ${iconWrap}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className={`font-[family-name:var(--font-heading)] text-sm font-bold uppercase tracking-wide ${titleClass}`}>
          {title}
        </p>
        <p className="mt-1 text-xs leading-snug text-zks-text-muted">{subtitle}</p>
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
  const tilePadding = compact ? "p-4" : "p-5";

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
    <div className={`grid grid-cols-3 gap-3 sm:gap-4 ${compact ? "" : "w-full"}`}>
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
  const showDualPanels = hasModeratorPanelAccess(userRole) && hasParentPanelAccess(userRole);

  const panelButtonLabel = getPanelButtonLabel(userRole);

  return (
    <div className="space-y-3">
      <div className="zks-card px-5 py-4 text-center">
        <p className="font-[family-name:var(--font-heading)] text-base font-bold text-white">
          {userName}
        </p>
        <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-zks-gold-mid">
          {getRoleLabel(userRole)}
        </p>
      </div>

      {showDualPanels ? (
        <div className="grid gap-3">
          <AuthTile
            href="/panel-rodzica"
            icon={LayoutDashboard}
            title="Mój Panel"
            subtitle="Panel rodzica"
            variant="gold"
            onClick={onNavigate}
          />
          <AuthTile
            href="/moderator"
            icon={LayoutDashboard}
            title="Szybki dostęp"
            subtitle="Panel moderatora"
            onClick={onNavigate}
          />
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
      ) : (
        <div className={`grid gap-3 ${showPanel ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
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
            <div className="zks-card px-5 py-4 text-center text-sm leading-relaxed text-zks-text-muted">
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
      )}
    </div>
  );
}
