"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Bell, Check, Loader2, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import EventResultsSection from "@/components/admin/EventResultsSection";
import NotifyEventModal from "@/components/admin/events/NotifyEventModal";
import type { EventItem } from "@/components/admin/events/EventRow";
import RegistrationEditModal from "@/components/admin/RegistrationEditModal";
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
import { getNotifySmsFailureAlert, sendAdminNotify } from "@/lib/notifications-client";
import { sanitizeNotifyResult } from "@/lib/notify-result-utils";
import { exportStartListToExcel, buildStartListRows } from "@/lib/start-list-export";

export default function AdminEventRegistrationsPage() {
  const params = useParams();
  const eventId = String(params.id);

  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [editingRegistration, setEditingRegistration] = useState<RegistrationItem | null>(null);
  const [remindingId, setRemindingId] = useState<string | null>(null);

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
      const { registration, notifyResult } = await updateAdminRegistrationStatus(id, status);
      const clean = notifyResult ? sanitizeNotifyResult(notifyResult) : null;
      const smsFailure =
        clean && (status === "approved" || status === "rejected")
          ? getNotifySmsFailureAlert(clean, Boolean(registration.parent_phone))
          : null;

      if (smsFailure) {
        toast.error(smsFailure, { duration: 12000 });
      } else {
        toast.success(
          status === "approved"
            ? "Zgłoszenie zaakceptowane."
            : status === "rejected"
              ? "Zgłoszenie odrzucone."
              : "Przywrócono status oczekujące."
        );
      }

      loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Błąd aktualizacji.");
    }
  };

  const exportToExcel = () => {
    const result = exportStartListToExcel(
      registrations,
      `${event?.title || "zawody"}_lista_startowa`
    );

    if (!result.ok) {
      toast.warning(result.reason);
      return;
    }

    toast.success(`Pobrano listę startową (${result.count} zawodników).`);
  };

  const sendReminderToParent = async (registration: RegistrationItem) => {
    if (!event) return;

    try {
      setRemindingId(registration.id);
      const eventDate = new Date(event.event_date).toLocaleDateString("pl-PL");
      const registrationDeadline = new Date(event.registration_deadline).toLocaleDateString("pl-PL");
      const result = sanitizeNotifyResult(
        await sendAdminNotify({
          templateKey: "event_reminder",
          variables: {
            title: event.title,
            location: event.location,
            eventDate,
            registrationDeadline,
            link: `/zawody/${event.id}`,
          },
          channels: { inApp: true, push: true },
          type: "event",
          link: "/panel-rodzica/moje-zgloszenia",
          targetUid: registration.parent_uid,
        })
      );

      if (result.inAppSent > 0 || result.pushSent > 0) {
        toast.success(
          `Przypomnienie wysłane do rodzica (${registration.child_name} ${registration.child_surname}).`
        );
      } else {
        toast.warning("Nie udało się wysłać przypomnienia.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Błąd wysyłania przypomnienia.");
    } finally {
      setRemindingId(null);
    }
  };

  const eventForNotify: EventItem | null = event
    ? {
        id: event.id,
        title: event.title,
        location: event.location,
        event_date: event.event_date,
        registration_deadline: event.registration_deadline,
      }
    : null;

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

  const startListRows = buildStartListRows(registrations);

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
          Lista startowa (Excel)
        </button>
        <button
          type="button"
          onClick={() => setNotifyOpen(true)}
          disabled={!event}
          className="zks-btn-outline inline-flex items-center gap-2 px-4 py-2 text-xs disabled:opacity-60"
          title="Przypomnienie do wszystkich rodziców"
        >
          <Bell className="h-4 w-4" />
          Powiadom rodziców
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

      <EventResultsSection eventId={eventId} registrations={registrations} />

      <div className="zks-card mb-8 overflow-hidden">
        <div className="border-b border-zks-gold-mid/20 px-5 py-4">
          <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold uppercase text-white">
            Lista startowa
          </h2>
          <p className="mt-1 text-xs text-zks-text-muted">
            Tylko zaakceptowani zawodnicy. Pobierz Excel w tym samym formacie.
          </p>
        </div>

        {startListRows.length === 0 ? (
          <p className="p-5 text-sm text-zks-text-muted">
            Brak zaakceptowanych zawodników — najpierw kliknij „Akceptuj” przy zgłoszeniach.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-zks-black/40 text-xs uppercase tracking-wide text-zks-gold-mid">
                <tr>
                  <th className="px-5 py-3">Imię i Nazwisko</th>
                  <th className="px-5 py-3">Data urodzenia</th>
                  <th className="px-5 py-3">Klub</th>
                  <th className="px-5 py-3">Kat. wagowa</th>
                </tr>
              </thead>
              <tbody>
                {startListRows.map((row, index) => (
                  <tr
                    key={`${row["Imię i Nazwisko"]}-${index}`}
                    className="border-t border-zks-gold-mid/10 text-zks-text"
                  >
                    <td className="px-5 py-3 font-medium text-white">{row["Imię i Nazwisko"]}</td>
                    <td className="px-5 py-3">{row["Data urodzenia"]}</td>
                    <td className="px-5 py-3">{row.Klub}</td>
                    <td className="px-5 py-3">{row["Kat. wagowa"]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
                  <button
                    type="button"
                    onClick={() => setEditingRegistration(registration)}
                    className="zks-btn-outline inline-flex items-center gap-2 px-4 py-2 text-xs"
                  >
                    <Pencil className="h-4 w-4" />
                    Edytuj dane
                  </button>
                  <button
                    type="button"
                    disabled={remindingId === registration.id}
                    onClick={() => sendReminderToParent(registration)}
                    className="zks-btn-outline inline-flex items-center gap-2 px-4 py-2 text-xs disabled:opacity-60"
                    title="Wyślij przypomnienie rodzicowi"
                  >
                    {remindingId === registration.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Bell className="h-4 w-4" />
                    )}
                    Przypomnij
                  </button>
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

      <NotifyEventModal
        open={notifyOpen}
        event={eventForNotify}
        onClose={() => setNotifyOpen(false)}
      />

      <RegistrationEditModal
        open={Boolean(editingRegistration)}
        registration={editingRegistration}
        onClose={() => setEditingRegistration(null)}
        onSaved={loadData}
      />
    </>
  );
}
