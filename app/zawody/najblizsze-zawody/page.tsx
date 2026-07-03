"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function NajblizszeZawodyPage() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "events"));

        const data = querySnapshot.docs.map((doc) => ({
  id: doc.id,
  ...doc.data(),
}));

console.log("EVENTS:", data);
setEvents(data);
      } catch (error) {
        console.error("Błąd pobierania zawodów:", error);
      }
    };

    loadEvents();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-yellow-400 mb-6">
            Najbliższe zawody
          </h1>

          <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto">
            Lista najbliższych zawodów i turniejów, w których planowany jest
            udział zawodników ZKS Białogard.
          </p>
        </div>

        <div className="space-y-8">
          {events.length === 0 ? (
            <div className="bg-zinc-900 border border-yellow-500 rounded-3xl p-8 text-center">
              <p className="text-gray-300">
                Brak zawodów w bazie danych.
              </p>
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="bg-zinc-900 border border-yellow-500 rounded-3xl p-8"
              >
                <h2 className="text-3xl font-bold text-yellow-400 mb-4">
                  {event.name}
                </h2>

                <div className="space-y-3 text-gray-300">
                  <p>
                    <strong>Data:</strong> {event.date}
                  </p>

                  <p>
                    <strong>Miejsce:</strong> {event.city}
                  </p>

                  <p>
                    <strong>Termin zgłoszeń:</strong>{" "}
                    {event.registrationDeadline}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/zawody/kalendarz-startow"
            className="inline-block bg-yellow-500 text-black font-bold px-8 py-4 rounded-2xl hover:bg-yellow-400 transition"
          >
            Zobacz pełny kalendarz startów
          </Link>
        </div>
      </section>
    </main>
  );
}