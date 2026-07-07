"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Baby, Bell, CalendarClock, CalendarDays, ClipboardList, Images, Newspaper, Trophy, User } from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";
import { fetchMyCompetitionResults } from "@/lib/competition-results-client";
import { fetchEvents } from "@/lib/events";
import { loadChildrenForParent } from "@/lib/children-client";
import { db } from "@/lib/firebase";
import { fetchNotifications } from "@/lib/notifications-client";
import {
  buildParentTrainingOverview,
  formatTrainingChangeMessage,
  formatTrainingOverviewHint,
  type ParentChild,
  type ParentTrainingOverview,
} from "@/lib/parent-training-summary";
import { normalizeRegistrationStatus } from "@/lib/registration-types";
import { fetchMyRegistrations } from "@/lib/registrations-client";
import { fetchTrainingExceptions } from "@/lib/training-exceptions-client";
import type { TrainingException } from "@/lib/training-exceptions-db";
import { isTrainingGroupId, type TrainingGroupId } from "@/lib/training-groups";

import DashboardCard from "./DashboardCard";
import DashboardStatCard from "./DashboardStatCard";
import PanelFeaturedCard from "@/components/panel/PanelFeaturedCard";
import PanelQuickScroll from "@/components/panel/PanelQuickScroll";
import PushOnboardingDashboardCard from "@/components/notifications/PushOnboardingDashboardCard";
import {
  PanelLoadingState,
  PanelPage,
  PanelPageHeader,
  PanelSection,
} from "@/components/layout/PanelLayout";

type DashboardStats = {
  pendingRegistrations: number;
  unreadNotifications: number;
  upcomingEvents: number;
  recentResults: number;
  nextEventTitle: string | null;
};

const initialStats: DashboardStats = {
  pendingRegistrations: 0,
  unreadNotifications: 0,
  upcomingEvents: 0,
  recentResults: 0,
  nextEventTitle: null,
};

function getWeekStartDate(): string {
  const monday = new Date();
  const day = monday.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  monday.setDate(monday.getDate() + diff);
  return monday.toISOString().slice(0, 10);
}

