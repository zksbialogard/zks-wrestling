const WARSAW_TIMEZONE = "Europe/Warsaw";

const WEEKDAY_MAP: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export function dateKeyInWarsaw(daysOffset = 0): string {
  const base = new Date();

  if (daysOffset !== 0) {
    base.setDate(base.getDate() + daysOffset);
  }

  return new Intl.DateTimeFormat("sv-SE", { timeZone: WARSAW_TIMEZONE }).format(base);
}

export function dayOfWeekInWarsaw(dateKey: string): number {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: WARSAW_TIMEZONE,
    weekday: "short",
  }).format(date);

  return WEEKDAY_MAP[weekday.replace(".", "")] ?? 0;
}

export function formatDateKeyPl(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function relativeDayLabel(dateKey: string, todayKey = dateKeyInWarsaw()): string {
  if (dateKey === todayKey) {
    return "Dziś";
  }

  if (dateKey === dateKeyInWarsaw(1)) {
    return "Jutro";
  }

  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("pl-PL", { weekday: "short", day: "numeric", month: "short" });
}
