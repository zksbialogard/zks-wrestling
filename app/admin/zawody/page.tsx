"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Event {
  id: string;
  name: string;
  city: string;
  date: string;
  registrationDeadline: string;
  active?: boolean;
}

export default function AdminZawodyPage() {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const [registrationDeadline, setRegistrationDeadline] = useState("");

  const [events, setEvents] = useState<Event[]>([]);
  const [registrationsCount, setRegistrationsCount] =
    useState<Record<string, number>>({});

  const loadEvents = async () => {
    try {
      const snapshot = await getDocs(collection(db, "events"));

      const eventsData = snapshot.docs.map((document) => ({
        id: document.id,
        ...(document.data() as Omit<Event, "id">),
      }));

      setEvents(eventsData);

      const counts: Record<string, number> = {};

      for (const event of eventsData) {
        const registrationsSnapshot = await getDocs(
          query(
            collection(db, "registrations"),
            where("eventId", "==", event.id)
          )
        );

        counts[event.id] = registrationsSnapshot.size;
      }

      setRegistrationsCount(counts);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const addEvent = async () => {
    try {
      if (
        !name ||
        !city ||
        !date ||
        !registrationDeadline
      ) {
        alert("Uzupełnij wszystkie pola.");
        return;
      }

      await addDoc(collection(db, "events"), {
        name,
        city,
        date,
        registrationDeadline,
        active: true,
        createdAt: new Date(),
      });

      setName("");
      setCity("");
      setDate("");
      setRegistrationDeadline("");

      await loadEvents();

      alert("Zawody dodane.");
    } catch (error) {
      console.error(error);
      alert("Błąd dodawania zawodów.");
    }
  };

  const deleteEvent = async (id: string) => {
    const confirmed = confirm(
      "Czy na pewno chcesz usunąć te zawody?"
    );

    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "events", id));

      await loadEvents();

      alert("Zawody usunięte.");
    } catch (error) {
      console.error(error);
      alert("Błąd usuwania zawodów.");
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-5xl font-bold text-yellow-400 mb-10">
          Panel zawodów
        </h1>

        <div className="bg-zinc-900 border border-yellow-500 rounded-3xl p-6 mb-12 space-y-4">
          <input
            placeholder="Nazwa zawodów"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-4 rounded-xl bg-black border border-yellow-500"
          />

          <input
            placeholder="Miasto"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full p-4 rounded-xl bg-black border border-yellow-500"
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-4 rounded-xl bg-black border border-yellow-500"
          />

          <input
            type="date"
            value={registrationDeadline}
            onChange={(e) =>
              setRegistrationDeadline(e.target.value)
            }
            className="w-full p-4 rounded-xl bg-black border border-yellow-500"
          />

          <button
            onClick={addEvent}
            className="
              bg-yellow-500
              hover:bg-yellow-400
              text-black
              px-8
              py-4
              rounded-xl
              font-bold
            "
          >
            Dodaj zawody
          </button>
        </div>

        <h2 className="text-3xl font-bold text-yellow-400 mb-6">
          Aktualne zawody
        </h2>

        <div className="space-y-5">
          {events.length === 0 ? (
            <div className="bg-zinc-900 border border-yellow-500 rounded-3xl p-6">
              Brak zawodów.
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="
                  bg-zinc-900
                  border
                  border-yellow-500
                  rounded-3xl
                  p-6
                "
              >
                <h3 className="text-2xl font-bold text-yellow-400">
                  {event.name}
                </h3>

                <p className="mt-3">
                  <strong>Miasto:</strong> {event.city}
                </p>

                <p>
                  <strong>Data:</strong> {event.date}
                </p>

                <p>
                  <strong>Termin zgłoszeń:</strong>{" "}
                  {event.registrationDeadline}
                </p>

                <p className="mt-3 text-green-400 font-bold">
                  Liczba zgłoszeń:{" "}
                  {registrationsCount[event.id] || 0}
                </p>

                <div className="flex gap-3 mt-5 flex-wrap">
                  <Link
                    href={`/admin/zawody/${event.id}`}
                    className="
                      bg-yellow-500
                      hover:bg-yellow-400
                      text-black
                      px-4
                      py-2
                      rounded-xl
                      font-bold
                    "
                  >
                    Lista zgłoszeń
                  </Link>

                  <button
                    onClick={() => deleteEvent(event.id)}
                    className="
                      bg-red-600
                      hover:bg-red-500
                      px-4
                      py-2
                      rounded-xl
                      font-bold
                    "
                  >
                    Usuń
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}