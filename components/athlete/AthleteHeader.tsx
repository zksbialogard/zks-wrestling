"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/AuthProvider";
import ClubLogo from "@/components/ui/ClubLogo";
import AthleteNotificationBadgeLink from "./AthleteNotificationBadgeLink";

export default function AthleteHeader() {
  const router = useRouter();
  const { profile, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="border-b border-zks-gold-mid/20 bg-zks-black/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <ClubLogo size={44} glow />
          <div className="min-w-0">
            <p className="zks-label text-[10px]">Panel zawodnika</p>
            <h1 className="truncate font-[family-name:var(--font-heading)] text-xl font-bold uppercase text-white sm:text-2xl">
              Witaj, {profile?.imie || "Zawodniku"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AthleteNotificationBadgeLink />

          <button
            type="button"
            onClick={handleLogout}
            className="zks-btn-outline hidden items-center gap-2 px-4 py-2.5 text-xs sm:inline-flex"
          >
            <LogOut className="h-4 w-4" />
            Wyloguj
          </button>
        </div>
      </div>
    </header>
  );
}
