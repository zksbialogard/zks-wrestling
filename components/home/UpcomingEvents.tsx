import Link from "next/link";

import PublicEventCard from "@/components/events/PublicEventCard";
import type { Event } from "@/lib/events";

export default function UpcomingEvents({ events }: { events: Event[] }) {
  return (
    <section className="w-full py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="mb-10 text-center sm:mb-12">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-black uppercase text-white sm:text-4xl lg:text-5xl">
            Najbliższe
            <span className="text-zks-gold-bright"> imprezy</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-zks-text-muted sm:text-lg">
            Kalendarz startów ZKS Białogard — zawody i zgrupowania w jednym miejscu.
          </p>
        </div>

        {events.length === 0 ? (
          <div className="zks-card zks-card-pad mx-auto max-w-xl panel-empty">
            <h3 className="panel-section-title">Brak zaplanowanych zawodów</h3>
            <p className="mt-2 text-sm text-zks-text-muted">
              Dodaj pierwsze zawody w panelu administratora.
            </p>
          </div>
        ) : (
          <div className="flex w-full justify-center">
            <ul className="flex w-full max-w-5xl flex-wrap justify-center gap-5 sm:gap-6">
              {events.map((event) => (
                <li key={event.id} className="w-full max-w-[20rem] sm:w-[20rem]">
                  <PublicEventCard
                    event={event}
                    actionLabel="Szczegóły"
                    className="h-full"
                  />
                </li>
              ))}
            </ul>
          </div>
        )}

        {events.length > 0 && (
          <div className="mt-10 flex justify-center sm:mt-12">
            <Link
              href="/kalendarz-imprez"
              className="zks-btn-outline inline-flex min-h-[44px] items-center px-6 py-2.5 text-sm"
            >
              Pełny kalendarz imprez
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
