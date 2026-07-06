"use client";

import { useEffect, useState } from "react";
import { Loader2, Trophy } from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";
import { fetchMyCompetitionResults } from "@/lib/competition-results-client";

function placeLabel(place: number | null | undefined) {
  if (!place) return "Brak miejsca";
  if (place === 1) return "🥇 1. miejsce";
  if (place === 2) return "🥈 2. miejsce";
  if (place === 3) return "🥉 3. miejsce";
  return `${place}. miejsce`;
}

export default function WynikiPage() {
  const { user } = useAuth();
  const [results, setResults] = useState<
    Awaited<ReturnType<typeof fetchMyCompetitionResults>>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const data = await fetchMyCompetitionResults();
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  return (
    <div>
      <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold uppercase text-white">
        Wyniki zawodów
      </h2>
      <p className="mt-2 text-sm text-zks-text-muted">
        Opublikowane miejsca Twoich dzieci po zawodach klubowych.
      </p>

      {loading ? (
        <div className="zks-card mt-6 flex items-center gap-3 p-6 text-zks-text-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
          Ładowanie wyników...
        </div>
      ) : results.length === 0 ? (
        <div className="zks-card mt-6 p-6 text-zks-text-muted">
          Brak opublikowanych wyników. Po zawodach klub opublikuje miejsca tutaj.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {results.map((item) => (
            <div key={item.id} className="zks-card flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-zks-gold-mid/30 bg-zks-gold/10">
                <Trophy className="h-6 w-6 text-zks-gold-bright" />
              </div>
              <div>
                <h3 className="font-bold text-white">{item.athlete_name}</h3>
                <p className="text-sm text-zks-text-muted">
                  {item.event_title}
                  {item.weight_class ? ` · ${item.weight_class} kg` : ""}
                </p>
                <p className="mt-1 text-sm font-semibold text-zks-gold-bright">
                  {placeLabel(item.place)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
