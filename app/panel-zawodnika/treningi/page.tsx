"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import TrainingWeekSchedule from "@/components/training/TrainingWeekSchedule";
import { fetchTrainingExceptions } from "@/lib/training-exceptions-client";
import type { TrainingException } from "@/lib/training-exceptions-db";
import { getTrainingGroupLabel, isTrainingGroupId } from "@/lib/training-groups";

export default function AthleteTrainingsPage() {
  const { profile } = useAuth();
  const [exceptions, setExceptions] = useState<TrainingException[]>([]);
  const [loading, setLoading] = useState(true);

  const groupId = profile?.grupaTreningowa;

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

      <TrainingWeekSchedule
        groupId={groupId}
        exceptions={exceptions}
        loading={loading}
      />
    </div>
  );
}
