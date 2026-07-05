"use client";

import { useState } from "react";

import { fetchEvents, type Event } from "@/lib/events";

import EventHeader from "./EventHeader";
import EventFilters from "./EventFilters";
import EventsTable from "./EventsTable";

type AdminEventsPageProps = {
  initialEvents: Event[];
};

export default function AdminEventsPage({ initialEvents }: AdminEventsPageProps) {
  const [events, setEvents] = useState(initialEvents);

  const handleDeleted = (id: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== id));
  };

  const handleUpdated = (updated: Event) => {
    setEvents((prev) =>
      prev.map((event) => (event.id === updated.id ? updated : event))
    );
  };

  const handleCreated = async () => {
    const data = await fetchEvents();
    setEvents(data);
  };

  return (
    <div className="space-y-8">
      <EventHeader onCreated={handleCreated} />
      <EventFilters />
      <EventsTable
        events={events}
        onDeleted={handleDeleted}
        onUpdated={handleUpdated}
      />
    </div>
  );
}
