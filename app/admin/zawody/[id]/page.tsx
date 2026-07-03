"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

interface Registration {
  id: string;
  eventId: string;
  childId: string;
  childName: string;
  childSurname: string;
  childBirthYear: string;
  childGender: string;
  childWeight: string;
  parentUid: string;
  parentPhone?: string;
  status: string;
}

interface EventItem {
  id: string;
  name: string;
  city: string;
  date: string;
}

export default function AdminZgloszeniaPage() {
  const params = useParams();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

 useEffect(() => {
  if (!params) return;

  loadData();
}, [params]);

  const loadData = async () => {
    console.log("PARAM ID:", params.id);
    try {
      setLoading(true);

      const registrationsSnapshot = await getDocs(
  query(
    collection(db, "registrations"),
    where("eventId", "==", String(params.id))
  )
);
console.log(
  "ZNALEZIONE ZGŁOSZENIA:",
  registrationsSnapshot.size
);
      const registrationsData = registrationsSnapshot.docs.map(
        (document) => ({
          id: document.id,
          ...(document.data() as Omit<Registration, "id">),
        })
      );

      const eventsSnapshot = await getDocs(
        collection(db, "events")
      );

      const eventsData = eventsSnapshot.docs.map(
        (document) => ({
          id: document.id,
          ...(document.data() as Omit<EventItem, "id">),
        })
      );

      setRegistrations(registrationsData);
      setEvents(eventsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (
  registrationId: string,
  status: string
) => {
  try {
    const registration = registrations.find(
      (r) => r.id === registrationId
    );

    await updateDoc(
      doc(db, "registrations", registrationId),
      { status }
    );

    if (
      status === "accepted" &&
      registration?.parentPhone
    ) {
      await fetch("/api/send-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: registration.parentPhone,
          message:
            `ZKS Bialogard: Zawodnik ${registration.childName} ${registration.childSurname} zostal zaakceptowany na zawody.`,
        }),
      });
    }

   await loadData();

setFilter("pending");

alert("Status został zaktualizowany.");
  } catch (error) {
    console.error(error);
    alert("Błąd aktualizacji statusu.");
  }
};
const exportToExcel = () => {
  const acceptedRegistrations = registrations.filter(
    (registration) => registration.status === "accepted"
  );

  if (acceptedRegistrations.length === 0) {
    alert("Brak zaakceptowanych zawodników.");
    return;
  }

  const data = acceptedRegistrations.map(
    (registration) => ({
      Imię: registration.childName,
      Nazwisko: registration.childSurname,
      Rocznik: registration.childBirthYear,
      Waga: `${registration.childWeight} kg`,
      Klub: "ZKS Białogard",
    })
  );

  const worksheet =
    XLSX.utils.json_to_sheet(data);

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Lista startowa"
  );

  const excelBuffer = XLSX.write(
    workbook,
    {
      bookType: "xlsx",
      type: "array",
    }
  );

  const fileData = new Blob(
    [excelBuffer],
    {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }
  );

  saveAs(
    fileData,
    "Lista_Startowa.xlsx"
  );
};
const sendReminderSms = async () => {
  try {
    const acceptedRegistrations = registrations.filter(
      (registration) =>
        registration.status === "accepted" &&
        registration.parentPhone
    );

    if (acceptedRegistrations.length === 0) {
      alert("Brak zaakceptowanych zawodników.");
      return;
    }

    const currentEvent = events.find(
      (event) => event.id === String(params.id)
    );

    for (const registration of acceptedRegistrations) {
      await fetch("/api/send-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: registration.parentPhone,
          message: `ZKS Białogard

Przypominamy o zawodach:

${currentEvent?.name ?? ""}

Data: ${currentEvent?.date ?? ""}

Miasto: ${currentEvent?.city ?? ""}

Do zobaczenia na zawodach.`,
        }),
      });
    }

    alert(
      `Wysłano przypomnienia do ${acceptedRegistrations.length} zawodników.`
    );
  } catch (error) {
    console.error(error);
    alert("Błąd wysyłania przypomnień.");
  }
};

