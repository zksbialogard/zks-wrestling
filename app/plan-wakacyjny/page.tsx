import Link from "next/link";
import { CalendarDays, Sun } from "lucide-react";

import EventsSectionHero from "@/components/events/EventsSectionHero";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({
  title: "Plan treningów wakacyjnych 2026",
  description:
    "Harmonogram treningów ZKS Białogard w okresie wakacyjnym — czerwiec, lipiec i sierpień 2026.",
  path: "/plan-wakacyjny",
});

const SUMMER_PERIODS = [
  {
    title: "29.06 – 03.07",
    detail: "Rano 9:30–11:30 · technika · wieczorem 17:30–19:30",
  },
  {
    title: "06.07 – 10.07",
    detail: "Rano 9:30–11:30 · wieczorem 17:30–19:30 · siła",
  },
  {
    title: "14.07 – 22.07",
    detail: "Zgrupowanie · wytrzymałość",
  },
  {
    title: "27.07 – 31.07",
    detail: "Rano 10:00–12:00 · siła/wytrzymałość",
  },
  {
    title: "03.08 – 07.08",
    detail: "Rano 9:30–11:30 · technika · wieczorem 17:30–19:30 · szybkość",
  },
  {
    title: "10.08 – 14.08",
    detail: "Rano 10:00–12:00 · walki zadaniowe",
  },
  {
    title: "17.08 – 25.08",
    detail: "Zgrupowanie · walki zadaniowe / sparringi",
  },
];

export default function PlanWakacyjnyPage() {
  return (
    <main className="app-page relative overflow-hidden">
      <section className="relative mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <EventsSectionHero
          title="Plan"
          titleAccent="wakacyjny 2026"
          description="Harmonogram treningów w czerwcu, lipcu i sierpniu — zgodnie z planem klubu. W dni wolne treningów nie ma."
        />

        <div className="mb-8 zks-card zks-card-pad flex items-start gap-4">
          <Sun className="mt-1 h-8 w-8 shrink-0 text-zks-gold-bright" />
          <p className="text-sm leading-relaxed text-zks-text">
            Szczegółowy plan dnia po dniu jest w arkuszu klubowym. Poniżej najważniejsze
            okresy i zgrupowania. Aktualne zmiany trener ogłasza też w aplikacji.
          </p>
        </div>

        <ul className="space-y-4">
          {SUMMER_PERIODS.map((item) => (
            <li key={item.title} className="zks-card p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <CalendarDays className="mt-1 h-5 w-5 shrink-0 text-zks-gold-mid" />
                <div>
                  <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold uppercase text-white">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-sm text-zks-text-muted">{item.detail}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-10 text-center">
          <Link href="/kalendarz-imprez" className="zks-btn-outline inline-flex px-6 py-3 text-sm">
            Zobacz kalendarz imprez
          </Link>
        </div>
      </section>
    </main>
  );
}
