"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Bell,
  CalendarDays,
  MapPin,
  Pencil,
  Trash2,
} from "lucide-react";

import { deleteEvent } from "@/lib/events";
import EventStatusBadge from "./EventStatusBadge";

export type EventItem = {
  id: string;
  title: string;
  location: string;
  event_date: string;
  registration_deadline: string;
};

interface Props {
  event: EventItem;
  entries?: number;
  onEdit: (event: EventItem) => void;
}

export default function EventRow({ event, entries = 0, onEdit }: Props) {
  const router = useRouter();

  const remove = async () => {
    if (!confirm(`Usunąć zawody „${event.title}"?`)) return;

    try {
      await deleteEvent(event.id);
      toast.success("Zawody zostały usunięte.");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nie udało się usunąć zawodów.";
      toast.error(message);
    }
  };

  const notify = () => {
    toast.info("Powiadomienia push/SMS — w kolejnym kroku integracji.");
  };

  return (
    <div className="zks-card p-5 transition hover:border-zks-gold-mid/40 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white sm:text-2xl">{event.title}</h2>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-zks-text-muted">
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-zks-gold-mid" />
              {event.location}
            </span>
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-zks-gold-mid" />
              {new Date(event.event_date).toLocaleDateString("pl-PL")}
            </span>
          </div>
        </div>

        <EventStatusBadge status="open" />
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm font-semibold text-zks-gold-bright">
          Zgłoszeń: {entries}
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/zawody/${event.id}`}
            className="zks-btn-primary px-4 py-2 text-xs"
          >
            Zgłoszenia
          </Link>

          <button
            type="button"
            onClick={() => onEdit(event)}
            className="zks-btn-outline inline-flex items-center gap-2 px-4 py-2 text-xs"
          >
            <Pencil className="h-4 w-4" />
            Edytuj
          </button>

          <button
            type="button"
            onClick={notify}
            className="rounded-lg border border-zks-gold-mid/30 p-2.5 text-zks-gold-bright transition hover:border-zks-gold-mid"
            aria-label="Powiadom"
          >
            <Bell className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={remove}
            className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 px-4 py-2 text-xs text-red-400 transition hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" />
            Usuń
          </button>
        </div>
      </div>
    </div>
  );
}
