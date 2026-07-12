"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

import { usePwaInstall } from "@/components/pwa/PwaInstallProvider";

export default function InstallPrompt() {
  const { canInstall, isInstalled, isIos, promptInstall } = usePwaInstall();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isInstalled) return;

    const dismissed = sessionStorage.getItem("zks-pwa-dismissed");
    if (dismissed) return;

    if (isIos || canInstall) {
      setVisible(true);
    }
  }, [isInstalled, isIos, canInstall]);

  const dismiss = () => {
    sessionStorage.setItem("zks-pwa-dismissed", "1");
    setVisible(false);
  };

  const install = async () => {
    const accepted = await promptInstall();
    if (accepted) {
      setVisible(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:hidden">
      <div className="zks-card mx-auto max-w-md border-zks-gold-mid/40 p-4 shadow-gold-glow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zks-gold-mid/30 bg-zks-gold/10">
            {isIos ? (
              <Share className="h-5 w-5 text-zks-gold-bright" />
            ) : (
              <Download className="h-5 w-5 text-zks-gold-bright" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-[family-name:var(--font-heading)] text-sm font-bold uppercase text-white">
              Zainstaluj aplikację ZKS
            </p>
            <p className="mt-1 text-xs leading-relaxed text-zks-text-muted">
              {isIos
                ? "Dotknij Udostępnij, potem „Dodaj do ekranu początkowego”, aby uruchamiać klub jak aplikację."
                : "Dodaj ZKS Manager na ekran główny telefonu — szybki dostęp do panelu i aktualności."}
            </p>

            {!isIos && canInstall && (
              <button
                type="button"
                onClick={install}
                className="zks-btn-primary mt-3 w-full py-2.5 text-xs"
              >
                Zainstaluj
              </button>
            )}

            <Link
              href="/pobierz"
              className="mt-2 inline-block text-xs font-medium text-zks-gold-bright hover:underline"
            >
              Pełna instrukcja instalacji →
            </Link>
          </div>

          <button
            type="button"
            onClick={dismiss}
            aria-label="Zamknij"
            className="shrink-0 rounded-lg p-1 text-zks-text-muted transition hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
