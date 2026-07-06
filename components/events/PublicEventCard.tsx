import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Timer } from "lucide-react";

import PublicEventStatusBadge from "./PublicEventStatusBadge";
import {
  formatEventDate,
  getEventRegistrationStatus,
} from "@/lib/event-utils";
import type { Event } from "@/lib/events";

type Props = {
  event: Event;
  showAction?: boolean;
  actionLabel?: string;
};

export default function PublicEventCard({
  event,
  showAction = true,
  actionLabel = "Zgłoś dziecko",
}: Props) {
  const status = getEventRegistrationStatus(event);
  const registrationOpen = status === "open";

  return (
    <article className="group zks-card overflow-hidden rounded-2xl transition duration-300 hover:border-zks-gold-mid/50 hover:shadow-gold-glow-sm">
      <div className="p-6 sm:p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <PublicEventStatusBadge status={status} />
          <span className="text-xs uppercase tracking-wide text-zks-text-muted">
            {formatEventDate(event.event_date)}
          </span>
        </div>

        <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold uppercase text-white sm:text-3xl">
          {event.title}
        </h2>

        <ul className="mt-6 space-y-3 text-sm text-zks-text sm:text-base">
          <li className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-zks-gold-mid" />
            <span>{event.location}</span>
          </li>
          <li className="flex items-start gap-3">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-zks-gold-mid" />
            <span>Data zawodów: {formatEventDate(event.event_date)}</span>
          </li>
          <li className="flex items-start gap-3">
            <Timer className="mt-0.5 h-4 w-4 shrink-0 text-zks-gold-mid" />
            <span>
              Zapisy do:{" "}
              <span className="text-zks-gold-bright">
                {formatEventDate(event.registration_deadline)}
              </span>
            </span>
          </li>
        </ul>

        {showAction && (
          <div className="mt-8">
            {registrationOpen ? (
              <Link
                href={`/zawody/${event.id}`}
                className="zks-btn-primary inline-flex w-full items-center justify-center gap-2 px-6 py-3.5 text-sm sm:w-auto"
              >
                {actionLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <span className="inline-flex w-full items-center justify-center rounded-lg border border-zks-gold-mid/20 px-6 py-3.5 text-sm text-zks-text-muted sm:w-auto">
                {status === "finished"
                  ? "Zawody już się odbyły"
                  : "Termin zgłoszeń minął"}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
