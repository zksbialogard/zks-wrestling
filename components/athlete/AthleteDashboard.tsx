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
  type TrainingGroupId,
} from "@/lib/training-groups";

export default function AthleteDashboard() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [upcomingEvents, setUpcomingEvents] = useState(0);
  const [nextTraining, setNextTraining] = useState<string | null>(null);

  const groupId = profile?.grupaTreningowa as TrainingGroupId | undefined;

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [notifications, events] = await Promise.all([
          fetchNotifications(),
          fetchEvents(),
        ]);

        setUnreadCount(notifications.unreadCount);
        setUpcomingEvents(
          events.filter((event) => new Date(event.event_date) >= today).length
        );

        if (groupId) {
          const next = getNextTrainingSession(groupId);
          setNextTraining(next ? formatSessionForUi(next) : null);
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [groupId]);

  return (
    <div className="min-w-0 space-y-8">
      <div>
        <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold uppercase text-white sm:text-3xl">
          Witaj, {profile?.imie || "Zawodniku"}!
        </h2>
        <p className="mt-2 text-sm text-zks-text-muted sm:text-base">
          {groupId
            ? `Twoja grupa: ${getTrainingGroupLabel(groupId)}`
            : "Uzupełnij grupę treningową w profilu."}
        </p>
      </div>

      {loading ? (
        <div className="zks-card flex items-center gap-3 p-5 text-zks-text-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
          Ładowanie...
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="zks-card p-5">
            <Dumbbell className="h-5 w-5 text-zks-gold-bright" />
            <p className="mt-3 text-xs uppercase tracking-wide text-zks-text-muted">
              Następny trening
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {nextTraining || "Brak w harmonogramie"}
            </p>
          </div>
          <div className="zks-card p-5">
            <CalendarDays className="h-5 w-5 text-zks-gold-bright" />
            <p className="mt-3 text-xs uppercase tracking-wide text-zks-text-muted">
              Nadchodzące zawody
            </p>
            <p className="mt-1 text-2xl font-bold text-zks-gold-bright">{upcomingEvents}</p>
          </div>
          <div className="zks-card p-5">
            <Bell className="h-5 w-5 text-zks-gold-bright" />
            <p className="mt-3 text-xs uppercase tracking-wide text-zks-text-muted">
              Powiadomienia
            </p>
            <p className="mt-1 text-2xl font-bold text-zks-gold-bright">{unreadCount}</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Link
          href="/panel-zawodnika/treningi"
          className="zks-btn-primary inline-flex min-h-[44px] items-center gap-2 px-5 py-2.5 text-xs sm:text-sm"
        >
          Harmonogram treningów
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/panel-zawodnika/zawody"
          className="zks-btn-outline inline-flex min-h-[44px] items-center gap-2 px-5 py-2.5 text-xs sm:text-sm"
        >
          Zobacz zawody
        </Link>
      </div>
    </div>
  );
}
