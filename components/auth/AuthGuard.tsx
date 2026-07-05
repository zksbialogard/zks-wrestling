"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/AuthProvider";

type Props = {
  children: React.ReactNode;
  requireAdmin?: boolean;
};

export default function AuthGuard({
  children,
  requireAdmin = false,
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
      router.replace("/panel-rodzica");
    }
  }, [ready, loadingProfile, user, profile, requireAdmin, router, pathname]);

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

  return <>{children}</>;
}