const getEventName = (eventId: string) => {
  
    const event = events.find(
      (item) => item.id === eventId
    );

    if (!event) return eventId;

    return `${event.name} (${event.city})`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "text-green-400";

      case "rejected":
        return "text-red-400";

      default:
        return "text-yellow-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "accepted":
        return "Zaakceptowane";

      case "rejected":
        return "Odrzucone";

      default:
        return "Oczekujące";
    }
  };

  const filteredRegistrations =
    filter === "all"
      ? registrations
      : registrations.filter(
          (item) => item.status === filter
        );

  const pendingCount = registrations.filter(
    (item) => item.status === "pending"
  ).length;

  const acceptedCount = registrations.filter(
    (item) => item.status === "accepted"
  ).length;

  const rejectedCount = registrations.filter(
    (item) => item.status === "rejected"
  ).length;

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">

       <div className="flex flex-col md:flex-row gap-2">

  <button
    onClick={loadData}
    className="bg-yellow-500 text-black px-4 py-2 rounded-xl font-bold"
  >
    Odśwież
  </button>

  <button
    onClick={exportToExcel}
    className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl font-bold"
  >
    📊 Pobierz Excel
  </button>

  <button
    onClick={sendReminderSms}
    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-bold"
  >
    📱 Wyślij przypomnienie SMS
  </button>

</div>

<div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900 border border-yellow-500 rounded-2xl p-4">
            Wszystkie: {registrations.length}
          </div>

          <div className="bg-zinc-900 border border-yellow-500 rounded-2xl p-4 text-yellow-400">
            Oczekujące: {pendingCount}
          </div>

          <div className="bg-zinc-900 border border-green-500 rounded-2xl p-4 text-green-400">
            Zaakceptowane: {acceptedCount}
          </div>

          <div className="bg-zinc-900 border border-red-500 rounded-2xl p-4 text-red-400">
            Odrzucone: {rejectedCount}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => setFilter("all")}
            className="bg-zinc-800 px-4 py-2 rounded-xl"
          >
            Wszystkie
          </button>

          <button
            onClick={() => setFilter("pending")}
            className="bg-yellow-500 text-black px-4 py-2 rounded-xl"
          >
            Oczekujące
          </button>

          <button
            onClick={() => setFilter("accepted")}
            className="bg-green-600 px-4 py-2 rounded-xl"
          >
            Zaakceptowane
          </button>

          <button
            onClick={() => setFilter("rejected")}
            className="bg-red-600 px-4 py-2 rounded-xl"
          >
            Odrzucone
          </button>
        </div>

        {loading ? (
          <div className="text-center">
            Ładowanie zgłoszeń...
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="bg-zinc-900 border border-yellow-500 rounded-3xl p-6">
            Brak zgłoszeń.
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredRegistrations.map(
              (registration) => (
                <div
                  key={registration.id}
                  className="bg-zinc-900 border border-yellow-500 rounded-3xl p-6"
                >
                  <h2 className="text-2xl font-bold text-yellow-400">
                    {registration.childName}{" "}
                    {registration.childSurname}
                  </h2>

                  <div className="mt-4 space-y-2">
                    <p>
                      <strong>Rok urodzenia:</strong>{" "}
                      {registration.childBirthYear}
                    </p>

                    <p>
                      <strong>Płeć:</strong>{" "}
                      {registration.childGender}
                    </p>

                    <p>
                      <strong>Waga:</strong>{" "}
                      {registration.childWeight} kg
                    </p>

                    <p>
                      <strong>Zawody:</strong>{" "}
                      {getEventName(
                        registration.eventId
                      )}
                    </p>

                    <p>
                      <strong>Status:</strong>{" "}
                      <span
                        className={getStatusColor(
                          registration.status
                        )}
                      >
                        {getStatusText(
                          registration.status
                        )}
                      </span>
                    </p>
                  </div>

                  <div className="flex gap-3 mt-6 flex-wrap">
                    <button
                      onClick={() =>
                        updateStatus(
                          registration.id,
                          "accepted"
                        )
                      }
                      className="bg-green-600 hover:bg-green-500 px-5 py-2 rounded-xl font-bold"
                    >
                      Akceptuj
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(
                          registration.id,
                          "rejected"
                        )
                      }
                      className="bg-red-600 hover:bg-red-500 px-5 py-2 rounded-xl font-bold"
                    >
                      Odrzuć
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(
                          registration.id,
                          "pending"
                        )
                      }
                      className="bg-yellow-500 text-black hover:bg-yellow-400 px-5 py-2 rounded-xl font-bold"
                    >
                      Oczekujące
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </main>
  );
}