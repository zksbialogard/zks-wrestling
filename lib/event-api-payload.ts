import type { EventType } from "./event-types";
import { isEventType } from "./event-types";

export type EventPayload = {
  title: string;
  location: string;
  event_date: string;
  registration_deadline: string;
  event_type?: EventType;
  end_date?: string | null;
  age_category?: string | null;
  season?: number | null;
  notes?: string | null;
  registrations_enabled?: boolean | null;
};

export function normalizeEventPayload(body: unknown): EventPayload | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const input = body as EventPayload;

  if (
    !input.title?.trim() ||
    !input.location?.trim() ||
    !input.event_date ||
    !input.registration_deadline
  ) {
    return null;
  }

  const eventType =
    input.event_type && isEventType(input.event_type) ? input.event_type : "zawody";

  return {
    title: input.title.trim(),
    location: input.location.trim(),
    event_date: input.event_date.slice(0, 10),
    registration_deadline: input.registration_deadline.slice(0, 10),
    event_type: eventType,
    end_date: input.end_date ? input.end_date.slice(0, 10) : null,
    age_category: input.age_category?.trim() || null,
    season: typeof input.season === "number" ? input.season : null,
    notes: input.notes?.trim() || null,
    registrations_enabled:
      typeof input.registrations_enabled === "boolean"
        ? input.registrations_enabled
        : null,
  };
}

export function eventPayloadToRow(payload: EventPayload) {
  return {
    title: payload.title,
    location: payload.location,
    event_date: payload.event_date,
    registration_deadline: payload.registration_deadline,
    event_type: payload.event_type || "zawody",
    end_date: payload.end_date,
    age_category: payload.age_category,
    season: payload.season,
    notes: payload.notes,
    registrations_enabled: payload.registrations_enabled ?? null,
  };
}
