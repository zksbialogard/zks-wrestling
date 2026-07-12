import AdminEventsPage from "@/components/admin/events/AdminEventsPage";
import { getEvents } from "@/lib/events-server";

export const dynamic = "force-dynamic";

export default async function ModeratorEventsPage() {
  const events = await getEvents();

  return <AdminEventsPage initialEvents={events} moderatorMode />;
}
