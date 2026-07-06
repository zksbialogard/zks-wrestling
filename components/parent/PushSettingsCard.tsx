"use client";

import { useEffect, useState } from "react";
import { BellRing, Loader2, Smartphone } from "lucide-react";
import { toast } from "sonner";

import {
  activatePushNotifications,
  fetchPushServerStatus,
  getWebPushStatus,
  isIosDevice,
  isStandalonePwa,
  isWebPushSupported,
  unsubscribeFromWebPush,
} from "@/lib/push-client";

export default function PushSettingsCard() {
  const [loading, setLoading] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushOnServer, setPushOnServer] = useState(false);
  const [busy, setBusy] = useState(false);
  const supported = isWebPushSupported();

  useEffect(() => {
    loadStatus();
  }, []);

  async function loadStatus() {
    try {
      setLoading(true);

      if (!supported) {
        return;
      }

      const status = await getWebPushStatus();
      setPushEnabled(status.subscribed);

      const server = await fetchPushServerStatus();
      setPushOnServer(server.registered);
    } catch {
      setPushOnServer(false);
    } finally {
      setLoading(false);
    }
  }

  async function enablePush() {
    setBusy(true);

    try {
      const result = await activatePushNotifications();

      if (result.ok) {
        setPushEnabled(true);
        const server = await fetchPushServerStatus();
        setPushOnServer(server.registered);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } finally {
      setBusy(false);
    }
  }

  async function disablePush() {
    setBusy(true);

    try {
      await unsubscribeFromWebPush();
      setPushEnabled(false);
      setPushOnServer(false);
      toast.success("Powiadomienia push wyłączone.");
    } catch {
      toast.error("Nie udało się wyłączyć powiadomień push.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="zks-card space-y-4 p-5 sm:p-6">
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
            każdym urządzeniu.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-zks-text-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          Sprawdzanie statusu...
        </div>
      ) : !supported ? (
        <p className="rounded-lg border border-zks-gold-mid/20 bg-zks-black/50 p-4 text-sm text-zks-text-muted">
          Twoja przeglądarka nie obsługuje powiadomień push.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-zks-gold-mid/20 bg-zks-black/40 p-4">
            <div
              className={`h-3 w-3 shrink-0 rounded-full ${
                pushEnabled && pushOnServer ? "bg-emerald-400" : "bg-zks-text-muted/50"
              }`}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white">
                {pushEnabled && pushOnServer
                  ? "Powiadomienia na tym urządzeniu: włączone"
                  : pushEnabled
                    ? "Trwa włączanie powiadomień..."
                    : "Powiadomienia na tym urządzeniu: wyłączone"}
              </p>
              <p className="mt-0.5 text-xs text-zks-text-muted">
                {pushEnabled && pushOnServer
                  ? "Otrzymasz alerty o zawodach i zgłoszeniach."
                  : "Włącz, żeby nie przegapić komunikatów od klubu."}
              </p>
            </div>

            {pushEnabled ? (
              <button
                type="button"
                disabled={busy}
                onClick={disablePush}
                className="zks-btn-outline min-h-[44px] px-4 py-2.5 text-xs disabled:opacity-60"
              >
                Wyłącz
              </button>
            ) : (
              <button
                type="button"
                disabled={busy || (isIosDevice() && !isStandalonePwa())}
                onClick={enablePush}
                className="zks-btn-primary min-h-[44px] px-4 py-2.5 text-xs disabled:opacity-60"
              >
                {busy ? "Włączanie..." : "Włącz push"}
              </button>
            )}
          </div>

          {isIosDevice() && !isStandalonePwa() && (
            <div className="flex items-start gap-2 rounded-lg border border-zks-gold-mid/20 bg-zks-black/50 p-4 text-xs text-zks-text">
              <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-zks-gold-bright" />
              <p>
                <strong>iPhone:</strong> Safari → Udostępnij →{" "}
                <strong>Dodaj do ekranu początkowego</strong>, potem włącz powiadomienia
                z ikony na pulpicie.
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