export default function DashboardGrid() {
  const { profile, user, ready, loadingProfile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [trainingOverview, setTrainingOverview] = useState<ParentTrainingOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready || loadingProfile || !user) {
      return;
    }

    loadStats();
  }, [ready, loadingProfile, user]);

  async function loadStats() {
    if (!user) {
      return;
    }

    const parentUid = user.uid;

    try {
      setLoading(true);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const childrenSnapshot = await loadChildrenForParent(db, parentUid);

      const children: ParentChild[] = childrenSnapshot.map((item) => ({
        id: item.id,
        imie: item.imie,
        nazwisko: item.nazwisko,
        grupaTreningowa: item.grupaTreningowa,
      }));

      const groupIds = Array.from(
        new Set(
          children
            .map((child) => child.grupaTreningowa)
            .filter((groupId): groupId is TrainingGroupId =>
              Boolean(groupId && isTrainingGroupId(groupId))
            )
        )
      );

      const fromDate = getWeekStartDate();

      const [notifications, registrations, events, results, ...exceptionLists] =
        await Promise.all([
          fetchNotifications(),
          fetchMyRegistrations(),
          fetchEvents(),
          fetchMyCompetitionResults(),
          ...groupIds.map((groupId) => fetchTrainingExceptions(groupId, fromDate)),
        ]);

      const exceptionsByGroup = groupIds.reduce<
        Partial<Record<TrainingGroupId, TrainingException[]>>
      >((acc, groupId, index) => {
        acc[groupId] = exceptionLists[index] as TrainingException[];
        return acc;
      }, {});

      const upcoming = events.filter((event) => {
        const eventDate = new Date(event.event_date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= today;
      });

      const pending = registrations.filter(
        (reg) => normalizeRegistrationStatus(reg.status) === "pending"
      ).length;

      setStats({
        pendingRegistrations: pending,
        unreadNotifications: notifications.unreadCount,
        upcomingEvents: upcoming.length,
        recentResults: results.length,
        nextEventTitle: upcoming[0]?.title ?? null,
      });
      setTrainingOverview(buildParentTrainingOverview(children, exceptionsByGroup));
    } catch {
      setStats(initialStats);
      setTrainingOverview(null);
    } finally {
      setLoading(false);
    }
  }

  const displayName = profile?.imie || "Rodzicu";
  const trainingValue = trainingOverview?.nextSessionLabel ?? "—";
  const trainingHint = trainingOverview
    ? formatTrainingOverviewHint(trainingOverview)
    : "Dodaj grupę treningową dziecku";

  return (
    <PanelPage>
      <PanelPageHeader
        title={`Witaj, ${displayName}!`}
        description="Tu znajdziesz szybki podgląd zgłoszeń, powiadomień i wyników swoich zawodników."
      />

      <PushOnboardingDashboardCard role="rodzic" />

      {!loading && trainingOverview?.nextSessionLabel ? (
        <PanelFeaturedCard
          kicker="Najbliższy trening"
          title={trainingOverview.nextSessionLabel}
          description={trainingHint}
          href="/panel-rodzica/treningi"
          cta="Plan treningów"
          icon={CalendarClock}
        />
      ) : null}

      {loading ? (
        <PanelLoadingState label="Ładowanie podsumowania..." />
      ) : (
        <>
          <div className="panel-grid-stats">
            <DashboardStatCard
              href="/panel-rodzica/treningi"
              icon={CalendarClock}
              label="Najbliższy trening"
              value={trainingValue}
              hint={trainingHint}
              highlight={Boolean(trainingOverview?.upcomingChange)}
            />
            <DashboardStatCard
              href="/panel-rodzica/moje-zgloszenia"
              icon={ClipboardList}
              label="Oczekujące zgłoszenia"
              value={stats.pendingRegistrations}
              hint={
                stats.pendingRegistrations > 0
                  ? "Wymagają decyzji klubu"
                  : "Brak oczekujących"
              }
              highlight={stats.pendingRegistrations > 0}
            />
            <DashboardStatCard
              href="/panel-rodzica/powiadomienia"
              icon={Bell}
              label="Nieprzeczytane"
              value={stats.unreadNotifications}
              hint={
                stats.unreadNotifications > 0
                  ? "Nowe wiadomości od klubu"
                  : "Wszystko przeczytane"
              }
              highlight={stats.unreadNotifications > 0}
            />
            <DashboardStatCard
              href="/zawody"
              icon={CalendarDays}
              label="Nadchodzące zawody"
              value={stats.upcomingEvents}
              hint={stats.nextEventTitle ?? "Sprawdź terminy startów"}
            />
            <DashboardStatCard
              href="/panel-rodzica/wyniki"
              icon={Trophy}
              label="Wyniki dzieci"
              value={stats.recentResults}
              hint={
                stats.recentResults > 0
                  ? "Opublikowane miejsca"
                  : "Po zawodach pojawią się tutaj"
              }
            />
          </div>

          {trainingOverview?.upcomingChange && (
            <Link
              href="/panel-rodzica/treningi"
              className="zks-card zks-card-pad block border-amber-500/30 transition hover:border-amber-500/50"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-amber-300">
                Zmiana w planie treningów
              </p>
              <p className="mt-2 text-sm text-white">
                {formatTrainingChangeMessage(trainingOverview.upcomingChange)}
              </p>
              {trainingOverview.upcomingChange.exception.message && (
                <p className="mt-2 text-sm text-zks-text-muted">
                  {trainingOverview.upcomingChange.exception.message}
                </p>
              )}
            </Link>
          )}
        </>
      )}

      {!loading ? (
        <PanelQuickScroll
          links={[
            { href: "/panel-rodzica/treningi", label: "Treningi", icon: CalendarClock },
            {
              href: "/panel-rodzica/moje-zgloszenia",
              label: "Zgłoszenia",
              icon: ClipboardList,
              badge: stats.pendingRegistrations,
            },
            {
              href: "/panel-rodzica/powiadomienia",
              label: "Powiadomienia",
              icon: Bell,
              badge: stats.unreadNotifications,
            },
            { href: "/zawody", label: "Zawody", icon: CalendarDays },
            { href: "/panel-rodzica/galeria", label: "Galeria", icon: Images },
            { href: "/panel-rodzica/moje-dzieci", label: "Dzieci", icon: Baby },
          ]}
        />
      ) : null}

      <div className="panel-actions">
        <Link
          href="/zawody"
          className="zks-btn-primary inline-flex min-h-[44px] items-center gap-2 px-5 py-2.5 text-xs sm:text-sm"
        >
          Zgłoś na zawody
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/panel-rodzica/treningi"
          className="zks-btn-outline inline-flex min-h-[44px] items-center gap-2 px-5 py-2.5 text-xs sm:text-sm"
        >
          <CalendarClock className="h-4 w-4" />
          Plan treningów
        </Link>
        <Link
          href="/panel-rodzica/moje-dzieci"
          className="zks-btn-outline inline-flex min-h-[44px] items-center gap-2 px-5 py-2.5 text-xs sm:text-sm"
        >
          <Baby className="h-4 w-4" />
          Moje dzieci
        </Link>
        {stats.unreadNotifications > 0 && (
          <Link
            href="/panel-rodzica/powiadomienia"
            className="zks-btn-outline inline-flex min-h-[44px] items-center gap-2 px-5 py-2.5 text-xs sm:text-sm"
          >
            <Bell className="h-4 w-4" />
            {stats.unreadNotifications} nowych
          </Link>
        )}
      </div>

      <PanelSection
        title="Szybki dostęp"
        description="Zarządzaj danymi dzieci, zgłoszeniami i informacjami klubowymi."
      >
        <div className="panel-grid-cards">
          <DashboardCard
            href="/panel-rodzica/treningi"
            icon={CalendarClock}
            title="Treningi"
            description="Plan tygodniowy, godziny i ewentualne odwołania grup dzieci."
          />
          <DashboardCard
            href="/panel-rodzica/moje-dzieci"
            icon={Baby}
            title="Moje dzieci"
            description="Dodawaj profile zawodników i edytuj kategorie wagowe."
          />
          <DashboardCard
            href="/panel-rodzica/moje-zgloszenia"
            icon={ClipboardList}
            title="Moje zgłoszenia"
            description="Sprawdzaj status zgłoszeń na zawody i obozy."
          />
          <DashboardCard
            href="/panel-rodzica/powiadomienia"
            icon={Bell}
            title="Powiadomienia"
            description="Komunikaty od klubu: zawody, zgłoszenia i ważne informacje."
          />
          <DashboardCard
            href="/panel-rodzica/wyniki"
            icon={Trophy}
            title="Wyniki"
            description="Historia startów, miejsca i medale Twoich dzieci."
          />
          <DashboardCard
            href="/panel-rodzica/galeria"
            icon={Images}
            title="Galeria"
            description="Zdjęcia z treningów, zawodów i wydarzeń klubowych."
          />
          <DashboardCard
            href="/panel-rodzica/profil"
            icon={User}
            title="Moje dane"
            description="Edytuj dane kontaktowe i ustawienia powiadomień."
          />
          <DashboardCard
            href="/aktualnosci"
            icon={Newspaper}
            title="Aktualności"
            description="Najnowsze informacje i komunikaty od klubu."
          />
        </div>
      </PanelSection>
    </PanelPage>
  );
}
