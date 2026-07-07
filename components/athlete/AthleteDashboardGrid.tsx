"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Bell, CalendarDays, Dumbbell, Images } from "lucide-react";

import PanelFeaturedCard from "@/components/panel/PanelFeaturedCard";
import PanelQuickScroll from "@/components/panel/PanelQuickScroll";

import { useAuth } from "@/components/auth/AuthProvider";
import { fetchEvents } from "@/lib/events";
import { fetchNotifications } from "@/lib/notifications-client";
import {
  formatSessionForUi,
  getNextTrainingSession,
  getTrainingGroupLabel,
  isTrainingGroupId,
} from "@/lib/training-groups";

import PushOnboardingDashboardCard from "@/components/notifications/PushOnboardingDashboardCard";
import {
  PanelLoadingState,
  PanelPage,
  PanelPageHeader,
  PanelSection,
} from "@/components/layout/PanelLayout";

export default function AthleteDashboardGrid() {
  const { profile, user, ready, loadingProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [upcomingEvents, setUpcomingEvents] = useState(0);
  const [nextEventTitle, setNextEventTitle] = useState<string | null>(null);
  const [nextTrainingLabel, setNextTrainingLabel] = useState<string | null>(null);

  const groupId = profile?.grupaTreningowa;
  const groupLabel = getTrainingGroupLabel(groupId);

  useEffect(() => {
    if (!ready || loadingProfile || !user) {
      return;
    }

    loadDashboard();
  }, [ready, loadingProfile, user, groupId]);

  async function loadDashboard() {
    try {
      setLoading(true);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [notifications, events] = await Promise.all([
        fetchNotifications(),
        fetchEvents(),
      ]);

      const upcoming = events.filter((event) => {
        const eventDate = new Date(event.event_date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= today;
      });

      setUnreadNotifications(notifications.unreadCount);
      setUpcomingEvents(upcoming.length);
      setNextEventTitle(upcoming[0]?.title ?? null);

      if (groupId && isTrainingGroupId(groupId)) {
        const nextSession = getNextTrainingSession(groupId);
        setNextTrainingLabel(nextSession ? formatSessionForUi(nextSession) : null);
      } else {
        setNextTrainingLabel(null);
      }
    } catch {
      setUnreadNotifications(0);
      setUpcomingEvents(0);
      setNextEventTitle(null);
      setNextTrainingLabel(null);
    } finally {
      setLoading(false);
    }
  }

  const displayName = profile?.imie || "Zawodniku";

  return (
    <PanelPage>
      <PanelPageHeader
        title={`Witaj, ${displayName}!`}
        description="Twój panel zawodnika — treningi, zawody i komunikaty od klubu."
      />

      <PushOnboardingDashboardCard role="zawodnik" />

      {!loading && nextTrainingLabel ? (
        <PanelFeaturedCard
          kicker="Najbliższy trening"
          title={nextTrainingLabel}
          description={groupLabel}
          href="/panel-zawodnika/treningi"
          cta="Plan treningów"
          icon={Dumbbell}
        />
      ) : null}

      {loading ? (
        <PanelLoadingState label="Ładowanie podsumowania..." />
      ) : (
        <div className="panel-grid-stats-3">
          <div className="zks-card zks-card-pad">
            <p className="text-xs uppercase tracking-[0.15em] text-zks-gold-mid">
              Grupa treningowa
            </p>
            <p className="panel-section-title mt-2">{groupLabel}</p>
          </div>

          <div className="zks-card zks-card-pad">
            <div className="flex items-center gap-2 text-zks-gold-mid">
              <Dumbbell className="h-4 w-4" />
              <p className="text-xs uppercase tracking-[0.15em]">Najbliższy trening</p>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-white">
              {nextTrainingLabel || "Brak zaplanowanych treningów w najbliższym czasie."}
            </p>
          </div>

          <div className="zks-card zks-card-pad">
            <div className="flex items-center gap-2 text-zks-gold-mid">
              <CalendarDays className="h-4 w-4" />
              <p className="text-xs uppercase tracking-[0.15em]">Nadchodzące zawody</p>
            </div>
            <p className="panel-section-title mt-2">{upcomingEvents}</p>
            <p className="panel-section-description">
              {nextEventTitle ?? "Sprawdź terminy startów"}
            </p>
          </div>
        </div>
      )}

      {!loading ? (
        <PanelQuickScroll
          links={[
            { href: "/panel-zawodnika/treningi", label: "Treningi", icon: Dumbbell },
            { href: "/panel-zawodnika/zawody", label: "Zawody", icon: CalendarDays },
            {
              href: "/panel-zawodnika/powiadomienia",
              label: "Powiadomienia",
              icon: Bell,
              badge: unreadNotifications,
            },
            { href: "/panel-zawodnika/galeria", label: "Galeria", icon: Images },
          ]}
        />
      ) : null}

      <PanelSection>
        <div className="panel-actions">
        <Link
          href="/panel-zawodnika/zawody"
          className="zks-btn-primary inline-flex min-h-[44px] items-center gap-2 px-5 py-2.5 text-xs sm:text-sm"
        >
          Zobacz zawody
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/panel-zawodnika/treningi"
          className="zks-btn-outline inline-flex min-h-[44px] items-center gap-2 px-5 py-2.5 text-xs sm:text-sm"
        >
          <Dumbbell className="h-4 w-4" />
          Plan treningów
        </Link>
        <Link
          href="/panel-zawodnika/galeria"
          className="zks-btn-outline inline-flex min-h-[44px] items-center gap-2 px-5 py-2.5 text-xs sm:text-sm"
        >
          <Images className="h-4 w-4" />
          Galeria
        </Link>
        {unreadNotifications > 0 && (
          <Link
            href="/panel-zawodnika/powiadomienia"
            className="zks-btn-outline inline-flex min-h-[44px] items-center gap-2 px-5 py-2.5 text-xs sm:text-sm"
          >
            <Bell className="h-4 w-4" />
            {unreadNotifications} nowych
          </Link>
        )}
        </div>
      </PanelSection>
    </PanelPage>
  );
}
