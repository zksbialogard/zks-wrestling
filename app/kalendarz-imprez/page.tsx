"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import EventsCalendarView from "@/components/events/EventsCalendarView";
import EventsLoadingState from "@/components/events/EventsLoadingState";
import EventsSectionHero from "@/components/events/EventsSectionHero";
import { EVENT_UPCOMING_REMINDER_DAYS } from "@/lib/event-calendar-utils";
import { fetchEvents, type Event } from "@/lib/events";
export default function KalendarzImprezPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await fetchEvents();
        setEvents(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    void loadEvents();
  }, []);

  return (
    <main className="app-page relative overflow-hidden">
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-zks-gold/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-zks-gold-deep/10 blur-[140px]" />

      <section className="relative mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <EventsSectionHero
          title="Kalendarz"
          titleAccent="imprez"
          description={`Terminarz turniejów i zawodów, w których startuje ZKS Białogard. ${EVENT_UPCOMING_REMINDER_DAYS} dni przed imprezą rodzice i zawodnicy dostają automatyczne przypomnienie w aplikacji.`}
        />

        {loading ? <EventsLoadingState /> : <EventsCalendarView events={events} />}

        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <Link href="/plan-wakacyjny" className="zks-btn-outline px-5 py-2.5 text-xs">
            Plan treningów wakacyjnych
          </Link>
          <Link href="/zawody/wyniki-zawodow" className="zks-btn-outline px-5 py-2.5 text-xs">
            Wyniki zawodów
          </Link>
        </div>
      </section>    </main>
  );
}
