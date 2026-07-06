"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, BellRing, X } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth/AuthProvider";
import {
  PushDeniedHelp,
  PushIosPwaHelp,
  PushOnboardingBenefits,
} from "@/components/notifications/PushOnboardingParts";
import { activatePushNotifications, ensureWebPushSubscription } from "@/lib/push-client";
import { clearPushPromptSnooze, isPushPromptSnoozed, snoozePushPrompt } from "@/lib/push-onboarding-storage";
import {
  pushOnboardingDescription,
  pushOnboardingHeadline,
  resolvePushOnboardingState,
  type PushOnboardingState,
} from "@/lib/push-onboarding-state";

type Props = {
  role?: "rodzic" | "zawodnik";
  compact?: boolean;
};

export default function PushOnboardingBanner({ role = "rodzic", compact = false }: Props) {
  const { user, ready, loadingProfile } = useAuth();
  const [state, setState] = useState<PushOnboardingState | null>(null);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const next = await resolvePushOnboardingState();
    setState(next);

    if (next.status === "ready") {
      clearPushPromptSnooze();
      setVisible(false);
      return;
    }

    if (next.status === "denied" || next.status === "ios_needs_pwa") {
      setVisible(true);
      return;
    }

    setVisible(!isPushPromptSnoozed());
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

  if (loading || !visible || !state || state.status === "ready") {
    return null;
  }

  const headline = pushOnboardingHeadline(state.status);
  const description = pushOnboardingDescription(state.status, role);
  const canEnable = state.status === "needs_permission" || state.status === "needs_sync";
  const iosBlocked = state.status === "ios_needs_pwa";

  async function handleEnable() {
    try {
      setBusy(true);
      const result = await activatePushNotifications();

      if (result.ok) {
        toast.success(result.message);
        clearPushPromptSnooze();
        await refresh();
      } else {
        toast.error(result.message);
        await refresh();
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nie udało się włączyć powiadomień.";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  function handleSnooze() {
    snoozePushPrompt(3);
    setVisible(false);
    toast.message("Przypomnimy za 3 dni.", {
      description: "Powiadomienia możesz włączyć też w Profil → Powiadomienia push.",
    });
  }

  if (compact) {
    return (
      <Link
        href={role === "rodzic" ? "/panel-rodzica/profil" : "/panel-zawodnika/profil"}
        className="zks-card block border-amber-500/30 bg-amber-500/5 p-4 transition hover:border-amber-500/50"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex gap-3">
            <BellRing className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
            <div>
              <p className="font-semibold text-white">{headline}</p>
              <p className="mt-1 text-sm text-zks-text-muted">{description}</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-zks-gold-bright" />
        </div>
      </Link>
    );
  }

  return (
    <div className="rounded-xl border border-zks-gold-mid/30 bg-gradient-to-br from-zks-gold/10 to-zks-black/20 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zks-gold-mid/30 bg-zks-gold/10">
            <BellRing className="h-5 w-5 text-zks-gold-bright" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-white">{headline}</p>
            <p className="mt-1 text-sm text-zks-text-muted">{description}</p>
            {(state.status === "needs_permission" || state.status === "needs_sync") && (
              <PushOnboardingBenefits role={role} />
            )}
            {state.status === "denied" && <PushDeniedHelp />}
            {iosBlocked && <PushIosPwaHelp />}
          </div>
        </div>

        {state.status !== "denied" && !iosBlocked && (
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="text-zks-text-muted"
            aria-label="Zamknij"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {canEnable && (
          <button
            type="button"
            disabled={busy}
            onClick={handleEnable}
            className="zks-btn-primary min-h-[44px] px-4 py-2 text-xs sm:text-sm disabled:opacity-60"
          >
            {busy ? "Włączanie..." : "Włącz powiadomienia push"}
          </button>
        )}

        {!iosBlocked && state.status !== "denied" && state.status !== "unsupported" && (
          <button
            type="button"
            onClick={handleSnooze}
            className="zks-btn-outline min-h-[44px] px-4 py-2 text-xs sm:text-sm"
          >
            Przypomnij za 3 dni
          </button>
        )}

        <Link
          href={role === "rodzic" ? "/panel-rodzica/profil" : "/panel-zawodnika/profil"}
          className="zks-btn-outline inline-flex min-h-[44px] items-center px-4 py-2 text-xs sm:text-sm"
        >
          Ustawienia powiadomień
        </Link>
      </div>
    </div>
  );
}
