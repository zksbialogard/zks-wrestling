"use client";

import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, Loader2, X } from "lucide-react";

import Modal, { ModalBody, ModalFooter, ModalHeader } from "@/components/ui/Modal";
import { createEvent } from "@/lib/events";
import { formatNotifyResultMessage } from "@/lib/notifications-client";
import { sanitizeNotifyResult } from "@/lib/notify-result-utils";
import EventExtraFields, {
  type EventExtraFieldsState,
} from "@/components/admin/events/EventExtraFields";
import RegistrationSettingsFields, {
  registrationsEnabledFromMode,
  type RegistrationsMode,
} from "@/components/admin/events/RegistrationSettingsFields";
import type { EventType } from "@/lib/event-types";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void | Promise<void>;
};

export default function AddEventModal({ open, onClose, onCreated }: Props) {
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
    season: "2026",
    notes: "",
  });
  const [sendInApp, setSendInApp] = useState(true);
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

      const { event: created, notifyResult } = await createEvent({
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
        notify: {
          inApp: sendInApp,
          push: sendInApp,
        },
      });

      setTitle("");
      setLocation("");
      setEventDate("");
      setRegistrationDeadline("");
      setRegistrationsMode("auto");
      setExtra({
        eventType: "zawody",
        endDate: "",
        ageCategory: "",
        season: "2026",
        notes: "",
      });
      onClose();
      await onCreated?.();
      router.refresh();

      toast.success("Zawody zostały dodane.");

      if (notifyResult) {
        const clean = sanitizeNotifyResult(notifyResult);
        toast.success(formatNotifyResultMessage(clean));

        if (clean.warnings?.length) {
          toast.warning(clean.warnings.slice(0, 2).join(" "));
        }

        if (clean.errors.length) {
          toast.error(clean.errors.slice(0, 3).join(" "));
        }
      }
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
    <Modal open={open}>
      <ModalHeader>
        <div className="flex items-center justify-between">
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
      </ModalHeader>

      <ModalBody className="space-y-4">
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

          <RegistrationSettingsFields
            mode={registrationsMode}
            onModeChange={setRegistrationsMode}
            registrationDeadline={registrationDeadline}
            onRegistrationDeadlineChange={setRegistrationDeadline}
            eventDate={eventDate}
            eventType={extra.eventType}
          />

          <EventExtraFields value={extra} onChange={setExtra} />

          <label className="flex items-center gap-3 text-sm text-zks-text">
            <input
              type="checkbox"
              checked={sendInApp}
              onChange={() => setSendInApp(!sendInApp)}
              className="accent-zks-gold"
            />
            Powiadom rodziców w aplikacji + push
          </label>
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
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CalendarPlus className="h-4 w-4" />
          )}
          {loading ? "Zapisywanie..." : "Zapisz zawody"}
        </button>
      </ModalFooter>
    </Modal>
  );
}
