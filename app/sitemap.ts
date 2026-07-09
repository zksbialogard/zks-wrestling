import type { MetadataRoute } from "next";

import { getEvents } from "@/lib/events-server";
import { absoluteUrl, PUBLIC_INDEXABLE_PATHS } from "@/lib/site-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = PUBLIC_INDEXABLE_PATHS.map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : path.startsWith("/zawody") ? 0.9 : 0.7,
  }));

  let eventEntries: MetadataRoute.Sitemap = [];

  try {
    const events = await getEvents();

    eventEntries = events.map((event) => ({
      url: absoluteUrl(`/zawody/${event.id}`),
      lastModified: event.event_date ? new Date(event.event_date) : now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    eventEntries = [];
  }

  return [...staticEntries, ...eventEntries];
}
