"use client";

import { useMemo, useState } from "react";

import EventCalendarFilters, {
  type CalendarFilter,
} from "@/components/events/EventCalendarFilters";
import EventTypeBadge from "@/components/events/EventTypeBadge";
import {
  daysUntilEvent,
  dedupeEventsByDateAndTitle,
  filterEventsByType,
  formatEventDayBadge,
  formatEventWeekday,
  groupUpcomingEventsByMonth,
  isUpcomingEvent,
} from "@/lib/event-calendar-utils";
import {
  formatEventDate,
  formatEventDateRange,
  getEventRegistrationStatus,
  isEventRegistrationEnabled,
} from "@/lib/event-utils";
import type { Event } from "@/lib/events";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";

type Props = {
  events: Event[];
};

export default function EventsCalendarView({ events }: Props) {
  const [filter, setFilter] = useState<CalendarFilter>("all");

  const filteredEvents = useMemo(() => {
    const unique = dedupeEventsByDateAndTitle(events).filter((event) =>
      isUpcomingEvent(event)
    );
    return filterEventsByType(unique, filter === "inne" ? "all" : filter);
  }, [events, filter]);

  const grouped = groupUpcomingEventsByMonth(filteredEvents);

  if (!grouped.length) {
    return (
      <>
        <EventCalendarFilters value={filter} onChange={setFilter} />
        <div className="zks-card zks-card-pad mx-auto max-w-xl panel-empty text-center">
          <CalendarDays className="mx-auto h-10 w-10 text-zks-gold-mid" />
          <h3 className="panel-section-title mt-4">Brak zaplanowanych imprez</h3>
          <p className="mt-2 text-sm text-zks-text-muted">
            {filter === "all"
              ? "Gdy klub doda zawody w panelu, pojawią się tutaj automatycznie."
              : "Brak imprez w wybranej kategorii."}
          </p>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-10">
      <EventCalendarFilters value={filter} onChange={setFilter} />

      {grouped.map((group) => (
        <section key={group.monthKey}>
          <h2 className="mb-5 font-[family-name:var(--font-heading)] text-xl font-bold uppercase tracking-wide text-zks-gold-bright sm:text-2xl">
            {group.monthLabel}
          </h2>

          <ul className="space-y-4">
            {group.events.map((event) => {
              const daysLeft = daysUntilEvent(event);
              const status = getEventRegistrationStatus(event);
              const registrationEnabled = isEventRegistrationEnabled(event);

              return (
                <li key={event.id}>
                  <article className="zks-card overflow-hidden transition hover:border-zks-gold-mid/40">
                    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
                      <div className="flex shrink-0 items-center gap-4 sm:w-28 sm:flex-col sm:gap-1">
                        <div className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl border border-zks-gold-mid/30 bg-zks-gold/10">
                          <span className="font-[family-name:var(--font-heading)] text-2xl font-black text-white">
                            {formatEventDayBadge(event.event_date)}
                          </span>
                          <span className="text-[10px] uppercase tracking-wide text-zks-gold-mid">
                            {formatEventWeekday(event.event_date).slice(0, 3)}
                          </span>
                        </div>
                        <p className="text-xs text-zks-text-muted sm:text-center">
                          {daysLeft === 0
                            ? "Dziś"
                            : daysLeft === 1
                              ? "Jutro"
                              : `Za ${daysLeft} dni`}
                        </p>
                      </div>

                      <div className="min-w-0 flex-1">
                        <EventTypeBadge
                          type={event.event_type}
                          ageCategory={event.age_category}
                        />
                        <h3 className="mt-3 font-[family-name:var(--font-heading)] text-xl font-bold uppercase text-white sm:text-2xl">
                          {event.title}
                        </h3>
                        <ul className="mt-3 space-y-2 text-sm text-zks-text">
                          <li className="flex items-start gap-2">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-zks-gold-mid" />
                            <span>{event.location}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-zks-gold-mid" />
                            <span>{formatEventDateRange(event.event_date, event.end_date)}</span>
                          </li>
                        </ul>
                        <p className="mt-2 text-xs text-zks-text-muted">
                          {registrationEnabled ? (
                            <>
                              Zapisy do: {formatEventDate(event.registration_deadline)}
                              {status === "open" ? (
                                <span className="ml-2 text-zks-gold-bright">· otwarte</span>
                              ) : null}
                            </>
                          ) : (
                            <span>Impreza informacyjna — bez zgłoszeń online</span>
                          )}
                        </p>
                      </div>

                      <div className="shrink-0 sm:self-center">
                        {registrationEnabled && status === "open" ? (
                          <Link
                            href={`/zawody/${event.id}`}
                            className="zks-btn-primary inline-flex w-full items-center justify-center gap-2 px-5 py-3 text-xs sm:w-auto"
                          >
                            Zgłoś dziecko
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        ) : (
                          <Link
                            href={`/zawody/${event.id}`}
                            className="zks-btn-outline inline-flex w-full items-center justify-center gap-2 px-5 py-3 text-xs sm:w-auto"
                          >
                            Szczegóły
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
