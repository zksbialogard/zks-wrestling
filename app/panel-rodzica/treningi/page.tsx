"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";

import { useAuth } from "@/components/auth/AuthProvider";
import TrainingWeekSchedule from "@/components/training/TrainingWeekSchedule";
import { db } from "@/lib/firebase";
import { fetchTrainingExceptions } from "@/lib/training-exceptions-client";
import type { TrainingException } from "@/lib/training-exceptions-db";
import {
  getTrainingGroupLabel,
  isTrainingGroupId,
  type TrainingGroupId,
} from "@/lib/training-groups";

type Child = {
  id: string;
  imie: string;
  nazwisko: string;
  grupaTreningowa?: TrainingGroupId;
};

type GroupSection = {
  groupId: TrainingGroupId;
  childNames: string[];
  exceptions: TrainingException[];
  loading: boolean;
};

function getWeekStartDate(): string {
  const monday = new Date();
  const day = monday.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  monday.setDate(monday.getDate() + diff);
  return monday.toISOString().slice(0, 10);
}

export default function ParentTrainingsPage() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [groupSections, setGroupSections] = useState<GroupSection[]>([]);

  const groupIds = useMemo(() => {
    const ids = new Set<TrainingGroupId>();

    for (const child of children) {
      if (child.grupaTreningowa && isTrainingGroupId(child.grupaTreningowa)) {
        ids.add(child.grupaTreningowa);
      }
    }

    return Array.from(ids);
  }, [children]);

  useEffect(() => {
    if (!user) return;

    const loadChildren = async () => {
      setLoadingChildren(true);

      try {
        const snapshot = await getDocs(
          query(collection(db, "children"), where("parentUid", "==", user.uid))
        );

        setChildren(
          snapshot.docs.map((item) => ({
            id: item.id,
            imie: item.data().imie as string,
            nazwisko: item.data().nazwisko as string,
            grupaTreningowa: item.data().grupaTreningowa as TrainingGroupId | undefined,
          }))
        );
      } catch {
        setChildren([]);
      } finally {
        setLoadingChildren(false);
      }
    };

    loadChildren();
  }, [user]);

  useEffect(() => {
    if (!groupIds.length) {
      setGroupSections([]);
      return;
    }

    const fromDate = getWeekStartDate();

    setGroupSections(
      groupIds.map((groupId) => ({
        groupId,
        childNames: children
          .filter((child) => child.grupaTreningowa === groupId)
          .map((child) => `${child.imie} ${child.nazwisko}`),
        exceptions: [],
        loading: true,
      }))
    );

    const loadExceptions = async () => {
      const results = await Promise.all(
        groupIds.map(async (groupId) => {
          try {
            const exceptions = await fetchTrainingExceptions(groupId, fromDate);
            return { groupId, exceptions };
          } catch {
            return { groupId, exceptions: [] as TrainingException[] };
          }
        })
      );

      setGroupSections((prev) =>
        prev.map((section) => {
          const result = results.find((item) => item.groupId === section.groupId);
          return {
            ...section,
            exceptions: result?.exceptions || [],
            loading: false,
          };
        })
      );
    };

    loadExceptions();
  }, [groupIds, children]);

  if (loadingChildren) {
    return <p className="text-zks-text-muted">Ładowanie...</p>;
  }

  if (!children.length) {
    return (
      <div className="zks-card p-6 text-zks-text-muted">
        Nie masz jeszcze dodanych dzieci. Dodaj je w sekcji „Moje dzieci”, aby zobaczyć plan
        treningów.
      </div>
    );
  }

  if (!groupIds.length) {
    return (
      <div className="zks-card p-6 text-zks-text-muted">
        Twoim dzieciom nie przypisano jeszcze grup treningowych. Uzupełnij je w sekcji „Moje
        dzieci”.
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-8">
      <div>
        <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold uppercase text-white sm:text-3xl">
          Treningi
        </h2>
        <p className="mt-2 text-sm text-zks-text-muted">
          Plan tygodniowy i ewentualne zmiany w grupach treningowych Twoich dzieci.
        </p>
      </div>

      {groupSections.map((section) => (
        <section key={section.groupId} className="space-y-4">
          <div>
            <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold uppercase text-white">
              {getTrainingGroupLabel(section.groupId)}
            </h3>
            <p className="mt-1 text-sm text-zks-text-muted">
              {section.childNames.join(", ")}
            </p>
          </div>

          <TrainingWeekSchedule
            groupId={section.groupId}
            exceptions={section.exceptions}
            loading={section.loading}
          />
        </section>
      ))}
    </div>
  );
}
