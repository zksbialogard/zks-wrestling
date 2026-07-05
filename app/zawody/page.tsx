"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { fetchEvents, type Event } from "@/lib/events";

export default function ZawodyPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await fetchEvents();
      setEvents(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-10 text-center text-5xl font-bold text-yellow-400">Zawody</h1>

        {loading ? (
          <div className="text-center">Ładowanie zawodów...</div>
        ) : events.length === 0 ? (
          <div className="rounded-3xl border border-yellow-500 bg-zinc-900 p-8 text-center">
            Brak dostępnych zawodów.
          </div>
        ) : (
          <div className="grid gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="rounded-3xl border border-yellow-500 bg-zinc-900 p-6"
              >
                <h2 className="mb-4 text-3xl font-bold text-yellow-400">{event.title}</h2>

                <p>
                  <strong>Miejsce:</strong> {event.location}
                </p>

                <p>
                  <strong>Data zawodów:</strong>{" "}
                  {new Date(event.event_date).toLocaleDateString("pl-PL")}
                </p>

                <p>
                  <strong>Termin zgłoszeń:</strong>{" "}
                  {new Date(event.registration_deadline).toLocaleDateString("pl-PL")}
                </p>

                <Link
                  href={`/zawody/${event.id}`}
                  className="mt-5 inline-block rounded-xl bg-yellow-500 px-6 py-3 font-bold text-black"
                >
                  Zgłoś dziecko
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
