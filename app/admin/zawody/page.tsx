import EventHeader from "@/components/admin/events/EventHeader";
import EventFilters from "@/components/admin/events/EventFilters";
import EventsTable from "@/components/admin/events/EventsTable";
import { getEvents } from "@/lib/events-server";

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div className="space-y-8">
      <EventHeader />
      <EventFilters />
      <EventsTable events={events} />
    </div>
  );
}
