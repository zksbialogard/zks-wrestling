"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Registration {
  id: string;
  childName: string;
  childSurname: string;
  childBirthYear: string;
  childGender: string;
  childWeight: string;
  parentPhone: string;
  status: string;
  eventId: string;
}

interface EventData {
  id: string;
  name: string;
}

export default function AdminZgloszeniaPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [events, setEvents] = useState<Record<string, string>>({});

  const [showPending, setShowPending] = useState(true);
  const [showApproved, setShowApproved] = useState(false);
  const [showRejected, setShowRejected] = useState(false);

  const pendingRegistrations = registrations.filter(
    (reg) => reg.status === "pending"
  );

  const approvedRegistrations = registrations.filter(
    (reg) => reg.status === "approved"
  );

  const rejectedRegistrations = registrations.filter(
    (reg) => reg.status === "rejected"
  );

  const loadRegistrations = async () => {
    const registrationsSnapshot = await getDocs(
      collection(db, "registrations")
    );

    const registrationsData = registrationsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Registration[];

    setRegistrations(registrationsData);

    const eventsSnapshot = await getDocs(collection(db, "events"));

const eventMap: Record<string, string> = {};

eventsSnapshot.forEach((doc) => {
  eventMap[doc.id] = doc.data().name || "Bez nazwy";
});

setEvents(eventMap);
    console.log("EVENT MAP:", eventMap);
  };

  useEffect(() => {
    loadRegistrations();
  }, []);

 const getEventName = (eventId: string) => {
  return events[eventId] ?? "Nieznane zawody";
};
 

const approveRegistration = async (id: string) => {
  await updateDoc(doc(db, "registrations", id), {
    status: "approved",
  });

  loadRegistrations();
};

const rejectRegistration = async (id: string) => {
  await updateDoc(doc(db, "registrations", id), {
    status: "rejected",
  });

  loadRegistrations();
};

const deleteRegistration = async (id: string) => {
  if (!confirm("Usunąć zgłoszenie?")) return;

  await deleteDoc(doc(db, "registrations", id));
  loadRegistrations();
};

