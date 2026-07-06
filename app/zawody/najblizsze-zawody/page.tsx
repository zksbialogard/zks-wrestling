"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

import EventsEmptyState from "@/components/events/EventsEmptyState";
import EventsLoadingState from "@/components/events/EventsLoadingState";
import EventsSectionHero from "@/components/events/EventsSectionHero";
import PublicEventCard from "@/components/events/PublicEventCard";
import { fetchEvents, type Event } from "@/lib/events";

export default function NajblizszeZawodyPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await fetchEvents();
        setEvents(data);
      } catch (error) {
        console.error("Błąd pobierania zawodów:", error);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden pb-20">
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-zks-gold/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-zks-gold-deep/10 blur-[140px]" />

      <section className="relative mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <EventsSectionHero
          title="Najbliższe"
          titleAccent="zawody"
          description="Lista nadchodzących turniejów i zawodów, w których bierze udział ZKS Białogard."
        />

        {loading ? (
          <EventsLoadingState />
        ) : events.length === 0 ? (
          <EventsEmptyState />
        ) : (
          <div className="space-y-6">
            {events.map((event) => (
              <PublicEventCard
                key={event.id}
                event={event}
                showAction={false}
              />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/zawody"
            className="zks-btn-outline inline-flex items-center gap-2 px-6 py-3 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Zobacz wszystkie zawody
          </Link>
        </div>
      </section>
    </main>
  );
}
