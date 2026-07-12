import { Trophy } from "lucide-react";

import type { FacebookEventResults } from "@/lib/facebook-results-types";
import { buildFacebookEventGroupKey } from "@/lib/facebook-event-utils";
import { formatEventDate } from "@/lib/event-utils";
import { clubPlaceLabel, placeLabel } from "@/lib/place-utils";

type Props = {
  events: FacebookEventResults[];
  year: number;
};

export default function CompetitionResultsList({ events, year }: Props) {
  if (events.length === 0) {
    return (
      <div className="zks-card mx-auto max-w-2xl rounded-2xl p-8 text-center text-zks-text-muted">
        Wyniki z {year} roku pojawią się tutaj po synchronizacji z profilem klubu na Facebooku.
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6">
      <p className="zks-label text-center">Sezon {year}</p>

      {events.map((event) => (
        <article
          key={buildFacebookEventGroupKey(event.event_title, event.event_date)}
          className="zks-card w-full rounded-2xl p-6 text-center sm:p-8"
        >
          <div className="mb-6 flex flex-col items-center gap-3">
            <span className="inline-flex items-center rounded-full border border-zks-gold-mid/30 bg-zks-gold/10 px-3 py-1 text-xs font-semibold tracking-wide text-zks-gold-bright">
              Sezon {year}
            </span>
            <Trophy className="h-6 w-6 text-zks-gold-bright" />
            <div>
              <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold uppercase text-white sm:text-3xl">
                {event.event_title}
              </h2>
              <p className="mt-2 text-sm text-zks-text-muted">
                {event.event_date ? formatEventDate(event.event_date) : "Data w trakcie uzupełniania"}
                {event.location ? ` · ${event.location}` : ""}
              </p>
            </div>
          </div>

          {event.club_place && (
            <p className="mb-4 text-sm font-semibold text-zks-gold-bright">
              {clubPlaceLabel(event.club_place)}
              {event.club_points ? ` · ${event.club_points} pkt` : ""}
            </p>
          )}

          <ul className="mx-auto flex w-full max-w-2xl flex-col gap-3">
            {event.results.map((result) => (
              <li
                key={result.id}
                className="flex flex-col items-center justify-center gap-1 rounded-xl border border-zks-gold-mid/15 bg-zks-black/40 px-4 py-3 text-sm sm:flex-row sm:justify-between sm:text-base"
              >
                <span className="text-zks-text">
                  {result.athlete_name}
                  {result.weight_class ? (
                    <span className="ml-2 text-xs text-zks-text-muted">({result.weight_class} kg)</span>
                  ) : null}
                  {result.style ? (
                    <span className="mt-1 block text-xs text-zks-text-muted sm:mt-0 sm:ml-2 sm:inline">
                      {result.style}
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
  );
}
