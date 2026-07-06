"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { sendAdminNotify, formatNotifyResultMessage, getNotifySmsFailureAlert } from "@/lib/notifications-client";
import { sanitizeNotifyResult } from "@/lib/notify-result-utils";
import { syncParentsFromFirebaseToSupabase } from "@/lib/parents-admin-client";
import type { EventItem } from "./EventRow";

type Props = {
  open: boolean;
  event: EventItem | null;
  onClose: () => void;
};

const TEMPLATE_OPTIONS = [
  { key: "event_new", label: "Nowe zawody" },
  { key: "event_reminder", label: "Przypomnienie o zawodach" },
  { key: "training_cancelled", label: "Odwołanie treningu / zmiana" },
] as const;

export default function NotifyEventModal({ open, event, onClose }: Props) {
  const [templateKey, setTemplateKey] =
    useState<(typeof TEMPLATE_OPTIONS)[number]["key"]>("event_reminder");
  const [sendSms, setSendSms] = useState(false);
  const [sendInApp, setSendInApp] = useState(true);
  const [customMessage, setCustomMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open || !event) return null;

  const eventDate = new Date(event.event_date).toLocaleDateString("pl-PL");
  const registrationDeadline = new Date(
    event.registration_deadline
  ).toLocaleDateString("pl-PL");

  async function handleSend() {
    try {
      setLoading(true);

      const syncedCount = await syncParentsFromFirebaseToSupabase();

      const result = sanitizeNotifyResult(
        await sendAdminNotify({
          templateKey,
          variables: {
            title: event!.title,
            location: event!.location,
            eventDate,
            registrationDeadline,
            link: `${window.location.origin}/zawody/${event!.id}`,
            message: customMessage || `Zmiana dotycząca zawodów ${event!.title}.`,
          },
          channels: {
            sms: sendSms,
            inApp: sendInApp,
            push: sendInApp,
          },
          type: "event",
          link: `/zawody/${event!.id}`,
        })
      );

      const smsFailure = getNotifySmsFailureAlert(result, sendSms);

      if (smsFailure) {
        toast.error(smsFailure, { duration: 12000 });
      } else {
        toast.success(
          `${formatNotifyResultMessage(result)} (zsynchronizowano ${syncedCount} rodziców)`
        );
      }

      if (result.warnings.length) {
        toast.warning(result.warnings.slice(0, 2).join(" "));
      }

      if (result.errors.length && !smsFailure) {
        toast.error(result.errors.slice(0, 3).join(" "));
      }

      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nie udało się wysłać powiadomień.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="zks-card w-full max-w-2xl p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold uppercase text-white">
              Wyślij powiadomienie
            </h2>
            <p className="mt-2 text-sm text-zks-text-muted">
              {event.title} · {eventDate}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zks-gold-mid/20 p-2 text-zks-text-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <label className="block space-y-2">
            <span className="text-xs uppercase tracking-wide text-zks-gold-mid">
              Szablon wiadomości
            </span>
            <select
              value={templateKey}
              onChange={(e) =>
                setTemplateKey(e.target.value as (typeof TEMPLATE_OPTIONS)[number]["key"])
              }
              className="w-full rounded-lg border border-zks-gold-mid/30 bg-zks-black px-4 py-3 text-white outline-none"
            >
              {TEMPLATE_OPTIONS.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {templateKey === "training_cancelled" && (
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={4}
              placeholder="Treść komunikatu dla rodziców..."
              className="w-full rounded-lg border border-zks-gold-mid/30 bg-zks-black px-4 py-3 text-sm text-white outline-none"
            />
          )}

          <label className="flex items-center gap-3 text-sm text-zks-text">
            <input
              type="checkbox"
              checked={sendInApp}
              onChange={() => setSendInApp(!sendInApp)}
              className="accent-zks-gold"
            />
            Powiadomienie w aplikacji + push (darmowe, zalecane)
          </label>

          <label className="flex items-center gap-3 text-sm text-zks-text-muted">
            <input
              type="checkbox"
              checked={sendSms}
              onChange={() => setSendSms(!sendSms)}
              className="accent-zks-gold"
            />
            SMS (opcjonalnie — wymaga aktywnego konta SMSAPI)
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="zks-btn-outline px-5 py-2.5 text-sm">
            Anuluj
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleSend}
            className="zks-btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Wysyłanie..." : "Wyślij"}
          </button>
        </div>
      </div>
    </div>
  );
}
