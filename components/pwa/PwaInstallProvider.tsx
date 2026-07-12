"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  type BeforeInstallPromptEvent,
  detectInstallPlatform,
  isIosDevice,
  isStandalonePwa,
} from "@/lib/pwa-install-utils";

type PwaInstallContextValue = {
  platform: "ios" | "android" | "desktop";
  isInstalled: boolean;
  canInstall: boolean;
  isIos: boolean;
  installing: boolean;
  promptInstall: () => Promise<boolean>;
};

const PwaInstallContext = createContext<PwaInstallContextValue | null>(null);

export function PwaInstallProvider({ children }: { children: ReactNode }) {
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop">("desktop");
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    setPlatform(detectInstallPlatform());
    setIsInstalled(isStandalonePwa());

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt || installing) {
      return false;
    }

    setInstalling(true);

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;

      if (choice.outcome === "accepted") {
        setIsInstalled(true);
      }

      setDeferredPrompt(null);
      return choice.outcome === "accepted";
    } finally {
      setInstalling(false);
    }
  }, [deferredPrompt, installing]);

  const value = useMemo(
    () => ({
      platform,
      isInstalled,
      canInstall: Boolean(deferredPrompt),
      isIos: isIosDevice(),
      installing,
      promptInstall,
    }),
    [platform, isInstalled, deferredPrompt, installing, promptInstall],
  );

  return (
    <PwaInstallContext.Provider value={value}>{children}</PwaInstallContext.Provider>
  );
}

export function usePwaInstall() {
  const context = useContext(PwaInstallContext);

  if (!context) {
    throw new Error("usePwaInstall must be used within PwaInstallProvider");
  }

  return context;
}
