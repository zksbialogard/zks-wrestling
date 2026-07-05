"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator &&
      (window.navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

function isIos() {
  if (typeof window === "undefined") return false;

  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export default function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;

    const dismissed = sessionStorage.getItem("zks-pwa-dismissed");
    if (dismissed) return;

    if (isIos()) {
      setIosHint(true);
      setVisible(true);
      return;
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
    };
  }, []);

  const dismiss = () => {
    sessionStorage.setItem("zks-pwa-dismissed", "1");
    setVisible(false);
  };

  const install = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:hidden">
      <div className="zks-card mx-auto max-w-md border-zks-gold-mid/40 p-4 shadow-gold-glow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zks-gold-mid/30 bg-zks-gold/10">
            {iosHint ? (
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
              {iosHint
                ? "Dotknij Udostępnij, potem „Dodaj do ekranu początkowego”, aby uruchamiać klub jak aplikację."
                : "Dodaj ZKS Manager na ekran główny telefonu — szybki dostęp do panelu i aktualności."}
            </p>

            {!iosHint && deferredPrompt && (
              <button
                type="button"
                onClick={install}
                className="zks-btn-primary mt-3 w-full py-2.5 text-xs"
              >
                Zainstaluj
              </button>
            )}
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
