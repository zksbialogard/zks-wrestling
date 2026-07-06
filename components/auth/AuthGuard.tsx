"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/AuthProvider";
import { getPanelHref } from "@/lib/panel-routes";

type Props = {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireRole?: "rodzic" | "zawodnik";
};

export default function AuthGuard({
  children,
  requireAdmin = false,
  requireRole,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, ready, loadingProfile } = useAuth();

  useEffect(() => {
    if (!ready || loadingProfile) return;

    if (!user) {
      const next = encodeURIComponent(pathname);
      router.replace(`/login?next=${next}`);
      return;
    }

    if (!profile) {
      router.replace("/");
      return;
    }

    if (requireAdmin && profile.rola !== "admin") {
      router.replace(getPanelHref(profile.rola));
      return;
    }

    if (requireRole === "rodzic" && profile.rola === "zawodnik") {
      router.replace("/panel-zawodnika");
      return;
    }

    if (requireRole === "zawodnik" && profile.rola !== "zawodnik") {
      router.replace(getPanelHref(profile.rola));
    }
  }, [ready, loadingProfile, user, profile, requireAdmin, requireRole, router, pathname]);

  if (!ready || loadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zks-black text-zks-text">
        Trwa wczytywanie sesji...
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  if (requireAdmin && profile.rola !== "admin") {
    return null;
  }

  if (requireRole === "rodzic" && profile.rola === "zawodnik") {
    return null;
  }

  if (requireRole === "zawodnik" && profile.rola !== "zawodnik") {
    return null;
  }

  return <>{children}</>;
}
