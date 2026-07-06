"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Trophy } from "lucide-react";
import { toast } from "sonner";

import {
  fetchAdminEventResults,
  publishAdminEventResults,
  saveAdminEventResults,
  type ResultDraft,
} from "@/lib/competition-results-client";
import { normalizeRegistrationStatus } from "@/lib/registration-types";
import type { RegistrationItem } from "@/lib/registrations-client";

type Props = {
  eventId: string;
  registrations: RegistrationItem[];
};

function placeLabel(place: number | null | undefined) {
  if (!place) return "—";
  if (place === 1) return "🥇 1.";
  if (place === 2) return "🥈 2.";
  if (place === 3) return "🥉 3.";
  return `${place}.`;
}

export default function EventResultsSection({ eventId, registrations }: Props) {
  const [drafts, setDrafts] = useState<ResultDraft[]>([]);
  const [publishedCount, setPublishedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const approved = useMemo(
    () =>
      registrations.filter(
        (item) => normalizeRegistrationStatus(item.status) === "approved"
      ),
    [registrations]
  );

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const saved = await fetchAdminEventResults(eventId);
        setPublishedCount(saved.filter((item) => item.published).length);

        const merged = approved.map((registration) => {
          const existing = saved.find(
            (item) => item.registration_id === registration.id
          );

          return {
            registration_id: registration.id,
            child_id: registration.child_id,
            parent_uid: registration.parent_uid,
            athlete_name: `${registration.child_name} ${registration.child_surname}`.trim(),
            weight_class: registration.child_weight,
            place: existing?.place ?? null,
          } satisfies ResultDraft;
        });

        setDrafts(merged);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Błąd ładowania wyników.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [eventId, approved]);

  function updatePlace(index: number, value: string) {
    const place = value.trim() ? Number(value) : null;
    setDrafts((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, place: place && place > 0 ? place : null }
          : item
      )
    );
  }

  async function handleSave() {
    try {
      setSaving(true);
      await saveAdminEventResults(eventId, drafts);
      toast.success("Wyniki zapisane (wersja robocza).");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się zapisać wyników.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!drafts.some((item) => item.place)) {
      toast.warning("Ustaw przynajmniej jedno miejsce przed publikacją.");
      return;
    }

    if (
      !window.confirm(
        "Opublikować wyniki na stronie klubu i w panelu rodzica? Rodzice zobaczą miejsca swoich dzieci."
      )
    ) {
      return;
    }

    try {
      setPublishing(true);
      await saveAdminEventResults(eventId, drafts);
      const result = await publishAdminEventResults(eventId);
      setPublishedCount(result.results?.length || 0);
      toast.success(result.message || "Wyniki opublikowane.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się opublikować wyników.");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="zks-card mb-8 overflow-hidden">
      <div className="border-b border-zks-gold-mid/20 px-5 py-4">
        <div className="flex items-center gap-3">
          <Trophy className="h-5 w-5 text-zks-gold-bright" />
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold uppercase text-white">
              Wyniki zawodów
            </h2>
            <p className="mt-1 text-xs text-zks-text-muted">
              Wpisz miejsca zaakceptowanych zawodników, zapisz i opublikuj na stronie.
              {publishedCount > 0 ? ` Opublikowano: ${publishedCount}.` : ""}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 p-5 text-sm text-zks-text-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          Ładowanie wyników...
        </div>
      ) : approved.length === 0 ? (
        <p className="p-5 text-sm text-zks-text-muted">
          Brak zaakceptowanych zawodników — najpierw zaakceptuj zgłoszenia.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-zks-black/40 text-xs uppercase tracking-wide text-zks-gold-mid">
                <tr>
                  <th className="px-5 py-3">Zawodnik</th>
                  <th className="px-5 py-3">Kat. wagowa</th>
                  <th className="px-5 py-3">Miejsce</th>
                </tr>
              </thead>
              <tbody>
                {drafts.map((row, index) => (
                  <tr key={row.registration_id || index} className="border-t border-zks-gold-mid/10">
                    <td className="px-5 py-3 font-medium text-white">{row.athlete_name}</td>
                    <td className="px-5 py-3 text-zks-text">{row.weight_class || "—"}</td>
                    <td className="px-5 py-3">
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={row.place ?? ""}
                        onChange={(e) => updatePlace(index, e.target.value)}
                        placeholder="np. 1"
                        className="w-24 rounded-lg border border-zks-gold-mid/30 bg-zks-black px-3 py-2 text-white outline-none"
                      />
                      <span className="ml-2 text-zks-text-muted">{placeLabel(row.place)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-zks-gold-mid/15 p-5">
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="zks-btn-outline inline-flex items-center gap-2 px-4 py-2 text-xs disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Zapisz wersję roboczą
            </button>
            <button
              type="button"
              disabled={publishing}
              onClick={handlePublish}
              className="zks-btn-primary inline-flex items-center gap-2 px-4 py-2 text-xs disabled:opacity-60"
            >
              {publishing && <Loader2 className="h-4 w-4 animate-spin" />}
              Opublikuj wyniki
            </button>
          </div>
        </>
      )}
    </div>
  );
}
