import { getEventTypeBadgeClass, getEventTypeLabel } from "@/lib/event-types";

type Props = {
  type?: string;
  ageCategory?: string | null;
};

export default function EventTypeBadge({ type, ageCategory }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${getEventTypeBadgeClass(type)}`}
      >
        {getEventTypeLabel(type)}
      </span>
      {ageCategory ? (
        <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zks-text">
          {ageCategory}
        </span>
      ) : null}
    </div>
  );
}
