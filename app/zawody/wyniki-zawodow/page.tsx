import { Trophy } from "lucide-react";

import EventsSectionHero from "@/components/events/EventsSectionHero";

const results = [
  {
    title: "Mistrzostwa Województwa",
    medals: [
      { place: "1", name: "Jan Kowalski" },
      { place: "2", name: "Adam Nowak" },
      { place: "3", name: "Michał Wiśniewski" },
    ],
  },
  {
    title: "Puchar Polski",
    medals: [
      { place: "2", name: "Mateusz Zieliński" },
      { place: "3", name: "Jakub Krawczyk" },
    ],
  },
];

const medalEmoji: Record<string, string> = {
  "1": "🥇",
  "2": "🥈",
  "3": "🥉",
};

export default function WynikiZawodowPage() {
  return (
    <main className="relative min-h-screen overflow-hidden pb-20">
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-zks-gold/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-zks-gold-deep/10 blur-[140px]" />

      <section className="relative mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
        <EventsSectionHero
          label="Osiągnięcia klubu"
          title="Wyniki"
          titleAccent="zawodów"
          description="Najnowsze starty i miejsca zawodników ZKS Białogard na zawodach regionalnych, krajowych i międzynarodowych."
        />

        <div className="space-y-6">
          {results.map((event) => (
            <article key={event.title} className="zks-card rounded-2xl p-6 sm:p-8">
              <div className="mb-5 flex items-center gap-3">
                <Trophy className="h-5 w-5 text-zks-gold-bright" />
                <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold uppercase text-white">
                  {event.title}
                </h2>
              </div>

              <ul className="space-y-3">
                {event.medals.map((medal) => (
                  <li
                    key={`${event.title}-${medal.name}`}
                    className="flex items-center justify-between rounded-xl border border-zks-gold-mid/15 bg-zks-black/40 px-4 py-3 text-sm sm:text-base"
                  >
                    <span className="text-zks-text">
                      {medalEmoji[medal.place]} {medal.name}
                    </span>
                    <span className="font-semibold text-zks-gold-bright">
                      {medal.place}. miejsce
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
