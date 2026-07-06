"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BellRing } from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";
import { PushOnboardingStatusBadge } from "@/components/notifications/PushOnboardingParts";
import { ensureWebPushSubscription } from "@/lib/push-client";
import {
  pushOnboardingDescription,
  pushOnboardingHeadline,
  resolvePushOnboardingState,
  type PushOnboardingState,
} from "@/lib/push-onboarding-state";

type Props = {
  role?: "rodzic" | "zawodnik";
};

export default function PushOnboardingDashboardCard({ role = "rodzic" }: Props) {
  const { user, ready, loadingProfile } = useAuth();
  const [state, setState] = useState<PushOnboardingState | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const next = await resolvePushOnboardingState();
    setState(next);
  }, []);

  useEffect(() => {
    if (!ready || loadingProfile || !user) {
      return;
    }

    async function init() {
      setLoading(true);

      try {
        await ensureWebPushSubscription();
        await refresh();
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [ready, loadingProfile, user, refresh]);

  if (loading || !state || state.status === "ready") {
    return null;
  }

  const profileHref = role === "rodzic" ? "/panel-rodzica/profil" : "/panel-zawodnika/profil";

  return (
    <Link
      href={profileHref}
      className="zks-card zks-card-pad group block border-amber-500/25 bg-amber-500/5 transition hover:-translate-y-0.5 hover:border-amber-500/45"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-amber-200">
              Ważne na telefonie
            </p>
            <PushOnboardingStatusBadge status={state.status} />
          </div>
          <p className="mt-2 font-[family-name:var(--font-heading)] text-lg font-bold text-white">
            {pushOnboardingHeadline(state.status)}
          </p>
          <p className="mt-1 text-sm text-zks-text-muted">
            {pushOnboardingDescription(state.status, role)}
          </p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 transition group-hover:shadow-gold-glow-sm">
          <BellRing className="h-5 w-5 text-amber-300" />
        </div>
      </div>
      <p className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-zks-gold-bright">
        Skonfiguruj powiadomienia
        <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
      </p>
    </Link>
  );
}
