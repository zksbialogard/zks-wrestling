"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ClipboardList, Loader2, Trophy, UserRound, Users } from "lucide-react";
import { toast } from "sonner";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import QuickActions from "@/components/admin/QuickActions";
import StatCard from "@/components/admin/StatCard";
import UpcomingEventsTable from "@/components/admin/UpcomingEventsTable";
import { PanelPage, PanelSection } from "@/components/layout/PanelLayout";
import { fetchAdminDashboardStats } from "@/lib/admin-dashboard-client";
import type { AdminDashboardStats } from "@/lib/admin-dashboard";

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchAdminDashboardStats();
        setStats(data);
      } catch (error) {
        console.error(error);
        toast.error(
          error instanceof Error ? error.message : "Nie udało się wczytać dashboardu."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const athleteSubtitle =
    stats && stats.athleteAccountCount > 0
      ? `${stats.athleteAccountCount} kont zawodnika w systemie`
      : "Profile dzieci w bazie klubu";

  return (
    <PanelPage>
      <AdminPageHeader
        title="Dashboard"
        description="Zarządzaj klubem, zawodami, aktualnościami i użytkownikami z poziomu aplikacji."
      />

      <div className="panel-grid-admin">
        <StatCard
          title="Zawodnicy"
          value={loading ? "—" : stats?.athleteCount ?? 0}
          subtitle={loading ? "Ładowanie..." : athleteSubtitle}
          icon={loading ? <Loader2 className="h-7 w-7 animate-spin" /> : <Users size={28} />}
        />
        <StatCard
          title="Rodzice"
          value={loading ? "—" : stats?.parentCount ?? 0}
          subtitle="Aktywne konta rodziców"
          icon={loading ? <Loader2 className="h-7 w-7 animate-spin" /> : <UserRound size={28} />}
        />
        <StatCard
          title="Najbliższe zawody"
          value={loading ? "—" : stats?.upcomingEventCount ?? 0}
          subtitle="Nadchodzące starty"
          icon={loading ? <Loader2 className="h-7 w-7 animate-spin" /> : <Trophy size={28} />}
        />
        <Link href="/admin/zgloszenia" className="block">
          <StatCard
            title="Nowe zgłoszenia"
            value={loading ? "—" : stats?.pendingRegistrationCount ?? 0}
            subtitle="Oczekują na akceptację"
            icon={
              loading ? (
                <Loader2 className="h-7 w-7 animate-spin" />
              ) : (
                <ClipboardList size={28} />
              )
            }
          />
        </Link>
      </div>

      <PanelSection>
        <QuickActions />
      </PanelSection>

      <PanelSection>
        <UpcomingEventsTable events={stats?.upcomingEvents ?? []} loading={loading} />
      </PanelSection>
    </PanelPage>
  );
}
