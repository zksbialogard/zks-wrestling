"use client";

import { EVENT_TYPES, EVENT_TYPE_LABELS, type EventType } from "@/lib/event-types";

type EventExtraFieldsState = {
  eventType: EventType;
  endDate: string;
  ageCategory: string;
  season: string;
  notes: string;
};

type Props = {
  value: EventExtraFieldsState;
  onChange: (value: EventExtraFieldsState) => void;
};

export type { EventExtraFieldsState };

export default function EventExtraFields({ value, onChange }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="mb-2 block text-xs uppercase tracking-wide text-zks-gold-mid">
          Typ imprezy
        </label>
        <select
          value={value.eventType}
          onChange={(e) =>
            onChange({ ...value, eventType: e.target.value as EventType })
          }
          className="w-full rounded-lg border border-zks-gold-mid/30 bg-zks-black px-4 py-3 text-white outline-none"
        >
          {EVENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {EVENT_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-xs uppercase tracking-wide text-zks-gold-mid">
          Kategoria wiekowa
        </label>
        <input
          value={value.ageCategory}
          onChange={(e) => onChange({ ...value, ageCategory: e.target.value })}
          placeholder="np. U14, U17"
          className="w-full rounded-lg border border-zks-gold-mid/30 bg-zks-black px-4 py-3 text-white outline-none"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs uppercase tracking-wide text-zks-gold-mid">
          Data zakończenia (opcjonalnie)
        </label>
        <input
          type="date"
          value={value.endDate}
          onChange={(e) => onChange({ ...value, endDate: e.target.value })}
          className="w-full rounded-lg border border-zks-gold-mid/30 bg-zks-black px-4 py-3 text-white outline-none"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs uppercase tracking-wide text-zks-gold-mid">
          Sezon
        </label>
        <input
          type="number"
          value={value.season}
          onChange={(e) => onChange({ ...value, season: e.target.value })}
          placeholder="2026"
          className="w-full rounded-lg border border-zks-gold-mid/30 bg-zks-black px-4 py-3 text-white outline-none"
        />
      </div>

      <div className="sm:col-span-2">
        <label className="mb-2 block text-xs uppercase tracking-wide text-zks-gold-mid">
          Notatki (opcjonalnie)
        </label>
        <textarea
          value={value.notes}
          onChange={(e) => onChange({ ...value, notes: e.target.value })}
          rows={2}
          className="w-full rounded-lg border border-zks-gold-mid/30 bg-zks-black px-4 py-3 text-white outline-none"
        />
      </div>
    </div>
  );
}
