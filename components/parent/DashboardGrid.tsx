import {
  Baby,
  Bell,
  CalendarDays,
  ClipboardList,
  Newspaper,
  Trophy,
  User,
} from "lucide-react";

import DashboardCard from "./DashboardCard";

export default function DashboardGrid() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold uppercase text-white">
          Twoje funkcje
        </h2>
        <p className="mt-2 text-sm text-zks-text-muted">
          Zarządzaj danymi dzieci, zgłoszeniami i informacjami klubowymi.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <DashboardCard
          href="/panel-rodzica/moje-dzieci"
          icon={Baby}
          title="Moje dzieci"
          description="Przeglądaj listę dzieci, dodawaj nowe profile i edytuj dane."
        />

        <DashboardCard
          href="/panel-rodzica/moje-dzieci"
          icon={User}
          title="Edycja dzieci"
          description="Aktualizuj dane zawodników, kategorie wagowe i status."
        />

        <DashboardCard
          href="/panel-rodzica/profil"
          icon={User}
          title="Moje dane"
          description="Edytuj swoje dane kontaktowe i informacje logowania."
        />

        <DashboardCard
          href="/zawody"
          icon={CalendarDays}
          title="Zawody"
          description="Informacje o nadchodzących zawodach i obozach klubowych."
        />

        <DashboardCard
          href="/panel-rodzica/powiadomienia"
          icon={Bell}
          title="Powiadomienia"
          description="Komunikaty od klubu: zawody, zgłoszenia i ważne informacje."
        />

        <DashboardCard
          href="/panel-rodzica/moje-zgloszenia"
          icon={ClipboardList}
          title="Moje zgłoszenia"
          description="Sprawdzaj status zgłoszeń na zawody i obozy."
        />

        <DashboardCard
          href="/aktualnosci"
          icon={Newspaper}
          title="Aktualności"
          description="Najnowsze informacje i komunikaty od klubu."
        />

        <DashboardCard
          href="/panel-rodzica/wyniki"
          icon={Trophy}
          title="Wyniki"
          description="Historia startów, miejsca i medale Twoich dzieci."
        />
      </div>
    </div>
  );
}
