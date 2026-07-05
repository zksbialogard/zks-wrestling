"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { fetchEvents, type Event } from "@/lib/events";

export default function NajblizszeZawodyPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await fetchEvents();
        setEvents(data);
      } catch (error) {
        console.error("Błąd pobierania zawodów:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-16 text-center">
          <h1 className="mb-6 text-5xl font-bold text-yellow-400 md:text-7xl">
            Najbliższe zawody
          </h1>

          <p className="mx-auto max-w-3xl text-lg text-gray-300 md:text-xl">
            Lista najbliższych zawodów i turniejów, w których planowany jest udział
            zawodników ZKS Białogard.
          </p>
        </div>

        <div className="space-y-8">
          {loading ? (
            <div className="rounded-3xl border border-yellow-500 bg-zinc-900 p-8 text-center text-gray-300">
              Ładowanie zawodów...
            </div>
          ) : events.length === 0 ? (
            <div className="rounded-3xl border border-yellow-500 bg-zinc-900 p-8 text-center">
              <p className="text-gray-300">Brak zawodów w bazie danych.</p>
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="rounded-3xl border border-yellow-500 bg-zinc-900 p-8"
              >
                <h2 className="mb-4 text-3xl font-bold text-yellow-400">{event.title}</h2>

                <div className="space-y-3 text-gray-300">
                  <p>
                    <strong>Data:</strong>{" "}
                    {new Date(event.event_date).toLocaleDateString("pl-PL")}
                  </p>

                  <p>
                    <strong>Miejsce:</strong> {event.location}
                  </p>

                  <p>
                    <strong>Termin zgłoszeń:</strong>{" "}
                    {new Date(event.registration_deadline).toLocaleDateString("pl-PL")}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/zawody"
            className="inline-block rounded-2xl bg-yellow-500 px-8 py-4 font-bold text-black transition hover:bg-yellow-400"
          >
            Zobacz wszystkie zawody
          </Link>
        </div>
      </section>
    </main>
  );
}
