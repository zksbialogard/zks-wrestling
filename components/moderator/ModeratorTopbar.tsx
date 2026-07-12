"use client";

import { Home, LogOut } from "lucide-react";
import Link from "next/link";

type ModeratorTopbarProps = {
  onLogout: () => void;
};

export default function ModeratorTopbar({ onLogout }: ModeratorTopbarProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-zks-gold-mid/15 bg-zks-black/95 px-4 backdrop-blur-xl sm:h-20 sm:px-8">
      <div className="min-w-0">
        <h1 className="font-[family-name:var(--font-heading)] text-lg font-bold uppercase text-white sm:text-2xl">
          Panel moderatora
        </h1>
        <p className="truncate text-[11px] text-zks-text-muted sm:text-sm">
          Szybki dostęp do aktualności, galerii i zawodów
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <Link
          href="/"
          title="Strona główna klubu"
          className="inline-flex items-center gap-2 rounded-xl border border-zks-gold-mid/20 p-2.5 text-zks-gold-bright transition hover:border-zks-gold-mid/40 hover:bg-zks-charcoal sm:px-4 sm:py-2.5"
        >
          <Home className="h-5 w-5" />
          <span className="hidden text-xs sm:inline">Strona klubu</span>
        </Link>

        <button
          type="button"
          onClick={onLogout}
          className="hidden items-center gap-2 rounded-xl border border-red-500/40 px-4 py-2.5 text-sm text-red-300 transition hover:bg-red-500/10 lg:inline-flex"
        >
          <LogOut className="h-4 w-4" />
          Wyloguj
        </button>
      </div>
    </header>
  );
}
