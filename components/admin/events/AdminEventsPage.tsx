"use client";

import { useEffect, useState } from "react";

import { fetchEvents, type Event } from "@/lib/events";
import { fetchRegistrationCounts } from "@/lib/registrations-client";

import EventHeader from "./EventHeader";
import EventFilters from "./EventFilters";
import EventsTable from "./EventsTable";

type AdminEventsPageProps = {
  initialEvents: Event[];
};

export default function AdminEventsPage({ initialEvents }: AdminEventsPageProps) {
  const [events, setEvents] = useState(initialEvents);
  const [registrationCounts, setRegistrationCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    async function loadCounts() {
      if (!initialEvents.length) {
        return;
      }

      try {
        const counts = await fetchRegistrationCounts(initialEvents.map((event) => event.id));
        setRegistrationCounts(counts);
      } catch {
        setRegistrationCounts({});
      }
    }

    loadCounts();
  }, [initialEvents]);

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

    try {
      const counts = await fetchRegistrationCounts(data.map((event) => event.id));
      setRegistrationCounts(counts);
    } catch {
      setRegistrationCounts({});
    }
  };

  return (
    <div className="space-y-8">
      <EventHeader onCreated={handleCreated} />
      <EventFilters />
      <EventsTable
        events={events}
        registrationCounts={registrationCounts}
        onDeleted={handleDeleted}
        onUpdated={handleUpdated}
      />
    </div>
  );
}
