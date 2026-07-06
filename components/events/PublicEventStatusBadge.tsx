import type { EventRegistrationStatus } from "@/lib/event-utils";

type Props = {
  status: EventRegistrationStatus;
};

const config: Record<
  EventRegistrationStatus,
  { text: string; className: string }
> = {
  open: {
    text: "Zapisy otwarte",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  closed: {
    text: "Zapisy zamknięte",
    className: "bg-red-500/15 text-red-400 border-red-500/30",
  },
  finished: {
    text: "Zawody zakończone",
    className: "bg-zks-card text-zks-text-muted border-zks-gold-mid/20",
  },
};

export default function PublicEventStatusBadge({ status }: Props) {
  const item = config[status];

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${item.className}`}
    >
      {item.text}
    </span>
  );
}