return (
  <div className="p-6 text-white">
    <h1 className="text-4xl font-bold text-yellow-400  text-center mb-6">
      Panel zgłoszeń
    </h1>

    <div className="grid grid-cols-3 gap-3 mb-8">
      <div className="bg-yellow-500 shadow-x1 text-black rounded-xl p-3  text-center font-bold shadow-lg">
        <div className="text-2xl">
          {pendingRegistrations.length}
        </div>
        <div>Oczekujące</div>
      </div>

      <div className="bg-green-600 shadow-x1 rounded-xl p-3 text-center font-bold shadow-lg">
        <div className="text-2xl">
          {approvedRegistrations.length}
        </div>
        <div>Zaakceptowane</div>
      </div>

      <div className="bg-red-600 shadow-x1 rounded-xl p-3 text-center font-bold shadow-lg">
        <div className="text-2xl">
          {rejectedRegistrations.length}
        </div>
        <div>Odrzucone</div>
      </div>
    </div>

    {/* OCZEKUJĄCE */}

    <div className="mb-8">
      <h2
        onClick={() => setShowPending(!showPending)}
        className="bg-zinc-900 border border-yellow-500 rounded-xl p-3 cursor-pointer font-bold text-2xl mb-3"
      >

        {showPending ? "▼" : "▶"} 📋 Oczekujące (
        {pendingRegistrations.length})
      </h2>

      {showPending && (
        <>
          {pendingRegistrations.length === 0 ? (
            <p>Brak oczekujących zgłoszeń.</p>
          ) : (
            pendingRegistrations.map((reg) => (
              <div
                key={reg.id}
                className="bg-zinc-900 border-2 border-yellow-500 rounded-xl p-4 mb-4 shadow-lg shadow-yellow-500/10"
              >
                <h2 className="text-2xl font-bold text-yellow-400">
                  {reg.childName} {reg.childSurname}
                </h2>

                <p className="text-yellow-300 font-semibold mb-2">
                  🏆 {getEventName(reg.eventId)}
                </p>

                <p>Rok urodzenia: {reg.childBirthYear}</p>
                <p>Płeć: {reg.childGender}</p>
                <p>Kategoria wagowa: {reg.childWeight} kg</p>
                <p>Telefon rodzica: {reg.parentPhone}</p>

                <p className="font-bold mt-2 text-orange-400">
                  ⏳ Oczekuje
                </p>

                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    onClick={() => approveRegistration(reg.id)}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-bold"
                  >
                    ✅ Akceptuj
                  </button>

                  <button
                    onClick={() => rejectRegistration(reg.id)}
                    className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg font-bold"
                  >
                    ❌ Odrzuć
                  </button>

                  <button
                    onClick={() => deleteRegistration(reg.id)}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-bold"
                  >
                    🗑 Usuń
                  </button>
                </div>
              </div>
            ))
          )}
        </>
      )}
    </div>

    {/* ZAAKCEPTOWANE */}

    <div className="mb-8">
      <h2
        onClick={() => setShowApproved(!showApproved)}
        className="bg-zinc-900 border border-green-500 rounded-xl p-3 cursor-pointer font-bold text-2xl mb-3"
      >
        {showApproved ? "▼" : "▶"} ✅ Zaakceptowane (
        {approvedRegistrations.length})
      </h2>

      {showApproved && (
        <>
          {approvedRegistrations.length === 0 ? (
            <p>Brak zaakceptowanych zgłoszeń.</p>
          ) : (
            approvedRegistrations.map((reg) => (
              <div
                key={reg.id}
                className="bg-zinc-900 border-2 border-green-500 rounded-xl p-4 mb-4 shadow-lg shadow-green-500/20"
              >
                <h2 className="text-2xl font-bold text-green-400">
                  {reg.childName} {reg.childSurname}
                </h2>

                <p className="text-green-300 font-semibold mb-2">
                  🏆 {getEventName(reg.eventId)}
                </p>
                <p className="text-xs text-gray-400">
                  ID zawodów: {reg.eventId}
                </p>

                <p>Rok urodzenia: {reg.childBirthYear}</p>
                <p>Płeć: {reg.childGender}</p>
                <p>Kategoria wagowa: {reg.childWeight} kg</p>
                <p>Telefon rodzica: {reg.parentPhone}</p>

                <p className="font-bold mt-2 text-green-400 text-lg">
                  ✅ Zaakceptowane
                </p>

                <button
                  onClick={() => deleteRegistration(reg.id)}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg mt-3 font-bold"
                >
                  🗑 Usuń
                </button>
              </div>
            ))
          )}
        </>
      )}
    </div>

    {/* ODRZUCONE */}

    <div>
      <h2
        onClick={() => setShowRejected(!showRejected)}
        className="bg-zinc-900 border border-red-500 rounded-xl p-3 cursor-pointer font-bold text-2xl mb-3"
      >
        {showRejected ? "▼" : "▶"} ❌ Odrzucone (
        {rejectedRegistrations.length})
      </h2>

      {showRejected && (
        <>
          {rejectedRegistrations.length === 0 ? (
            <p>Brak odrzuconych zgłoszeń.</p>
          ) : (
            rejectedRegistrations.map((reg) => (
              <div
                key={reg.id}
                className="bg-zinc-900 border-2 border-red-500 rounded-xl p-4 mb-4 shadow-lg shadow-red-500/20"
              >
                <h2 className="text-2xl font-bold text-red-400">
                  {reg.childName} {reg.childSurname}
                </h2>

                <p className="text-red-300 font-semibold mb-2">
                  🏆 {getEventName(reg.eventId)}
                </p>

                <p>Rok urodzenia: {reg.childBirthYear}</p>
                <p>Płeć: {reg.childGender}</p>
                <p>Kategoria wagowa: {reg.childWeight} kg</p>
                <p>Telefon rodzica: {reg.parentPhone}</p>

                <p className="font-bold mt-2 text-red-400">
                  ❌ Odrzucone
                </p>

                <button
                  onClick={() => deleteRegistration(reg.id)}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg mt-3 font-bold"
                >
                  🗑 Usuń
                </button>
              </div>
            ))
          )}
        </>
      )}
    </div>
  </div>
);
}