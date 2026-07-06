export type TrainingGroupId = "starsza" | "srednia" | "najmlodsza";

export type TrainingGroup = {
  id: TrainingGroupId;
  label: string;
  days: number[];
  start: string;
  end: string;
};

export type TrainingSession = {
  date: Date;
  dateKey: string;
  dayName: string;
  start: string;
  end: string;
  groupId: TrainingGroupId;
  groupLabel: string;
};

const DAY_NAMES = [
  "Niedziela",
  "Poniedziałek",
  "Wtorek",
  "Środa",
  "Czwartek",
  "Piątek",
  "Sobota",
];

export const TRAINING_GROUPS: Record<TrainingGroupId, TrainingGroup> = {
  starsza: {
    id: "starsza",
    label: "Grupa Starsza",
    days: [1, 2, 3, 4, 5],
    start: "17:30",
    end: "19:30",
  },
  srednia: {
    id: "srednia",
    label: "Grupa Średnia",
    days: [1, 3, 5],
    start: "16:00",
    end: "17:30",
  },
  najmlodsza: {
    id: "najmlodsza",
    label: "Grupa Najmłodsza",
    days: [2, 4],
    start: "16:15",
    end: "17:15",
  },
};

export const TRAINING_GROUP_OPTIONS = Object.values(TRAINING_GROUPS);

export function isTrainingGroupId(value: string): value is TrainingGroupId {
  return value in TRAINING_GROUPS;
}

export function getTrainingGroup(id: TrainingGroupId): TrainingGroup {
  return TRAINING_GROUPS[id];
}

export function getTrainingGroupLabel(id: TrainingGroupId | string | undefined): string {
  if (!id || !isTrainingGroupId(id)) {
    return "Brak grupy";
  }

  return TRAINING_GROUPS[id].label;
}

export function formatTrainingTime(start: string, end: string): string {
  return `${start}–${end}`;
}

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function parseTimeOnDate(date: Date, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const copy = new Date(date);
  copy.setHours(hours, minutes, 0, 0);
  return copy;
}

function buildSession(group: TrainingGroup, date: Date): TrainingSession {
  return {
    date,
    dateKey: toDateKey(date),
    dayName: DAY_NAMES[date.getDay()],
    start: group.start,
    end: group.end,
    groupId: group.id,
    groupLabel: group.label,
  };
}

export function getNextTrainingSession(
  groupId: TrainingGroupId,
  fromDate: Date = new Date()
): TrainingSession | null {
  const group = TRAINING_GROUPS[groupId];
  const cursor = startOfDay(fromDate);

  for (let offset = 0; offset < 21; offset += 1) {
    const date = new Date(cursor);
    date.setDate(cursor.getDate() + offset);

    if (!group.days.includes(date.getDay())) {
      continue;
    }

    const sessionEnd = parseTimeOnDate(date, group.end);

    if (offset === 0 && sessionEnd <= fromDate) {
      continue;
    }

    return buildSession(group, date);
  }

  return null;
}

export function getWeekTrainingSchedule(
  groupId: TrainingGroupId,
  weekStart: Date = new Date()
): TrainingSession[] {
  const group = TRAINING_GROUPS[groupId];
  const monday = startOfDay(weekStart);
  const day = monday.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  monday.setDate(monday.getDate() + diff);

  const sessions: TrainingSession[] = [];

  for (let offset = 0; offset < 7; offset += 1) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + offset);

    if (group.days.includes(date.getDay())) {
      sessions.push(buildSession(group, date));
    }
  }

  return sessions;
}

export function formatSessionForUi(session: TrainingSession): string {
  const dateLabel = session.date.toLocaleDateString("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return `${dateLabel}, ${formatTrainingTime(session.start, session.end)}`;
}

export function formatShortSessionDate(session: TrainingSession): string {
  return session.date.toLocaleDateString("pl-PL", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
