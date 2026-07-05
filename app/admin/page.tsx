import StatCard from "@/components/admin/StatCard";
import QuickActions from "@/components/admin/QuickActions";
import UpcomingEventsTable from "@/components/admin/UpcomingEventsTable";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

import {
  ClipboardList,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";

export default function AdminPage() {
  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="Zarządzaj klubem, zawodami, aktualnościami i użytkownikami z poziomu aplikacji."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Zawodnicy"
          value="108"
          subtitle="Aktywni zawodnicy"
          icon={<Users size={28} />}
        />
        <StatCard
          title="Rodzice"
          value="74"
          subtitle="Aktywne konta"
          icon={<UserRound size={28} />}
        />
        <StatCard
          title="Najbliższe zawody"
          value="5"
          subtitle="Zaplanowane wyjazdy"
          icon={<Trophy size={28} />}
        />
        <StatCard
          title="Nowe zgłoszenia"
          value="18"
          subtitle="Oczekują na akceptację"
          icon={<ClipboardList size={28} />}
        />
      </div>

      <section className="mt-8">
        <QuickActions />
      </section>

      <section className="mt-8">
        <UpcomingEventsTable />
      </section>
    </>
  );
}
