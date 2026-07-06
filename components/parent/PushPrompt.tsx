"use client";

import { useEffect, useState } from "react";
import { BellRing, Smartphone, X } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth/AuthProvider";
import {
  activatePushNotifications,
  ensureWebPushSubscription,
  getWebPushStatus,
  isIosDevice,
  isStandalonePwa,
  isWebPushSupported,
} from "@/lib/push-client";

export default function PushPrompt() {
  const { user, ready, loadingProfile } = useAuth();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [iosPwaHint, setIosPwaHint] = useState(false);

  useEffect(() => {
    if (!ready || loadingProfile || !user) {
      return;
    }

    async function check() {
      if (!isWebPushSupported()) {
        return;
      }

      const auto = await ensureWebPushSubscription();

      if (auto.ok) {
        return;
      }

      const status = await getWebPushStatus();

      if (auto.reason === "ios_needs_pwa" || status.iosNeedsPwa) {
        setIosPwaHint(true);
        setVisible(true);
        return;
      }

      if (status.permission === "default" || !status.subscribed) {
        setVisible(true);
      }
    }

    check();
  }, [ready, loadingProfile, user]);

  if (!visible) {
    return null;
  }

  async function handleEnable() {
    try {
      setLoading(true);
      const result = await activatePushNotifications();

      if (result.ok) {
        toast.success(result.message);
        setVisible(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nie udało się włączyć powiadomień.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-6 rounded-xl border border-zks-gold-mid/30 bg-zks-gold/10 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <BellRing className="mt-0.5 h-5 w-5 shrink-0 text-zks-gold-bright" />
          <div>
            <p className="font-semibold text-white">Włącz alerty jak na Facebooku</p>
            <p className="mt-1 text-sm text-zks-text-muted">
              Powiadomienie z dźwiękiem i wibracją — nawet gdy aplikacja jest zamknięta.
              Każdy rodzic musi to włączyć <strong>raz</strong> na swoim telefonie.
            </p>

            {iosPwaHint && isIosDevice() && !isStandalonePwa() && (
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-zks-gold-mid/20 bg-zks-black/50 p-3 text-xs text-zks-text">
                <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-zks-gold-bright" />
                <p>
                  <strong>iPhone:</strong> Safari → ikona Udostępnij →{" "}
                  <strong>Dodaj do ekranu początkowego</strong>. Potem otwórz aplikację z
                  ikony na pulpicie i kliknij „Włącz powiadomienia”.
                </p>
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setVisible(false)}
          className="text-zks-text-muted"
          aria-label="Zamknij"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading || (iosPwaHint && !isStandalonePwa())}
          onClick={handleEnable}
          className="zks-btn-primary px-4 py-2 text-xs disabled:opacity-60"
        >
          {loading ? "Włączanie..." : "Włącz powiadomienia z dźwiękiem"}
        </button>
      </div>
    </div>
  );
}
