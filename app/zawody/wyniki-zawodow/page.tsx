import { Trophy } from "lucide-react";

import EventsSectionHero from "@/components/events/EventsSectionHero";
import { listPublishedResultsGrouped } from "@/lib/competition-results-db";
import { formatEventDate } from "@/lib/event-utils";

const medalEmoji: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

function placeLabel(place: number) {
  if (medalEmoji[place]) {
    return `${medalEmoji[place]} ${place}. miejsce`;
  }

  return `${place}. miejsce`;
}

export default async function WynikiZawodowPage() {
  const results = await listPublishedResultsGrouped();

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

        {results.length === 0 ? (
          <div className="zks-card rounded-2xl p-8 text-center text-zks-text-muted">
            Wyniki pojawią się tutaj po opublikowaniu przez klub.
          </div>
        ) : (
          <div className="space-y-6">
            {results.map((event) => (
              <article key={event.event_id} className="zks-card rounded-2xl p-6 sm:p-8">
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <Trophy className="h-5 w-5 text-zks-gold-bright" />
                  <div>
                    <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold uppercase text-white">
                      {event.event_title}
                    </h2>
                    <p className="mt-1 text-xs text-zks-text-muted">
                      {formatEventDate(event.event_date)}
                      {event.location ? ` · ${event.location}` : ""}
                    </p>
                  </div>
                </div>

                <ul className="space-y-3">
                  {event.results.map((result) => (
                    <li
                      key={result.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zks-gold-mid/15 bg-zks-black/40 px-4 py-3 text-sm sm:text-base"
                    >
                      <span className="text-zks-text">
                        {result.athlete_name}
                        {result.weight_class ? (
                          <span className="ml-2 text-xs text-zks-text-muted">
                            ({result.weight_class} kg)
                          </span>
                        ) : null}
                      </span>
                      <span className="font-semibold text-zks-gold-bright">
                        {result.place ? placeLabel(result.place) : "—"}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
