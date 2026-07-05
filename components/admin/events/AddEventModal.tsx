"use client";

import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, Loader2, X } from "lucide-react";

import { createEvent } from "@/lib/events";
import { notifyParentsAboutEvent } from "@/lib/notify-event";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function AddEventModal({ open, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [sendSms, setSendSms] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!open) return null;

  async function handleSubmit() {
    if (!title || !location || !eventDate || !registrationDeadline) {
      toast.warning("Uzupełnij wszystkie wymagane pola.");
      return;
    }

    try {
      setLoading(true);

      await createEvent({
        title,
        location,
        event_date: eventDate,
        registration_deadline: registrationDeadline,
      });

      if (sendEmail || sendSms) {
        const result = await notifyParentsAboutEvent({
          title,
          location,
          eventDate,
          registrationDeadline,
          sendEmail,
          sendSms,
        });

        toast.success(
          `Zawody dodane. Email: ${result.emailsSent}, SMS: ${result.smsSent}.`
        );
      } else {
        toast.success("Zawody zostały dodane.");
      }

      setTitle("");
      setLocation("");
      setEventDate("");
      setRegistrationDeadline("");
      onClose();
      router.refresh();
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Nie udało się dodać zawodów.";
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
              Dodaj zawody
            </h2>
            <p className="mt-2 text-sm text-zks-text-muted">
              Dodaj zawody i opcjonalnie powiadom rodziców.
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
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nazwa zawodów"
            className="w-full rounded-lg border border-zks-gold-mid/30 bg-zks-black px-4 py-3 text-white outline-none"
          />

          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Miejsce"
            className="w-full rounded-lg border border-zks-gold-mid/30 bg-zks-black px-4 py-3 text-white outline-none"
          />

          <div>
            <label className="mb-2 block text-xs uppercase tracking-wide text-zks-gold-mid">
              Data zawodów
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full rounded-lg border border-zks-gold-mid/30 bg-zks-black px-4 py-3 text-white outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-wide text-zks-gold-mid">
              Termin zgłoszeń
            </label>
            <input
              type="date"
              value={registrationDeadline}
              onChange={(e) => setRegistrationDeadline(e.target.value)}
              className="w-full rounded-lg border border-zks-gold-mid/30 bg-zks-black px-4 py-3 text-white outline-none"
            />
          </div>

          <label className="flex items-center gap-3 text-sm text-zks-text">
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={() => setSendEmail(!sendEmail)}
              className="accent-zks-gold"
            />
            Powiadom rodziców e-mailem
          </label>

          <label className="flex items-center gap-3 text-sm text-zks-text">
            <input
              type="checkbox"
              checked={sendSms}
              onChange={() => setSendSms(!sendSms)}
              className="accent-zks-gold"
            />
            Powiadom rodziców SMS
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="zks-btn-outline px-5 py-2.5 text-sm">
            Anuluj
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="zks-btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CalendarPlus className="h-4 w-4" />
            )}
            {loading ? "Zapisywanie..." : "Zapisz zawody"}
          </button>
        </div>
      </div>
    </div>
  );
}
