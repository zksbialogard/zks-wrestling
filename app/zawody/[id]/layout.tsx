import type { Metadata } from "next";

import { formatEventDate } from "@/lib/event-utils";
import { getEvents } from "@/lib/events-server";
import { createPageMetadata } from "@/lib/site-config";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const events = await getEvents();
    const event = events.find((item) => item.id === id);

    if (!event) {
      return createPageMetadata({
        title: "Zawody",
        description: "Szczegóły zawodów ZKS Białogard.",
        path: `/zawody/${id}`,
      });
    }

    const dateLabel = formatEventDate(event.event_date);

    return createPageMetadata({
      title: `${event.title} — ${dateLabel}`,
      description: `${event.title} · ${event.location} · ${dateLabel}. Zapisy przez aplikację ZKS Białogard.`,
      path: `/zawody/${id}`,
    });
  } catch {
    return createPageMetadata({
      title: "Zawody",
      path: `/zawody/${id}`,
    });
  }
}

export default function EventDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
