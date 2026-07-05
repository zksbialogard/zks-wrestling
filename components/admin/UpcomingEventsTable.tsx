"use client";

import { CalendarDays, ChevronRight, MapPin, Users } from "lucide-react";

const events = [
  {
    name: "Turniej Młodzików",
    date: "12 lipca 2026",
    city: "Koszalin",
    athletes: 14,
    status: "Zapisy",
  },
  {
    name: "Mistrzostwa Województwa",
    date: "26 lipca 2026",
    city: "Szczecin",
    athletes: 9,
    status: "Oczekiwanie",
  },
  {
    name: "Puchar Polski",
    date: "9 sierpnia 2026",
    city: "Warszawa",
    athletes: 21,
    status: "Gotowe",
  },
];

export default function UpcomingEventsTable() {
  return (
    <section className="zks-card p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold uppercase text-white">
            Najbliższe zawody
          </h2>
          <p className="mt-2 text-sm text-zks-text-muted">
            Przegląd nadchodzących startów klubowych.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {events.map((event) => (
          <div
            key={event.name}
            className="flex flex-col gap-4 rounded-xl border border-zks-gold-mid/15 bg-zks-black p-4 transition hover:border-zks-gold-mid/35 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h3 className="font-semibold text-white">{event.name}</h3>
              <div className="mt-2 flex flex-wrap gap-4 text-sm text-zks-text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-zks-gold-mid" />
                  {event.date}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-zks-gold-mid" />
                  {event.city}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-zks-gold-mid" />
                  {event.athletes} zawodników
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="rounded-full border border-zks-gold-mid/30 px-3 py-1 text-xs uppercase tracking-wide text-zks-gold-bright">
                {event.status}
              </span>
              <ChevronRight className="h-5 w-5 text-zks-text-muted" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
