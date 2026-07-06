"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, ClipboardList, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth/AuthProvider";
import RegistrationStatusBadge from "@/components/parent/RegistrationStatusBadge";
import { fetchEvents, type Event } from "@/lib/events";
import {
  fetchMyRegistrations,
  type RegistrationItem,
} from "@/lib/registrations-client";

function formatEventDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pl-PL", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function MojeZgloszeniaPage() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [eventsById, setEventsById] = useState<Record<string, Event>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;

      setLoading(true);

      try {
        const [events, mine] = await Promise.all([
          fetchEvents(),
          fetchMyRegistrations(),
        ]);

        setEventsById(Object.fromEntries(events.map((event) => [event.id, event])));
        setRegistrations(
          [...mine].sort(
            (a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
        );
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Nie udało się pobrać zgłoszeń."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  return (
    <div className="min-w-0">
      <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold uppercase text-white sm:text-3xl">
        Moje zgłoszenia
      </h2>
      <p className="mt-2 text-sm text-zks-text-muted">
        Status zgłoszeń Twoich dzieci na zawody klubowe.
      </p>

      {loading ? (
        <div className="zks-card mt-6 flex items-center gap-3 p-6 text-zks-text-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
          Ładowanie zgłoszeń...
        </div>
      ) : registrations.length === 0 ? (
        <div className="zks-card mt-6 rounded-2xl p-8 text-center sm:p-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-zks-gold-mid/30 bg-zks-gold/10">
            <ClipboardList className="h-7 w-7 text-zks-gold-mid" />
          </div>
          <h3 className="mt-5 font-[family-name:var(--font-heading)] text-xl font-bold uppercase text-white">
            Brak zgłoszeń
          </h3>
          <p className="mx-auto mt-3 max-w-md text-sm text-zks-text-muted">
            Nie zgłosiłeś jeszcze żadnego dziecka na zawody. Przejdź do listy zawodów,
            wybierz termin i złóż zgłoszenie.
          </p>
          <Link
            href="/zawody"
            className="zks-btn-primary mt-6 inline-flex min-h-[44px] items-center gap-2 px-6 py-2.5 text-xs sm:text-sm"
          >
            Przejdź do zawodów
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {registrations.map((reg) => {
            const event = eventsById[reg.event_id];

            return (
              <article key={reg.id} className="zks-card p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-white">
                        {reg.child_name} {reg.child_surname}
                      </h3>
                      <RegistrationStatusBadge status={reg.status} />
                    </div>

                    <p className="mt-2 font-medium text-zks-gold-bright">
                      {event?.title || "Zawody klubowe"}
                    </p>

                    {event && (
                      <div className="mt-3 flex flex-col gap-1.5 text-sm text-zks-text-muted">
                        <p className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 shrink-0 text-zks-gold-mid" />
                          {formatEventDate(event.event_date)}
                        </p>
                        {event.location && (
                          <p className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 shrink-0 text-zks-gold-mid" />
                            {event.location}
                          </p>
                        )}
                      </div>
                    )}

                    <p className="mt-3 text-xs text-zks-text-muted">
                      Zgłoszono:{" "}
                      {new Date(reg.created_at).toLocaleDateString("pl-PL", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                      {reg.child_weight ? ` · ${reg.child_weight} kg` : ""}
                    </p>
                  </div>

                  <Link
                    href="/zawody"
                    className="zks-btn-outline inline-flex min-h-[44px] shrink-0 items-center justify-center px-4 py-2.5 text-xs sm:self-start"
                  >
                    Zawody
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
