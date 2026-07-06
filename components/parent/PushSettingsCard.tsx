"use client";

import { useCallback, useEffect, useState } from "react";
import { BellRing, Loader2, RefreshCw, Smartphone } from "lucide-react";
import { toast } from "sonner";

import {
  PushDeniedHelp,
  PushIosPwaHelp,
  PushOnboardingBenefits,
  PushOnboardingStatusBadge,
} from "@/components/notifications/PushOnboardingParts";
import {
  activatePushNotifications,
  isWebPushSupported,
  unsubscribeFromWebPush,
} from "@/lib/push-client";
import { clearPushPromptSnooze } from "@/lib/push-onboarding-storage";
import {
  pushOnboardingDescription,
  pushOnboardingHeadline,
  resolvePushOnboardingState,
  type PushOnboardingState,
} from "@/lib/push-onboarding-state";

type Props = {
  role?: "rodzic" | "zawodnik";
};

export default function PushSettingsCard({ role = "rodzic" }: Props) {
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<PushOnboardingState | null>(null);
  const [busy, setBusy] = useState(false);
  const supported = isWebPushSupported();

  const refresh = useCallback(async () => {
    if (!supported) {
      setState(null);
      return;
    }

    const next = await resolvePushOnboardingState();
    setState(next);
  }, [supported]);

  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        await refresh();
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [refresh]);

  async function enablePush() {
    setBusy(true);

    try {
      const result = await activatePushNotifications();

      if (result.ok) {
        clearPushPromptSnooze();
        await refresh();
        toast.success(result.message);
      } else {
        toast.error(result.message);
        await refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  async function disablePush() {
    setBusy(true);

    try {
      await unsubscribeFromWebPush();
      await refresh();
      toast.success("Powiadomienia push wyłączone na tym urządzeniu.");
    } catch {
      toast.error("Nie udało się wyłączyć powiadomień push.");
    } finally {
      setBusy(false);
    }
  }

  const status = state?.status ?? "needs_permission";
  const isReady = status === "ready";
  const canEnable = status === "needs_permission" || status === "needs_sync";
  const iosBlocked = status === "ios_needs_pwa";

  return (
    <section className="zks-card zks-card-pad space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-zks-gold-mid/30 bg-zks-gold/10">
            <BellRing className="h-5 w-5 text-zks-gold-bright" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold uppercase text-white">
              Powiadomienia push
            </h3>
            <p className="mt-1 text-sm text-zks-text-muted">
              Alerty na telefonie — nawet gdy aplikacja jest zamknięta. Włącz raz na
              każdym urządzeniu (telefon rodzica, telefon zawodnika itd.).
            </p>
          </div>
        </div>

        <PushOnboardingStatusBadge status={loading ? null : status} loading={loading} />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-zks-text-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          Sprawdzanie statusu...
        </div>
      ) : !supported ? (
        <p className="rounded-lg border border-zks-gold-mid/20 bg-zks-black/50 p-4 text-sm text-zks-text-muted">
          Twoja przeglądarka nie obsługuje powiadomień push. Użyj Chrome lub Safari na
          telefonie.
        </p>
      ) : (
        <>
          <div className="rounded-lg border border-zks-gold-mid/20 bg-zks-black/40 p-4">
            <p className="text-sm font-medium text-white">
              {pushOnboardingHeadline(status)}
            </p>
            <p className="mt-1 text-sm text-zks-text-muted">
              {pushOnboardingDescription(status, role)}
            </p>

            {!isReady && status !== "denied" && status !== "ios_needs_pwa" && (
              <PushOnboardingBenefits role={role} />
            )}

            {status === "denied" && <PushDeniedHelp />}
            {iosBlocked && <PushIosPwaHelp />}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isReady ? (
              <button
                type="button"
                disabled={busy}
                onClick={disablePush}
                className="zks-btn-outline min-h-[44px] px-4 py-2.5 text-xs disabled:opacity-60"
              >
                Wyłącz na tym urządzeniu
              </button>
            ) : (
              <button
                type="button"
                disabled={busy || iosBlocked || !canEnable}
                onClick={enablePush}
                className="zks-btn-primary min-h-[44px] px-4 py-2.5 text-xs disabled:opacity-60"
              >
                {busy ? "Włączanie..." : "Włącz powiadomienia push"}
              </button>
            )}

            <button
              type="button"
              disabled={busy || loading}
              onClick={refresh}
              className="zks-btn-outline inline-flex min-h-[44px] items-center gap-2 px-4 py-2.5 text-xs disabled:opacity-60"
            >
              <RefreshCw className="h-4 w-4" />
              Odśwież status
            </button>
          </div>

          {isReady && (
            <p className="text-xs text-zks-text-muted">
              To urządzenie jest zapisane u klubu — alerty o treningach, zawodach i
              komunikatach trafią też po zamknięciu aplikacji.
            </p>
          )}

          {status === "needs_sync" && (
            <div className="flex items-start gap-2 rounded-lg border border-zks-gold-mid/20 bg-zks-black/50 p-4 text-xs text-zks-text">
              <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-zks-gold-bright" />
              <p>
                Przeglądarka ma już zgodę, ale to urządzenie nie jest jeszcze zapisane na
                serwerze klubu. Kliknij „Włącz powiadomienia push”, żeby dokończyć.
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
