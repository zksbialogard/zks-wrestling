import type { Event } from "./events";

export type EventRegistrationStatus = "open" | "closed" | "finished";

function calendarDateFromKey(value: string): Date {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day);
}

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function getEventRegistrationStatus(event: Event): EventRegistrationStatus {
  const today = startOfToday();
  const eventDate = calendarDateFromKey(event.event_date);

  if (!isEventRegistrationEnabled(event)) {
    return eventDate < today ? "finished" : "closed";
  }

  const deadline = calendarDateFromKey(event.registration_deadline);
  deadline.setHours(23, 59, 59, 999);

  if (eventDate < today) {
    return "finished";
  }

  if (deadline < today) {
    return "closed";
  }

  return "open";
}

export function formatEventDate(value: string) {
  return calendarDateFromKey(value).toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatEventDateRange(eventDate: string, endDate?: string | null) {
  if (!endDate || endDate.slice(0, 10) === eventDate.slice(0, 10)) {
    return formatEventDate(eventDate);
  }

  return `${formatEventDate(eventDate)} – ${formatEventDate(endDate)}`;
}

export function isEventRegistrationEnabled(event: Event): boolean {
  if (event.registrations_enabled === true) {
    return true;
  }

  if (event.registrations_enabled === false) {
    return false;
  }

  return event.event_type !== "zgrupowanie";
}
