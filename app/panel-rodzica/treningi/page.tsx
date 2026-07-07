"use client";

import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { PanelLoadingState, PanelPage, PanelPageHeader, PanelSection } from "@/components/layout/PanelLayout";
import TrainingWeekSchedule from "@/components/training/TrainingWeekSchedule";
import { loadChildrenForParent } from "@/lib/children-client";
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
        const list = await loadChildrenForParent(db, user.uid);

        setChildren(
          list.map((item) => ({
            id: item.id,
            imie: item.imie,
            nazwisko: item.nazwisko,
            grupaTreningowa: item.grupaTreningowa as TrainingGroupId | undefined,
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
    return <PanelLoadingState label="Ładowanie planu treningów..." />;
  }

  if (!children.length) {
    return (
      <PanelPage>
        <PanelPageHeader
          title="Treningi"
          description="Plan tygodniowy i ewentualne zmiany w grupach treningowych Twoich dzieci."
        />
        <div className="zks-card zks-card-pad text-sm text-zks-text-muted">
          Nie masz jeszcze dodanych dzieci. Dodaj je w sekcji „Moje dzieci”, aby zobaczyć plan
          treningów.
        </div>
      </PanelPage>
    );
  }

  if (!groupIds.length) {
    return (
      <PanelPage>
        <PanelPageHeader
          title="Treningi"
          description="Plan tygodniowy i ewentualne zmiany w grupach treningowych Twoich dzieci."
        />
        <div className="zks-card zks-card-pad text-sm text-zks-text-muted">
          Twoim dzieciom nie przypisano jeszcze grup treningowych. Uzupełnij je w sekcji „Moje
          dzieci”.
        </div>
      </PanelPage>
    );
  }

  return (
    <PanelPage>
      <PanelPageHeader
        title="Treningi"
        description="Plan tygodniowy i ewentualne zmiany w grupach treningowych Twoich dzieci."
      />

      {groupSections.map((section) => (
        <PanelSection
          key={section.groupId}
          title={getTrainingGroupLabel(section.groupId)}
          description={section.childNames.join(", ")}
        >
          <TrainingWeekSchedule
            groupId={section.groupId}
            exceptions={section.exceptions}
            loading={section.loading}
          />
        </PanelSection>
      ))}
    </PanelPage>
  );
}
