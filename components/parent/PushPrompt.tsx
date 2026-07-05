"use client";

import { useEffect, useState } from "react";
import { BellRing, X } from "lucide-react";
import { toast } from "sonner";

import {
  getWebPushStatus,
  isWebPushSupported,
  subscribeToWebPush,
} from "@/lib/push-client";

export default function PushPrompt() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function check() {
      if (!isWebPushSupported()) {
        return;
      }

      const status = await getWebPushStatus();

      if (status.permission === "default" || !status.subscribed) {
        setVisible(true);
      }
    }

    check();
  }, []);

  if (!visible) {
    return null;
  }

  async function handleEnable() {
    try {
      setLoading(true);
      await subscribeToWebPush();
      toast.success("Powiadomienia push włączone — dostaniesz je na telefon jak w aplikacji.");
      setVisible(false);
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
            <p className="font-semibold text-white">Włącz powiadomienia na telefon</p>
            <p className="mt-1 text-sm text-zks-text-muted">
              Tak jak w normalnej aplikacji — dostaniesz alert o zawodach i ważnych
              informacjach, nawet gdy nie masz otwartej strony. Najlepiej zainstaluj
              aplikację na ekranie głównym (PWA).
            </p>
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
          disabled={loading}
          onClick={handleEnable}
          className="zks-btn-primary px-4 py-2 text-xs disabled:opacity-60"
        >
          {loading ? "Włączanie..." : "Włącz powiadomienia"}
        </button>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="zks-btn-outline px-4 py-2 text-xs"
        >
          Później
        </button>
      </div>
    </div>
  );
}
