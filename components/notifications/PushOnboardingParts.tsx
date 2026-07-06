"use client";

import {
  BellRing,
  CalendarClock,
  ClipboardList,
  Loader2,
  Newspaper,
  Settings2,
  Smartphone,
} from "lucide-react";

import type { PushOnboardingStatus } from "@/lib/push-onboarding-state";
import { isIosDevice, isStandalonePwa } from "@/lib/push-client";

type Props = {
  role: "rodzic" | "zawodnik";
};

const PARENT_BENEFITS = [
  { icon: CalendarClock, text: "Odwołania i zmiany godzin treningów" },
  { icon: ClipboardList, text: "Zawody, przypomnienia i status zgłoszeń" },
  { icon: Newspaper, text: "Aktualności i ważne komunikaty klubu" },
];

const ATHLETE_BENEFITS = [
  { icon: CalendarClock, text: "Plan treningów i nagłe zmiany" },
  { icon: ClipboardList, text: "Zawody i przypomnienia o startach" },
  { icon: Newspaper, text: "Wiadomości od klubu na telefon" },
];

export function PushOnboardingBenefits({ role }: Props) {
  const benefits = role === "rodzic" ? PARENT_BENEFITS : ATHLETE_BENEFITS;

  return (
    <ul className="mt-3 space-y-2">
      {benefits.map((item) => {
        const Icon = item.icon;

        return (
          <li key={item.text} className="flex items-start gap-2 text-sm text-zks-text">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-zks-gold-bright" />
            <span>{item.text}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function PushDeniedHelp() {
  return (
    <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-xs text-zks-text">
      <div className="flex items-start gap-2">
        <Settings2 className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
        <div className="space-y-2">
          <p className="font-medium text-red-200">Jak odblokować powiadomienia:</p>
          {isIosDevice() ? (
            <p>
              Ustawienia iPhone → Powiadomienia → Safari (lub ikona ZKS na pulpicie) →
              włącz „Zezwalaj na powiadomienia”.
            </p>
          ) : (
            <p>
              Chrome: ikona kłódki obok adresu strony → Powiadomienia → Zezwól. Potem
              odśwież stronę i kliknij „Włącz powiadomienia”.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function PushIosPwaHelp() {
  if (!isIosDevice() || isStandalonePwa()) {
    return null;
  }

  return (
    <div className="mt-3 flex items-start gap-2 rounded-lg border border-zks-gold-mid/20 bg-zks-black/50 p-3 text-xs text-zks-text">
      <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-zks-gold-bright" />
      <div className="space-y-2">
        <p className="font-medium text-white">Instrukcja dla iPhone (krok po kroku):</p>
        <ol className="list-decimal space-y-1 pl-4">
          <li>Otwórz stronę w Safari.</li>
          <li>Kliknij ikonę Udostępnij na dole ekranu.</li>
          <li>Wybierz „Dodaj do ekranu początkowego”.</li>
          <li>Otwórz aplikację z nowej ikony na pulpicie.</li>
          <li>Wróć tutaj i włącz powiadomienia.</li>
        </ol>
      </div>
    </div>
  );
}

export function PushOnboardingStatusBadge({
  status,
  loading = false,
}: {
  status: PushOnboardingStatus | null;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-zks-gold-mid/20 px-3 py-1 text-xs text-zks-text-muted">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Sprawdzanie...
      </span>
    );
  }

  if (status === "ready") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        Push włączone
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-200">
      <BellRing className="h-3.5 w-3.5" />
      Wymaga konfiguracji
    </span>
  );
}
