"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

import {
  activatePwaUpdate,
  subscribeToPwaUpdates,
} from "@/lib/pwa-update";

export default function PwaUpdatePrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    return subscribeToPwaUpdates(() => {
      setVisible(true);
    });
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[900] p-4 pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="zks-card mx-auto flex max-w-md items-center gap-3 border-zks-gold-mid/40 p-3 shadow-gold-glow-sm">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zks-gold-mid/30 bg-zks-gold/10">
          <RefreshCw className="h-4 w-4 text-zks-gold-bright" />
        </div>

        <p className="min-w-0 flex-1 font-[family-name:var(--font-heading)] text-xs font-bold uppercase leading-snug text-white sm:text-sm">
          Dostępna nowa wersja aplikacji
        </p>

        <button
          type="button"
          onClick={activatePwaUpdate}
          className="zks-btn-primary shrink-0 px-4 py-2 text-xs"
        >
          Odśwież
        </button>
      </div>
    </div>
  );
}
