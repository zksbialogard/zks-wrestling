"use client";

import Link from "next/link";
import { CalendarDays, ChevronRight, Loader2, MapPin, Users } from "lucide-react";

import PublicEventStatusBadge from "@/components/events/PublicEventStatusBadge";
import type { AdminDashboardEvent } from "@/lib/admin-dashboard";

type Props = {
  events: AdminDashboardEvent[];
  loading?: boolean;
};

export default function UpcomingEventsTable({ events, loading = false }: Props) {
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

        <Link
          href="/admin/zawody"
          className="text-sm font-medium text-zks-gold-bright transition hover:text-zks-gold-mid"
        >
          Wszystkie zawody
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 rounded-xl border border-zks-gold-mid/15 bg-zks-black p-6 text-zks-text-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
          Ładowanie zawodów...
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-xl border border-zks-gold-mid/15 bg-zks-black p-6 text-sm text-zks-text-muted">
          Brak nadchodzących zawodów.{" "}
          <Link href="/admin/zawody" className="text-zks-gold-bright hover:underline">
            Dodaj zawody
          </Link>
          .
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/admin/zawody/${event.id}`}
              className="flex flex-col gap-4 rounded-xl border border-zks-gold-mid/15 bg-zks-black p-4 transition hover:border-zks-gold-mid/35 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h3 className="font-semibold text-white">{event.title}</h3>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-zks-text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-zks-gold-mid" />
                    {event.dateLabel}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-zks-gold-mid" />
                    {event.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-zks-gold-mid" />
                    {event.athleteCount} zatwierdzonych
                    {event.pendingCount > 0 ? ` · ${event.pendingCount} oczekuje` : ""}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <PublicEventStatusBadge status={event.registrationStatus} />
                <ChevronRight className="h-5 w-5 text-zks-text-muted" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
