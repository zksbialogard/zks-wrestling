import { dateKeyInWarsaw, relativeDayLabel } from "./date-utils";
import type { TrainingException } from "./training-exceptions-db";
import {
  formatShortSessionDate,
  formatTrainingTime,
  getNextTrainingSession,
  getTrainingGroupLabel,
  getWeekTrainingSchedule,
  isTrainingGroupId,
  type TrainingGroupId,
  type TrainingSession,
} from "./training-groups";

export type ParentChild = {
  id: string;
  imie: string;
  nazwisko: string;
  grupaTreningowa?: string;
};

export type ParentTrainingChange = {
  groupId: TrainingGroupId;
  groupLabel: string;
  childNames: string[];
  exception: TrainingException;
  session: TrainingSession;
};

export type ParentTrainingOverview = {
  groupsCount: number;
  nextSession: TrainingSession | null;
  nextSessionChildNames: string[];
  nextSessionLabel: string | null;
  nextSessionTime: string | null;
  upcomingChange: ParentTrainingChange | null;
};

export function getChildrenMissingGroup(children: ParentChild[]): ParentChild[] {
  return children.filter(
    (child) => !child.grupaTreningowa || !isTrainingGroupId(child.grupaTreningowa)
  );
}

function childNamesForGroup(children: ParentChild[], groupId: TrainingGroupId): string[] {
  return children
    .filter((child) => child.grupaTreningowa === groupId)
    .map((child) => `${child.imie} ${child.nazwisko}`);
}

function getNextActiveSession(
  groupId: TrainingGroupId,
  exceptions: TrainingException[]
): TrainingSession | null {
  let cursor = new Date();

  for (let attempt = 0; attempt < 21; attempt += 1) {
    const session = getNextTrainingSession(groupId, cursor);

    if (!session) {
      return null;
    }

    const exception = exceptions.find((item) => item.session_date === session.dateKey);

    if (exception?.status === "cancelled") {
      cursor = new Date(session.date);
      cursor.setDate(cursor.getDate() + 1);
      continue;
    }

    return session;
  }

  return null;
}

function findUpcomingChange(
  groupIds: TrainingGroupId[],
  children: ParentChild[],
  exceptionsByGroup: Partial<Record<TrainingGroupId, TrainingException[]>>
): ParentTrainingChange | null {
  const todayKey = dateKeyInWarsaw();
  let best: ParentTrainingChange | null = null;

  for (const groupId of groupIds) {
    const exceptions = (exceptionsByGroup[groupId] || []).filter(
      (item) => item.session_date >= todayKey
    );
    const weekSessions = getWeekTrainingSchedule(groupId);

    for (const exception of exceptions) {
      const session = weekSessions.find((item) => item.dateKey === exception.session_date);

      if (!session) {
        continue;
      }

      const change: ParentTrainingChange = {
        groupId,
        groupLabel: getTrainingGroupLabel(groupId),
        childNames: childNamesForGroup(children, groupId),
        exception,
        session,
      };

      if (!best || exception.session_date < best.session.dateKey) {
        best = change;
      }
    }
  }

  return best;
}

function sessionTimeForDate(
  session: TrainingSession,
  exceptions: TrainingException[]
): string {
  const exception = exceptions.find((item) => item.session_date === session.dateKey);

  if (exception?.status === "rescheduled") {
    return formatTrainingTime(
      exception.new_start || session.start,
      exception.new_end || session.end
    );
  }

  return formatTrainingTime(session.start, session.end);
}

export function buildParentTrainingOverview(
  children: ParentChild[],
  exceptionsByGroup: Partial<Record<TrainingGroupId, TrainingException[]>> = {}
): ParentTrainingOverview {
  const groupIds = Array.from(
    new Set(
      children
        .map((child) => child.grupaTreningowa)
        .filter((groupId): groupId is TrainingGroupId =>
          Boolean(groupId && isTrainingGroupId(groupId))
        )
    )
  );

  let nextSession: TrainingSession | null = null;

  for (const groupId of groupIds) {
    const candidate = getNextActiveSession(groupId, exceptionsByGroup[groupId] || []);

    if (!candidate) {
      continue;
    }

    if (
      !nextSession ||
      candidate.dateKey < nextSession.dateKey ||
      (candidate.dateKey === nextSession.dateKey && candidate.start < nextSession.start)
    ) {
      nextSession = candidate;
    }
  }

  const nextSessionChildNames = nextSession
    ? childNamesForGroup(children, nextSession.groupId)
    : [];

  const nextSessionTime = nextSession
    ? sessionTimeForDate(nextSession, exceptionsByGroup[nextSession.groupId] || [])
    : null;

  return {
    groupsCount: groupIds.length,
    nextSession,
    nextSessionChildNames,
    nextSessionLabel: nextSession ? relativeDayLabel(nextSession.dateKey) : null,
    nextSessionTime,
    upcomingChange: findUpcomingChange(groupIds, children, exceptionsByGroup),
  };
}

export function formatTrainingOverviewHint(overview: ParentTrainingOverview): string {
  if (!overview.nextSession) {
    return overview.groupsCount > 0
      ? "Brak treningu w najbliższych dniach"
      : "Uzupełnij grupę dziecka";
  }

  const groupLabel = getTrainingGroupLabel(overview.nextSession.groupId);
  const dateLabel = formatShortSessionDate(overview.nextSession);

  return `${groupLabel} · ${dateLabel}${overview.nextSessionTime ? ` · ${overview.nextSessionTime}` : ""}`;
}

export function formatTrainingChangeMessage(change: ParentTrainingChange): string {
  const dateLabel = formatShortSessionDate(change.session);

  if (change.exception.status === "cancelled") {
    return `Odwołany trening — ${change.groupLabel}, ${dateLabel}.`;
  }

  const newTime = formatTrainingTime(
    change.exception.new_start || change.session.start,
    change.exception.new_end || change.session.end
  );

  return `Przełożony trening — ${change.groupLabel}, ${dateLabel} · nowe godziny: ${newTime}.`;
}
