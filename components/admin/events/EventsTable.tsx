"use client";

import { useState } from "react";

import EditEventModal from "./EditEventModal";
import EventRow, { EventItem } from "./EventRow";

interface EventsTableProps {
  events: EventItem[];
}

export default function EventsTable({ events }: EventsTableProps) {
  const [editing, setEditing] = useState<EventItem | null>(null);

  if (!events.length) {
    return (
      <div className="zks-card p-10 text-center">
        <h2 className="text-xl font-bold text-white">Brak zawodów</h2>
        <p className="mt-3 text-sm text-zks-text-muted">
          Dodaj pierwsze zawody klikając{" "}
          <span className="text-zks-gold-bright">„Dodaj zawody”</span>.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {events.map((event) => (
          <EventRow
            key={event.id}
            event={event}
            onEdit={(item) => setEditing(item)}
          />
        ))}
      </div>

      <EditEventModal
        open={Boolean(editing)}
        event={editing}
        onClose={() => setEditing(null)}
      />
    </>
  );
}
