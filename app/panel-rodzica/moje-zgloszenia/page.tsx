"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";
import { fetchEvents } from "@/lib/events";
import {
  registrationStatusLabel,
  normalizeRegistrationStatus,
} from "@/lib/registration-types";
import {
  fetchMyRegistrations,
  type RegistrationItem,
} from "@/lib/registrations-client";

export default function MojeZgloszeniaPage() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [eventNames, setEventNames] = useState<Record<string, string>>({});
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

        setEventNames(Object.fromEntries(events.map((event) => [event.id, event.title])));
        setRegistrations(mine);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  return (
    <div>
      <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold uppercase text-white">
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
        <div className="zks-card mt-6 p-6 text-zks-text-muted">
          Brak zgłoszeń.{" "}
          <Link href="/zawody" className="text-zks-gold-bright underline">
            Przejdź do zawodów
          </Link>
          , aby zgłosić dziecko.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {registrations.map((reg) => {
            const status = normalizeRegistrationStatus(reg.status);

            return (
              <div key={reg.id} className="zks-card p-5">
                <h3 className="text-lg font-bold text-white">
                  {reg.child_name} {reg.child_surname}
                </h3>
                <p className="mt-2 text-sm text-zks-gold-bright">
                  {eventNames[reg.event_id] || "Zawody klubowe"}
                </p>
                <p
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                    status === "approved"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : status === "rejected"
                        ? "bg-red-500/15 text-red-400"
                        : "bg-zks-gold/15 text-zks-gold-bright"
                  }`}
                >
                  {registrationStatusLabel(reg.status)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
