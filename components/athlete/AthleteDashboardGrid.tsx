"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Bell, CalendarDays, Dumbbell, Loader2 } from "lucide-react";

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
    <div className="min-w-0 space-y-8">
      <div>
        <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold uppercase text-white sm:text-3xl">
          Witaj, {displayName}!
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-zks-text-muted sm:text-base">
          Twój panel zawodnika — treningi, zawody i komunikaty od klubu.
        </p>
      </div>

      <PushOnboardingDashboardCard role="zawodnik" />

      {loading ? (
        <div className="zks-card flex items-center gap-3 p-5 text-zks-text-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
          Ładowanie podsumowania...
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="zks-card p-5">
            <p className="text-xs uppercase tracking-[0.15em] text-zks-gold-mid">
              Grupa treningowa
            </p>
            <p className="mt-2 font-[family-name:var(--font-heading)] text-xl font-bold text-white">
              {groupLabel}
            </p>
          </div>

          <div className="zks-card p-5">
            <div className="flex items-center gap-2 text-zks-gold-mid">
              <Dumbbell className="h-4 w-4" />
              <p className="text-xs uppercase tracking-[0.15em]">Najbliższy trening</p>
            </div>
            <p className="mt-2 text-sm text-white">
              {nextTrainingLabel || "Brak zaplanowanych treningów w najbliższym czasie."}
            </p>
          </div>

          <div className="zks-card p-5">
            <div className="flex items-center gap-2 text-zks-gold-mid">
              <CalendarDays className="h-4 w-4" />
              <p className="text-xs uppercase tracking-[0.15em]">Nadchodzące zawody</p>
            </div>
            <p className="mt-2 font-[family-name:var(--font-heading)] text-xl font-bold text-white">
              {upcomingEvents}
            </p>
            <p className="mt-1 text-sm text-zks-text-muted">
              {nextEventTitle ?? "Sprawdź terminy startów"}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
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
    </div>
  );
}
