"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, Loader2, MapPin } from "lucide-react";

import { fetchEvents } from "@/lib/events";

export default function AthleteEventsPage() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<
    Awaited<ReturnType<typeof fetchEvents>>
  >([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchEvents();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        setEvents(
          data.filter((event) => {
            const eventDate = new Date(event.event_date);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate >= today;
          })
        );
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold uppercase text-white sm:text-3xl">
          Zawody
        </h2>
        <p className="mt-2 text-sm text-zks-text-muted">
          Nadchodzące starty — sprawdź terminy i szczegóły zawodów.
        </p>
      </div>

      {loading ? (
        <div className="zks-card flex items-center gap-3 p-6 text-zks-text-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
          Ładowanie zawodów...
        </div>
      ) : events.length === 0 ? (
        <div className="zks-card p-6 text-zks-text-muted">
          Brak nadchodzących zawodów. Wróć tu później lub sprawdź aktualności klubu.
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <article key={event.id} className="zks-card p-5 sm:p-6">
              <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-white sm:text-xl">
                {event.title}
              </h3>

              <div className="mt-3 space-y-2 text-sm text-zks-text">
                <p className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 shrink-0 text-zks-gold-mid" />
                  {new Date(event.event_date).toLocaleDateString("pl-PL", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <p className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0 text-zks-gold-mid" />
                  {event.location}
                </p>
                <p className="text-zks-text-muted">
                  Zapisy do:{" "}
                  {new Date(event.registration_deadline).toLocaleDateString("pl-PL")}
                </p>
              </div>

              <Link
                href={`/zawody/${event.id}`}
                className="zks-btn-primary mt-4 inline-flex min-h-[44px] items-center px-5 py-2.5 text-xs sm:text-sm"
              >
                Szczegóły zawodów
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
