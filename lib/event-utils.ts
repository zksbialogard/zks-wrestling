import type { Event } from "./events";

export type EventRegistrationStatus = "open" | "closed" | "finished";

export function getEventRegistrationStatus(event: Event): EventRegistrationStatus {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const eventDate = new Date(event.event_date);
  eventDate.setHours(0, 0, 0, 0);

  const deadline = new Date(event.registration_deadline);
  deadline.setHours(23, 59, 59, 999);

  if (eventDate < now) {
    return "finished";
  }

  if (deadline < now) {
    return "closed";
  }

  return "open";
}

export function formatEventDate(value: string) {
  return new Date(value).toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
