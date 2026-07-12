"use client";

import type { EventType } from "@/lib/event-types";
import { EVENT_TYPES, EVENT_TYPE_LABELS } from "@/lib/event-types";

export type CalendarFilter = "all" | EventType;

type Props = {
  value: CalendarFilter;
  onChange: (value: CalendarFilter) => void;
};

const FILTER_OPTIONS: CalendarFilter[] = ["all", ...EVENT_TYPES.filter((t) => t !== "inne")];

export default function EventCalendarFilters({ value, onChange }: Props) {
  return (
    <div className="mb-8 flex flex-wrap justify-center gap-2">
      {FILTER_OPTIONS.map((option) => {
        const active = value === option;
        const label =
          option === "all" ? "Wszystkie" : EVENT_TYPE_LABELS[option as EventType];

        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide transition ${
              active
                ? "border-zks-gold-bright bg-zks-gold-bright/15 text-zks-gold-bright"
                : "border-zks-gold-mid/25 text-zks-text-muted hover:border-zks-gold-mid/50 hover:text-white"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
