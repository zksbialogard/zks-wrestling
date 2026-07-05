"use client";

import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X } from "lucide-react";
import { updateEvent } from "@/lib/events";

type EventData = {
  id: string;
  title: string;
  location: string;
  event_date: string;
  registration_deadline: string;
};

type Props = {
  open: boolean;
  event: EventData | null;
  onClose: () => void;
};

export default function EditEventModal({ open, event, onClose }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!event) return;
    setTitle(event.title);
    setLocation(event.location);
    setEventDate(event.event_date?.slice(0, 10) || "");
    setRegistrationDeadline(event.registration_deadline?.slice(0, 10) || "");
  }, [event]);

  if (!open || !event) return null;

  async function handleSubmit() {
    if (!event) return;

    if (!title || !location || !eventDate || !registrationDeadline) {
      toast.warning("Uzupełnij wszystkie wymagane pola.");
      return;
    }

    try {
      setLoading(true);

      await updateEvent(event.id, {
        title,
        location,
        event_date: eventDate,
        registration_deadline: registrationDeadline,
      });

      toast.success("Zawody zostały zaktualizowane.");
      onClose();
      router.refresh();
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Nie udało się zapisać zmian.";
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
              Edytuj zawody
            </h2>
            <p className="mt-2 text-sm text-zks-text-muted">
              Zmień dane zawodów w kalendarzu klubu.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zks-gold-mid/20 p-2 text-zks-text-muted transition hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nazwa zawodów"
            className="w-full rounded-lg border border-zks-gold-mid/30 bg-zks-black px-4 py-3 text-white outline-none focus:border-zks-gold-mid"
          />

          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Miejsce"
            className="w-full rounded-lg border border-zks-gold-mid/30 bg-zks-black px-4 py-3 text-white outline-none focus:border-zks-gold-mid"
          />

          <div>
            <label className="mb-2 block text-xs uppercase tracking-wide text-zks-gold-mid">
              Data zawodów
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full rounded-lg border border-zks-gold-mid/30 bg-zks-black px-4 py-3 text-white outline-none focus:border-zks-gold-mid"
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
              className="w-full rounded-lg border border-zks-gold-mid/30 bg-zks-black px-4 py-3 text-white outline-none focus:border-zks-gold-mid"
            />
          </div>
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
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Zapisywanie..." : "Zapisz zmiany"}
          </button>
        </div>
      </div>
    </div>
  );
}
