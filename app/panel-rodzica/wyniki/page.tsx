"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";
import { fetchEvents } from "@/lib/events";
import {
  fetchMyRegistrations,
  type RegistrationItem,
} from "@/lib/registrations-client";

export default function WynikiPage() {
  const { user } = useAuth();
  const [results, setResults] = useState<RegistrationItem[]>([]);
  const [eventNames, setEventNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      if (!user) return;

      const [events, registrations] = await Promise.all([
        fetchEvents(),
        fetchMyRegistrations(),
      ]);

      setEventNames(Object.fromEntries(events.map((event) => [event.id, event.title])));
      setResults(registrations.filter((item) => item.status === "approved"));
    };

    load();
  }, [user]);

  return (
    <div>
      <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold uppercase text-white">
        Wyniki i starty
      </h2>
      <p className="mt-2 text-sm text-zks-text-muted">
        Zaakceptowane starty Twoich dzieci w zawodach klubowych.
      </p>

      {results.length === 0 ? (
        <div className="zks-card mt-6 p-6 text-zks-text-muted">
          Brak zatwierdzonych startów. Po akceptacji zgłoszenia przez klub pojawi się tutaj.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {results.map((item) => (
            <div key={item.id} className="zks-card flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-zks-gold-mid/30 bg-zks-gold/10">
                <Trophy className="h-6 w-6 text-zks-gold-bright" />
              </div>
              <div>
                <h3 className="font-bold text-white">
                  {item.child_name} {item.child_surname}
                </h3>
                <p className="text-sm text-zks-text-muted">
                  Start zatwierdzony • {eventNames[item.event_id] || "Zawody klubowe"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
