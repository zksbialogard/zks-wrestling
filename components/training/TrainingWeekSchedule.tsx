"use client";

import { AlertTriangle, CalendarClock, Loader2 } from "lucide-react";
import { useMemo } from "react";

import type { TrainingException } from "@/lib/training-exceptions-db";
import {
  formatTrainingTime,
  getWeekTrainingSchedule,
  isTrainingGroupId,
  type TrainingGroupId,
} from "@/lib/training-groups";

type TrainingWeekScheduleProps = {
  groupId: TrainingGroupId;
  exceptions: TrainingException[];
  loading?: boolean;
};

export default function TrainingWeekSchedule({
  groupId,
  exceptions,
  loading = false,
}: TrainingWeekScheduleProps) {
  const weekSchedule = useMemo(() => {
    if (!isTrainingGroupId(groupId)) {
      return [];
    }

    return getWeekTrainingSchedule(groupId);
  }, [groupId]);

  const exceptionsByDate = useMemo(() => {
    const map = new Map<string, TrainingException>();

    for (const item of exceptions) {
      map.set(item.session_date, item);
    }

    return map;
  }, [exceptions]);

  if (loading) {
    return (
      <div className="zks-card zks-card-pad flex items-center gap-3 text-sm text-zks-text-muted">
        <Loader2 className="h-5 w-5 animate-spin" />
        Ładowanie planu treningów...
      </div>
    );
  }

  return (
        <div className="panel-list">
      {weekSchedule.map((session) => {
        const exception = exceptionsByDate.get(session.dateKey);

        if (exception?.status === "cancelled") {
          return (
            <article
              key={session.dateKey}
              className="zks-card zks-card-pad border-red-500/30"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                <div>
                  <p className="font-bold text-red-300">
                    Odwołany — {session.dayName},{" "}
                    {session.date.toLocaleDateString("pl-PL")}
                  </p>
                  <p className="mt-1 text-sm text-zks-text-muted">
                    Planowane: {formatTrainingTime(session.start, session.end)}
                  </p>
                  {exception.message && (
                    <p className="mt-2 text-sm text-zks-text">{exception.message}</p>
                  )}
                </div>
              </div>
            </article>
          );
        }

        if (exception?.status === "rescheduled") {
          return (
            <article
              key={session.dateKey}
              className="zks-card zks-card-pad border-amber-500/30"
            >
              <div className="flex items-start gap-3">
                <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                <div>
                  <p className="font-bold text-amber-300">
                    Przełożony — {session.dayName},{" "}
                    {session.date.toLocaleDateString("pl-PL")}
                  </p>
                  <p className="mt-1 text-sm text-zks-text-muted">
                    Było: {formatTrainingTime(session.start, session.end)}
                  </p>
                  <p className="mt-1 text-sm text-white">
                    Nowe godziny:{" "}
                    {formatTrainingTime(
                      exception.new_start || session.start,
                      exception.new_end || session.end
                    )}
                  </p>
                  {exception.message && (
                    <p className="mt-2 text-sm text-zks-text">{exception.message}</p>
                  )}
                </div>
              </div>
            </article>
          );
        }

        return (
          <article key={session.dateKey} className="zks-card zks-card-pad">
            <p className="font-bold text-white">
              {session.dayName}, {session.date.toLocaleDateString("pl-PL")}
            </p>
            <p className="mt-1 text-sm text-zks-gold-bright">
              {formatTrainingTime(session.start, session.end)}
            </p>
          </article>
        );
      })}
    </div>
  );
}
