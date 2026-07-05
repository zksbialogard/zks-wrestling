"use client";

import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { toast } from "sonner";
import { Check, Trash2, X } from "lucide-react";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
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

export default function AdminZgloszeniaPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [events, setEvents] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  const loadRegistrations = async () => {
    const registrationsSnapshot = await getDocs(collection(db, "registrations"));
    const registrationsData = registrationsSnapshot.docs.map((item) => ({
      id: item.id,
      ...(item.data() as Omit<Registration, "id">),
    })) as Registration[];

    setRegistrations(registrationsData);

    const eventsSnapshot = await getDocs(collection(db, "events"));
    const eventMap: Record<string, string> = {};
    eventsSnapshot.forEach((item) => {
      eventMap[item.id] = item.data().name || item.data().title || "Bez nazwy";
    });
    setEvents(eventMap);
  };

  useEffect(() => {
    loadRegistrations();
  }, []);

  const getEventName = (eventId: string) => events[eventId] ?? "Nieznane zawody";

  const approveRegistration = async (id: string) => {
    await updateDoc(doc(db, "registrations", id), { status: "approved" });
    toast.success("Zgłoszenie zaakceptowane.");
    loadRegistrations();
  };

  const rejectRegistration = async (id: string) => {
    await updateDoc(doc(db, "registrations", id), { status: "rejected" });
    toast.success("Zgłoszenie odrzucone.");
    loadRegistrations();
  };

  const deleteRegistration = async (id: string) => {
    if (!confirm("Usunąć zgłoszenie?")) return;
    await deleteDoc(doc(db, "registrations", id));
    toast.success("Zgłoszenie usunięte.");
    loadRegistrations();
  };

  const filtered = registrations.filter((reg) =>
    filter === "all" ? true : reg.status === filter
  );

  const counts = {
    pending: registrations.filter((r) => r.status === "pending").length,
    approved: registrations.filter((r) => r.status === "approved").length,
    rejected: registrations.filter((r) => r.status === "rejected").length,
  };

  return (
    <>
      <AdminPageHeader
        title="Zgłoszenia"
        description="Akceptuj, odrzucaj i usuwaj zgłoszenia na zawody."
      />

      <div className="mb-6 grid grid-cols-3 gap-3">
        {[
          { label: "Oczekujące", value: counts.pending, color: "text-zks-gold-bright" },
          { label: "Zaakceptowane", value: counts.approved, color: "text-green-400" },
          { label: "Odrzucone", value: counts.rejected, color: "text-red-400" },
        ].map((stat) => (
          <div key={stat.label} className="zks-card p-4 text-center">
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs uppercase tracking-wide text-zks-text-muted">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {(["all", "pending", "approved", "rejected"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
              filter === item
                ? "bg-zks-gold text-zks-black"
                : "border border-zks-gold-mid/30 text-zks-text"
            }`}
          >
            {item === "all"
              ? "Wszystkie"
              : item === "pending"
                ? "Oczekujące"
                : item === "approved"
                  ? "Zaakceptowane"
                  : "Odrzucone"}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="zks-card p-6 text-zks-text-muted">Brak zgłoszeń w tej kategorii.</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((reg) => (
            <div key={reg.id} className="zks-card p-6">
              <h2 className="text-xl font-bold text-white">
                {reg.childName} {reg.childSurname}
              </h2>
              <p className="mt-2 text-sm text-zks-gold-bright">{getEventName(reg.eventId)}</p>

              <div className="mt-4 grid gap-1 text-sm text-zks-text sm:grid-cols-2">
                <p>Rok urodzenia: {reg.childBirthYear}</p>
                <p>Płeć: {reg.childGender}</p>
                <p>Waga: {reg.childWeight} kg</p>
                <p>Telefon: {reg.parentPhone}</p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => approveRegistration(reg.id)}
                  className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-xs font-bold text-white"
                >
                  <Check className="h-4 w-4" />
                  Akceptuj
                </button>
                <button
                  type="button"
                  onClick={() => rejectRegistration(reg.id)}
                  className="inline-flex items-center gap-2 rounded-lg bg-yellow-600 px-4 py-2 text-xs font-bold text-black"
                >
                  <X className="h-4 w-4" />
                  Odrzuć
                </button>
                <button
                  type="button"
                  onClick={() => deleteRegistration(reg.id)}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 px-4 py-2 text-xs text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                  Usuń
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
