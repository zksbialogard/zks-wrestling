"use client";

type Props = {
  status: "open" | "closed" | "finished";
};

export default function EventStatusBadge({ status }: Props) {
  const config = {
    open: {
      text: "Zapisy otwarte",
      className:
        "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    },
    closed: {
      text: "Zapisy zamknięte",
      className:
        "bg-red-500/15 text-red-400 border border-red-500/30",
    },
    finished: {
      text: "Zawody zakończone",
      className:
        "bg-zinc-700 text-zinc-300 border border-zinc-600",
    },
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${config[status].className}`}
    >
      {config[status].text}
    </span>
  );
}