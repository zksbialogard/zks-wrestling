"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Baby,
  Bell,
  CalendarDays,
  ClipboardList,
  Loader2,
  Newspaper,
  Trophy,
  User,
} from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";
import { fetchMyCompetitionResults } from "@/lib/competition-results-client";
import { fetchEvents } from "@/lib/events";
import { fetchNotifications } from "@/lib/notifications-client";
import { normalizeRegistrationStatus } from "@/lib/registration-types";
import { fetchMyRegistrations } from "@/lib/registrations-client";

import DashboardCard from "./DashboardCard";
import DashboardStatCard from "./DashboardStatCard";

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

export default function DashboardGrid() {
  const { profile, user, ready, loadingProfile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready || loadingProfile || !user) {
      return;
    }

    loadStats();
  }, [ready, loadingProfile, user]);

  async function loadStats() {
    try {
      setLoading(true);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [notifications, registrations, events, results] = await Promise.all([
        fetchNotifications(),
        fetchMyRegistrations(),
        fetchEvents(),
        fetchMyCompetitionResults(),
      ]);

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
    } catch {
      setStats(initialStats);
    } finally {
      setLoading(false);
    }
  }

  const displayName = profile?.imie || "Rodzicu";

  return (
    <div className="min-w-0 space-y-8">
      <div>
        <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold uppercase text-white sm:text-3xl">
          Witaj, {displayName}!
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-zks-text-muted sm:text-base">
          Tu znajdziesz szybki podgląd zgłoszeń, powiadomień i wyników swoich
          zawodników.
        </p>
      </div>

      {loading ? (
        <div className="zks-card flex items-center gap-3 p-5 text-zks-text-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
          Ładowanie podsumowania...
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
      )}

      <div className="flex flex-wrap gap-2">
        <Link
          href="/zawody"
          className="zks-btn-primary inline-flex min-h-[44px] items-center gap-2 px-5 py-2.5 text-xs sm:text-sm"
        >
          Zgłoś na zawody
          <ArrowRight className="h-4 w-4" />
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

      <div>
        <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold uppercase text-white sm:text-xl">
          Szybki dostęp
        </h3>
        <p className="mt-1 text-sm text-zks-text-muted">
          Zarządzaj danymi dzieci, zgłoszeniami i informacjami klubowymi.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
      </div>
    </div>
  );
}
