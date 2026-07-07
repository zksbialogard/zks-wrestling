"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, Trash2, X } from "lucide-react";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { fetchEvents } from "@/lib/events";
import {
  normalizeRegistrationStatus,
  registrationStatusLabel,
} from "@/lib/registration-types";
import {
  deleteAdminRegistration,
  fetchAdminRegistrations,
  updateAdminRegistrationStatus,
  type RegistrationItem,
} from "@/lib/registrations-client";

export default function AdminZgloszeniaPage() {
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [eventNames, setEventNames] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [loading, setLoading] = useState(true);

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      const [data, events] = await Promise.all([
        fetchAdminRegistrations(),
        fetchEvents(),
      ]);

      setRegistrations(data);
      setEventNames(Object.fromEntries(events.map((event) => [event.id, event.title])));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nie udało się pobrać zgłoszeń.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, []);

  const approveRegistration = async (id: string) => {
    try {
      const { registration, notifyResult } = await updateAdminRegistrationStatus(id, "approved");

      if (notifyResult) {
        toast.success("Zgłoszenie zaakceptowane. Rodzic dostał powiadomienie w aplikacji.");
      } else {
        toast.success("Zgłoszenie zaakceptowane.");
      }

      loadRegistrations();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Błąd akceptacji.");
    }
  };

  const rejectRegistration = async (id: string) => {
    try {
      const { registration, notifyResult } = await updateAdminRegistrationStatus(id, "rejected");

      if (notifyResult) {
        toast.success("Zgłoszenie odrzucone. Rodzic dostał powiadomienie w aplikacji.");
      } else {
        toast.success("Zgłoszenie odrzucone.");
      }

      loadRegistrations();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Błąd odrzucenia.");
    }
  };

  const deleteRegistration = async (id: string) => {
    if (!confirm("Usunąć zgłoszenie?")) return;

    try {
      await deleteAdminRegistration(id);
      toast.success("Zgłoszenie usunięte.");
      loadRegistrations();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Błąd usuwania.");
    }
  };

  const filtered = registrations.filter((reg) =>
    filter === "all" ? true : normalizeRegistrationStatus(reg.status) === filter
  );

  const counts = {
    pending: registrations.filter((r) => normalizeRegistrationStatus(r.status) === "pending")
      .length,
    approved: registrations.filter((r) => normalizeRegistrationStatus(r.status) === "approved")
      .length,
    rejected: registrations.filter((r) => normalizeRegistrationStatus(r.status) === "rejected")
      .length,
  };

  return (
    <>
      <AdminPageHeader
        title="Zgłoszenia"
        description="Akceptuj, odrzucaj i usuwaj zgłoszenia na zawody."
      />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
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

      {loading ? (
        <div className="zks-card p-6 text-zks-text-muted">Ładowanie zgłoszeń...</div>
      ) : filtered.length === 0 ? (
        <div className="zks-card p-6 text-zks-text-muted">Brak zgłoszeń w tej kategorii.</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((reg) => {
            const status = normalizeRegistrationStatus(reg.status);

            return (
              <div key={reg.id} className="zks-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {reg.child_name} {reg.child_surname}
                    </h2>
                    <p className="mt-2 text-sm text-zks-gold-bright">
                      {eventNames[reg.event_id] || "Zawody klubowe"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                      status === "approved"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : status === "rejected"
                          ? "bg-red-500/15 text-red-400"
                          : "bg-zks-gold/15 text-zks-gold-bright"
                    }`}
                  >
                    {registrationStatusLabel(reg.status)}
                  </span>
                </div>

                <div className="mt-4 grid gap-1 text-sm text-zks-text sm:grid-cols-2">
                  <p>Rok urodzenia: {reg.child_birth_year}</p>
                  <p>Płeć: {reg.child_gender}</p>
                  <p>Waga: {reg.child_weight} kg</p>
                  <p>Telefon: {reg.parent_phone || "—"}</p>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {status !== "approved" && (
                    <button
                      type="button"
                      onClick={() => approveRegistration(reg.id)}
                      className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-xs font-bold text-white"
                    >
                      <Check className="h-4 w-4" />
                      Akceptuj
                    </button>
                  )}
                  {status !== "rejected" && (
                    <button
                      type="button"
                      onClick={() => rejectRegistration(reg.id)}
                      className="inline-flex items-center gap-2 rounded-lg bg-yellow-600 px-4 py-2 text-xs font-bold text-black"
                    >
                      <X className="h-4 w-4" />
                      Odrzuć
                    </button>
                  )}
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
            );
          })}
        </div>
      )}
    </>
  );
}
