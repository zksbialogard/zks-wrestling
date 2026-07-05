"use client";

import { Bell, Home, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import AdminMobileNav from "@/components/admin/AdminMobileNav";
import { useAuth } from "@/components/auth/AuthProvider";

export default function Topbar() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="flex h-20 items-center justify-between border-b border-zks-gold-mid/15 bg-zks-black/95 px-4 backdrop-blur-xl sm:px-8">
      <div className="min-w-0">
        <h1 className="font-[family-name:var(--font-heading)] text-xl font-bold uppercase text-white sm:text-2xl">
          Panel admina
        </h1>
        <p className="truncate text-xs text-zks-text-muted sm:text-sm">
          ZKS Białogard — Manager
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
          className="relative hidden rounded-xl border border-zks-gold-mid/20 p-2.5 transition hover:border-zks-gold-mid/40 lg:inline-flex"
        >
          <Bell className="h-5 w-5 text-zks-gold-bright" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="hidden items-center gap-2 rounded-xl border border-red-500/40 px-4 py-2.5 text-sm text-red-300 transition hover:bg-red-500/10 lg:inline-flex"
        >
          <LogOut className="h-4 w-4" />
          Wyloguj
        </button>

        <AdminMobileNav onLogout={handleLogout} />
      </div>
    </header>
  );
}
