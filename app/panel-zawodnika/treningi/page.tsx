"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarClock, Loader2 } from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";
import { fetchTrainingExceptions } from "@/lib/training-exceptions-client";
import type { TrainingException } from "@/lib/training-exceptions-db";
import {
  formatTrainingTime,
  getWeekTrainingSchedule,
  getTrainingGroupLabel,
  isTrainingGroupId,
} from "@/lib/training-groups";

export default function AthleteTrainingsPage() {
  const { profile } = useAuth();
  const [exceptions, setExceptions] = useState<TrainingException[]>([]);
  const [loading, setLoading] = useState(true);

  const groupId = profile?.grupaTreningowa;

  const weekSchedule = useMemo(() => {
    if (!groupId || !isTrainingGroupId(groupId)) {
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

  useEffect(() => {
    if (!groupId || !isTrainingGroupId(groupId)) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        const monday = new Date();
        const day = monday.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        monday.setDate(monday.getDate() + diff);
        const fromDate = monday.toISOString().slice(0, 10);

        const data = await fetchTrainingExceptions(groupId, fromDate);
        setExceptions(data);
      } catch {
        setExceptions([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [groupId]);

  if (!groupId || !isTrainingGroupId(groupId)) {
    return (
      <div className="zks-card p-6 text-zks-text-muted">
        Nie przypisano Ci grupy treningowej. Uzupełnij ją w profilu lub skontaktuj się z
        klubem.
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold uppercase text-white sm:text-3xl">
          Treningi
        </h2>
        <p className="mt-2 text-sm text-zks-text-muted">
          Plan tygodniowy grupy {getTrainingGroupLabel(groupId)} oraz ewentualne zmiany.
        </p>
      </div>

      {loading ? (
        <div className="zks-card flex items-center gap-3 p-6 text-zks-text-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
          Ładowanie planu treningów...
        </div>
      ) : (
        <div className="space-y-3">
          {weekSchedule.map((session) => {
            const exception = exceptionsByDate.get(session.dateKey);

            if (exception?.status === "cancelled") {
              return (
                <article
                  key={session.dateKey}
                  className="zks-card border-red-500/30 p-5"
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
                  className="zks-card border-amber-500/30 p-5"
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
              <article key={session.dateKey} className="zks-card p-5">
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
      )}
    </div>
  );
}
