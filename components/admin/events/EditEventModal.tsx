"use client";

import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X } from "lucide-react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "@/components/ui/Modal";
import { updateEvent } from "@/lib/events";

import EventExtraFields, {
  type EventExtraFieldsState,
} from "@/components/admin/events/EventExtraFields";
import RegistrationSettingsFields, {
  registrationsEnabledFromMode,
  registrationsModeFromEvent,
  type RegistrationsMode,
} from "@/components/admin/events/RegistrationSettingsFields";
import type { EventType } from "@/lib/event-types";

type EventData = {
  id: string;
  title: string;
  location: string;
  event_date: string;
  registration_deadline: string;
  event_type?: EventType | string;
  end_date?: string | null;
  age_category?: string | null;
  season?: number | null;
  notes?: string | null;
  registrations_enabled?: boolean | null;
};

type Props = {
  open: boolean;
  event: EventData | null;
  onClose: () => void;
  onUpdated: (event: EventData) => void;
};

export default function EditEventModal({ open, event, onClose, onUpdated }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [registrationsMode, setRegistrationsMode] =
    useState<RegistrationsMode>("auto");
  const [extra, setExtra] = useState<EventExtraFieldsState>({
    eventType: "zawody",
    endDate: "",
    ageCategory: "",
    season: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!event) return;
    setTitle(event.title);
    setLocation(event.location);
    setEventDate(event.event_date?.slice(0, 10) || "");
    setRegistrationDeadline(event.registration_deadline?.slice(0, 10) || "");
    setRegistrationsMode(registrationsModeFromEvent(event.registrations_enabled));
    setExtra({
      eventType: (event.event_type as EventType) || "zawody",
      endDate: event.end_date?.slice(0, 10) || "",
      ageCategory: event.age_category || "",
      season: event.season ? String(event.season) : "",
      notes: event.notes || "",
    });
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
        event_type: extra.eventType,
        end_date: extra.endDate || null,
        age_category: extra.ageCategory || null,
        season: extra.season ? Number(extra.season) : null,
        notes: extra.notes || null,
        registrations_enabled: registrationsEnabledFromMode(registrationsMode),
      });

      onUpdated({
        id: event.id,
        title,
        location,
        event_date: eventDate,
        registration_deadline: registrationDeadline,
        event_type: extra.eventType,
        end_date: extra.endDate || null,
        age_category: extra.ageCategory || null,
        season: extra.season ? Number(extra.season) : null,
        notes: extra.notes || null,
        registrations_enabled: registrationsEnabledFromMode(registrationsMode),
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
    <Modal open={open}>
      <ModalHeader>
        <div className="flex items-center justify-between">
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
      </ModalHeader>

      <ModalBody className="space-y-4">
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

          <RegistrationSettingsFields
            mode={registrationsMode}
            onModeChange={setRegistrationsMode}
            registrationDeadline={registrationDeadline}
            onRegistrationDeadlineChange={setRegistrationDeadline}
            eventDate={eventDate}
            eventType={extra.eventType}
          />

          <EventExtraFields value={extra} onChange={setExtra} />
      </ModalBody>

      <ModalFooter>
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
      </ModalFooter>
    </Modal>
  );
}
