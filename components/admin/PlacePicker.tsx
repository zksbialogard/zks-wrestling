"use client";

import { PLACE_OPTIONS_ABOVE_THIRD } from "@/lib/place-utils";

const MEDAL_PLACES = [
  { place: 1, emoji: "🥇", label: "1. miejsce" },
  { place: 2, emoji: "🥈", label: "2. miejsce" },
  { place: 3, emoji: "🥉", label: "3. miejsce" },
] as const;

type Props = {
  value: number | null;
  onChange: (place: number | null) => void;
  label?: string;
  allowEmpty?: boolean;
};

export default function PlacePicker({
  value,
  onChange,
  label = "Miejsce",
  allowEmpty = true,
}: Props) {
  const isMedalPlace = value !== null && value >= 1 && value <= 3;
  const isHigherPlace = value !== null && value >= 4;

  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-zks-text">{label}</span>

      <div className="flex flex-wrap gap-2">
        {allowEmpty && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className={`rounded-lg border px-3 py-2 text-xs transition ${
              value === null
                ? "border-zks-gold-mid bg-zks-gold/15 text-zks-gold-bright"
                : "border-zks-gold-mid/25 text-zks-text-muted hover:border-zks-gold-mid/50"
            }`}
          >
            Brak
          </button>
        )}

        {MEDAL_PLACES.map((item) => (
          <button
            key={item.place}
            type="button"
            onClick={() => onChange(item.place)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs transition ${
              value === item.place
                ? "border-zks-gold-mid bg-zks-gold/15 text-zks-gold-bright"
                : "border-zks-gold-mid/25 text-zks-text-muted hover:border-zks-gold-mid/50"
            }`}
            title={item.label}
          >
            <span className="text-base leading-none">{item.emoji}</span>
            <span>{item.place}.</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs text-zks-text-muted">4. miejsce i wyżej:</label>
        <select
          value={isHigherPlace ? String(value) : ""}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
          className="rounded-lg border border-zks-gold-mid/30 bg-zks-black px-3 py-2 text-sm text-white outline-none focus:border-zks-gold-mid"
        >
          <option value="">— wybierz —</option>
          {PLACE_OPTIONS_ABOVE_THIRD.map((place) => (
            <option key={place} value={place}>
              {place}. miejsce
            </option>
          ))}
        </select>

        {isMedalPlace && (
          <span className="text-xs text-zks-gold-bright">
            Wybrano: {MEDAL_PLACES.find((item) => item.place === value)?.emoji} {value}. miejsce
          </span>
        )}
      </div>
    </div>
  );
}
