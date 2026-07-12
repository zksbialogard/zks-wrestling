"use client";

import EventStatusBadge from "@/components/admin/events/EventStatusBadge";
import { EVENT_TYPE_LABELS, type EventType } from "@/lib/event-types";
import {
  getEventRegistrationStatus,
  type EventRegistrationStatus,
} from "@/lib/event-utils";
import type { Event } from "@/lib/events";

export type RegistrationsMode = "auto" | "enabled" | "disabled";

export function registrationsModeFromEvent(
  registrationsEnabled?: boolean | null
): RegistrationsMode {
  if (registrationsEnabled === true) return "enabled";
  if (registrationsEnabled === false) return "disabled";
  return "auto";
}

export function registrationsEnabledFromMode(
  mode: RegistrationsMode
): boolean | null {
  if (mode === "enabled") return true;
  if (mode === "disabled") return false;
  return null;
}

type Props = {
  mode: RegistrationsMode;
  onModeChange: (mode: RegistrationsMode) => void;
  registrationDeadline: string;
  onRegistrationDeadlineChange: (value: string) => void;
  eventDate: string;
  eventType: EventType;
};

function previewStatus(
  eventDate: string,
  registrationDeadline: string,
  eventType: EventType,
  mode: RegistrationsMode
): EventRegistrationStatus {
  const preview: Event = {
    id: "preview",
    title: "",
    location: "",
    event_date: eventDate,
    registration_deadline: registrationDeadline,
    event_type: eventType,
    registrations_enabled: registrationsEnabledFromMode(mode),
  };

  return getEventRegistrationStatus(preview);
}

export default function RegistrationSettingsFields({
  mode,
  onModeChange,
  registrationDeadline,
  onRegistrationDeadlineChange,
  eventDate,
  eventType,
}: Props) {
  const status = previewStatus(
    eventDate,
    registrationDeadline,
    eventType,
    mode
  );

  const autoHint =
    eventType === "zgrupowanie"
      ? `${EVENT_TYPE_LABELS.zgrupowanie}: zapisy domyślnie wyłączone. Wybierz „Włączone”, aby otworzyć zgłoszenia online.`
      : `${EVENT_TYPE_LABELS.zawody}: zapisy domyślnie włączone do terminu zgłoszeń.`;

  return (
    <div className="space-y-4 rounded-xl border border-zks-gold-mid/20 bg-zks-black/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-zks-gold-mid">
          Zapisy online
        </p>
        <EventStatusBadge status={status} />
      </div>

      <div>
        <label className="mb-2 block text-xs uppercase tracking-wide text-zks-gold-mid">
          Status zapisów
        </label>
        <select
          value={mode}
          onChange={(e) => onModeChange(e.target.value as RegistrationsMode)}
          className="w-full rounded-lg border border-zks-gold-mid/30 bg-zks-black px-4 py-3 text-white outline-none focus:border-zks-gold-mid"
        >
          <option value="auto">Automatycznie (wg typu imprezy)</option>
          <option value="enabled">Włączone — zgłoszenia online</option>
          <option value="disabled">Wyłączone — bez zgłoszeń online</option>
        </select>
        <p className="mt-2 text-xs text-zks-text-muted">{autoHint}</p>
      </div>

      <div>
        <label className="mb-2 block text-xs uppercase tracking-wide text-zks-gold-mid">
          Termin zgłoszeń
        </label>
        <input
          type="date"
          value={registrationDeadline}
          onChange={(e) => onRegistrationDeadlineChange(e.target.value)}
          className="w-full rounded-lg border border-zks-gold-mid/30 bg-zks-black px-4 py-3 text-white outline-none focus:border-zks-gold-mid"
        />
        <p className="mt-2 text-xs text-zks-text-muted">
          Po tym dniu zapisy zostaną automatycznie zamknięte (jeśli są włączone).
        </p>
      </div>
    </div>
  );
}
