import DashboardCard from "./DashboardCard";

export default function DashboardGrid() {
  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

      <DashboardCard
        href="/panel-rodzica/moje-dzieci"
        icon="👦"
        title="Moje dzieci"
        description="Dodawaj i zarządzaj dziećmi."
      />

      <DashboardCard
        href="/panel-rodzica/moje-zgloszenia"
        icon="📝"
        title="Moje zgłoszenia"
        description="Sprawdzaj status zgłoszeń."
      />

      <DashboardCard
        href="/panel-rodzica/wyniki"
        icon="🏆"
        title="Wyniki"
        description="Historia startów i medale."
      />

      <DashboardCard
        href="/panel-rodzica/profil"
        icon="👤"
        title="Profil"
        description="Edytuj swoje dane."
      />

    </div>
  );
}