"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { ArrowLeft, Check, Loader2, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { formatEventDate } from "@/lib/event-utils";
import { fetchEventById, type Event } from "@/lib/events";
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

export default function AdminEventRegistrationsPage() {
  const params = useParams();
  const eventId = String(params.id);

  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventData, registrationData] = await Promise.all([
        fetchEventById(eventId),
        fetchAdminRegistrations(eventId),
      ]);

      setEvent(eventData);
      setRegistrations(registrationData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Błąd ładowania danych.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [eventId]);

  const updateStatus = async (id: string, status: "pending" | "approved" | "rejected") => {
    try {
      await updateAdminRegistrationStatus(id, status);
      toast.success(
        status === "approved"
          ? "Zgłoszenie zaakceptowane."
          : status === "rejected"
            ? "Zgłoszenie odrzucone."
            : "Przywrócono status oczekujące."
      );
      loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Błąd aktualizacji.");
    }
  };

  const exportToExcel = () => {
    const approved = registrations.filter(
      (item) => normalizeRegistrationStatus(item.status) === "approved"
    );

    if (!approved.length) {
      toast.warning("Brak zaakceptowanych zawodników.");
      return;
    }

    const data = approved.map((item) => ({
      Imię: item.child_name,
      Nazwisko: item.child_surname,
      Rocznik: item.child_birth_year,
      Waga: `${item.child_weight} kg`,
      Klub: "ZKS Białogard",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Lista startowa");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(fileData, `${event?.title || "zawody"}_lista_startowa.xlsx`);
  };

  const sendReminderSms = async () => {
    const approved = registrations.filter(
      (item) =>
        normalizeRegistrationStatus(item.status) === "approved" && item.parent_phone
    );

    if (!approved.length) {
      toast.warning("Brak zaakceptowanych zawodników z numerem telefonu.");
      return;
    }

    try {
      for (const item of approved) {
        await fetch("/api/send-sms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: item.parent_phone,
            message: `ZKS Białogard: przypomnienie o zawodach „${event?.title}” — ${event ? formatEventDate(event.event_date) : ""}, ${event?.location || ""}.`,
          }),
        });
      }

      toast.success(`Wysłano przypomnienia SMS do ${approved.length} rodziców.`);
    } catch (error) {
      toast.error("Błąd wysyłania przypomnień.");
    }
  };

  const filtered =
    filter === "all"
      ? registrations
      : registrations.filter((item) => normalizeRegistrationStatus(item.status) === filter);

  const counts = {
    all: registrations.length,
    pending: registrations.filter((r) => normalizeRegistrationStatus(r.status) === "pending")
      .length,
    approved: registrations.filter((r) => normalizeRegistrationStatus(r.status) === "approved")
      .length,
    rejected: registrations.filter((r) => normalizeRegistrationStatus(r.status) === "rejected")
      .length,
  };

  return (
    <>
      <Link
        href="/admin/zawody"
        className="mb-6 inline-flex items-center gap-2 text-sm text-zks-text-muted hover:text-zks-gold-bright"
      >
        <ArrowLeft className="h-4 w-4" />
        Wróć do zawodów
      </Link>

      <AdminPageHeader
        title={event?.title || "Zgłoszenia na zawody"}
        description={
          event
            ? `${event.location} · ${formatEventDate(event.event_date)}`
            : "Lista zgłoszeń na wybrane zawody"
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <button type="button" onClick={loadData} className="zks-btn-outline px-4 py-2 text-xs">
          Odśwież
        </button>
        <button type="button" onClick={exportToExcel} className="zks-btn-primary px-4 py-2 text-xs">
          Pobierz Excel
        </button>
        <button type="button" onClick={sendReminderSms} className="zks-btn-outline px-4 py-2 text-xs">
          Wyślij SMS przypomnienie
        </button>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        {[
          { key: "all", label: "Wszystkie", value: counts.all },
          { key: "pending", label: "Oczekujące", value: counts.pending },
          { key: "approved", label: "Zaakceptowane", value: counts.approved },
          { key: "rejected", label: "Odrzucone", value: counts.rejected },
        ].map((stat) => (
          <div key={stat.key} className="zks-card p-4 text-center">
            <div className="text-2xl font-bold text-zks-gold-bright">{stat.value}</div>
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
        <div className="zks-card flex items-center gap-3 p-6 text-zks-text-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
          Ładowanie zgłoszeń...
        </div>
      ) : filtered.length === 0 ? (
        <div className="zks-card p-6 text-zks-text-muted">Brak zgłoszeń w tej kategorii.</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((registration) => {
            const status = normalizeRegistrationStatus(registration.status);

            return (
              <div key={registration.id} className="zks-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 className="text-xl font-bold text-white">
                    {registration.child_name} {registration.child_surname}
                  </h2>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                      status === "approved"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : status === "rejected"
                          ? "bg-red-500/15 text-red-400"
                          : "bg-zks-gold/15 text-zks-gold-bright"
                    }`}
                  >
                    {registrationStatusLabel(registration.status)}
                  </span>
                </div>

                <div className="mt-4 grid gap-1 text-sm text-zks-text sm:grid-cols-2">
                  <p>Rok urodzenia: {registration.child_birth_year}</p>
                  <p>Płeć: {registration.child_gender}</p>
                  <p>Waga: {registration.child_weight} kg</p>
                  <p>Telefon: {registration.parent_phone || "—"}</p>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {status !== "approved" && (
                    <button
                      type="button"
                      onClick={() => updateStatus(registration.id, "approved")}
                      className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-xs font-bold text-white"
                    >
                      <Check className="h-4 w-4" />
                      Akceptuj
                    </button>
                  )}
                  {status !== "rejected" && (
                    <button
                      type="button"
                      onClick={() => updateStatus(registration.id, "rejected")}
                      className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white"
                    >
                      <X className="h-4 w-4" />
                      Odrzuć
                    </button>
                  )}
                  {status !== "pending" && (
                    <button
                      type="button"
                      onClick={() => updateStatus(registration.id, "pending")}
                      className="zks-btn-outline px-4 py-2 text-xs"
                    >
                      Przywróć oczekujące
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={async () => {
                      if (!confirm("Usunąć zgłoszenie?")) return;
                      await deleteAdminRegistration(registration.id);
                      toast.success("Zgłoszenie usunięte.");
                      loadData();
                    }}
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
