"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface EventType {
  id: string;
  name: string;
  city: string;
  date: string;
  registrationDeadline: string;
  active?: boolean;
}

export default function ZawodyPage() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const snapshot = await getDocs(collection(db, "events"));

      const data = snapshot.docs.map((document) => ({
        id: document.id,
        ...(document.data() as Omit<EventType, "id">),
      }));

      const activeEvents = data.filter(
        (event) => event.active !== false
      );

      setEvents(activeEvents);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-bold text-yellow-400 text-center mb-10">
          Zawody
        </h1>

        {loading ? (
          <div className="text-center">
            Ładowanie zawodów...
          </div>
        ) : events.length === 0 ? (
          <div className="bg-zinc-900 border border-yellow-500 rounded-3xl p-8 text-center">
            Brak dostępnych zawodów.
          </div>
        ) : (
          <div className="grid gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-zinc-900 border border-yellow-500 rounded-3xl p-6"
              >
                <h2 className="text-3xl font-bold text-yellow-400 mb-4">
                  {event.name}
                </h2>

                <p>
                  <strong>Miasto:</strong> {event.city}
                </p>

                <p>
                  <strong>Data zawodów:</strong> {event.date}
                </p>

                <p>
                  <strong>Termin zgłoszeń:</strong>{" "}
                  {event.registrationDeadline}
                </p>

                <Link
                  href={`/zawody/${event.id}`}
                  className="inline-block mt-5 bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold"
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