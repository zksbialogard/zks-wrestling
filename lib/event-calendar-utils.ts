import type { Event } from "./events";
import { formatEventDate } from "./event-utils";
import { dateKeyInWarsaw } from "./date-utils";

export const EVENT_UPCOMING_REMINDER_DAYS = 14;

export type EventsByMonth = {
  monthKey: string;
  monthLabel: string;
  events: Event[];
};

function eventDateKey(eventDate: string): string {
  return eventDate.slice(0, 10);
}

export function isUpcomingEvent(event: Event, todayKey = dateKeyInWarsaw()): boolean {
  return eventDateKey(event.event_date) >= todayKey;
}

export function daysUntilEvent(event: Event, todayKey = dateKeyInWarsaw()): number {
  const [y1, m1, d1] = todayKey.split("-").map(Number);
  const [y2, m2, d2] = eventDateKey(event.event_date).split("-").map(Number);
  const start = Date.UTC(y1, m1 - 1, d1);
  const end = Date.UTC(y2, m2 - 1, d2);
  return Math.round((end - start) / (24 * 60 * 60 * 1000));
}

export function groupUpcomingEventsByMonth(events: Event[]): EventsByMonth[] {
  const todayKey = dateKeyInWarsaw();
  const upcoming = events
    .filter((event) => isUpcomingEvent(event, todayKey))
    .sort((a, b) => a.event_date.localeCompare(b.event_date));

  const groups = new Map<string, EventsByMonth>();

  for (const event of upcoming) {
    const dateKey = eventDateKey(event.event_date);
    const [year, month] = dateKey.split("-").map(Number);
    const monthKey = `${year}-${String(month).padStart(2, "0")}`;
    const monthLabel = new Date(year, month - 1, 1).toLocaleDateString("pl-PL", {
      month: "long",
      year: "numeric",
    });

    const existing = groups.get(monthKey);

    if (existing) {
      existing.events.push(event);
      continue;
    }

    groups.set(monthKey, {
      monthKey,
      monthLabel,
      events: [event],
    });
  }

  return Array.from(groups.values());
}

export function formatEventDayBadge(eventDate: string): string {
  const dateKey = eventDateKey(eventDate);
  const [, , day] = dateKey.split("-").map(Number);
  return String(day);
}

export function formatEventWeekday(eventDate: string): string {
  const dateKey = eventDateKey(eventDate);
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("pl-PL", { weekday: "long" });
}

export function dedupeEventsByDateAndTitle(events: Event[]): Event[] {
  const seen = new Set<string>();

  return events.filter((event) => {
    const key = `${event.event_date.slice(0, 10)}|${event.title.trim().toLowerCase()}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export function filterEventsByType(events: Event[], filter: "all" | "zawody" | "zgrupowanie") {
  if (filter === "all") {
    return events;
  }

  return events.filter((event) => (event.event_type || "zawody") === filter);
}
