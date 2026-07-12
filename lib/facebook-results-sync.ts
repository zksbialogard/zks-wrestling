import fs from "fs";
import path from "path";

import { revalidatePath } from "next/cache";

import {
  countFacebookResults,
  listFacebookResultsForAdmin,
  listFacebookResultsGrouped,
  upsertFacebookResults,
} from "./facebook-results-db";
import { normalizeAthleteNameFromFacebook, isValidAthleteName } from "./athlete-name-utils";
import {
  extractClubPlace,
  extractEventDate,
  extractEventTitle,
  extractLocation,
  extractYearFromPost,
  isResultPost,
  parseResultsFromMessage,
} from "./facebook-results-parser";
import {
  FACEBOOK_CLUB_PAGE_URL,
  fetchFacebookPostsFromPublicPage,
  fetchFacebookPostsFromRss,
} from "./facebook-public-feed";
import { syncResultsNewsForEvent } from "./facebook-results-news";
import { dedupeFacebookResultsInDatabase, groupFacebookEvents, buildSemanticResultKey } from "./facebook-results-dedupe";
import type { FacebookPost, FacebookResultInput, FacebookSeedEvent } from "./facebook-results-types";

export { FACEBOOK_CLUB_PAGE_URL };
export const FACEBOOK_RESULTS_YEAR = 2026;

const SEED_PATH = path.join(process.cwd(), "data", "facebook-results-2026.seed.json");

function safeRevalidatePath(target: string) {
  try {
    revalidatePath(target);
  } catch {
    // Skrypt CLI / cron poza kontekstem Next.js — pomijamy rewalidację cache.
  }
}

function isEventDateInYear(eventDate: string | null | undefined, year: number) {
  if (!eventDate) {
    return true;
  }

  return Number(eventDate.slice(0, 4)) === year;
}

type FacebookGraphResponse = {
  data?: FacebookPost[];
  paging?: { next?: string };
  error?: { message: string };
};

export function getFacebookConfig() {
  const pageId = process.env.FACEBOOK_PAGE_ID?.trim() || "zksbialogard";
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN?.trim() || "";
  const rssFeedUrl = process.env.FACEBOOK_RSS_FEED_URL?.trim() || "";

  return { pageId, accessToken, rssFeedUrl };
}

async function fetchFacebookPostsFromGraphApi(limit = 100): Promise<FacebookPost[]> {
  const { pageId, accessToken } = getFacebookConfig();

  if (!accessToken) {
    return [];
  }

  const posts: FacebookPost[] = [];
  let nextUrl: string | null =
    `https://graph.facebook.com/v21.0/${pageId}/posts?` +
    new URLSearchParams({
      fields: "id,message,created_time,permalink_url",
      limit: String(Math.min(limit, 100)),
      access_token: accessToken,
    }).toString();

  while (nextUrl && posts.length < limit) {
    const response = await fetch(nextUrl, { next: { revalidate: 0 } });
    const payload = (await response.json()) as FacebookGraphResponse;

    if (!response.ok || payload.error) {
      throw new Error(payload.error?.message || "Nie udało się pobrać postów z Facebook Graph API.");
    }

    for (const post of payload.data || []) {
      if (post.message?.trim()) {
        posts.push(post);
      }
    }

    nextUrl = payload.paging?.next || null;
  }

  return posts.slice(0, limit);
}

export async function fetchFacebookPosts(limit = 100): Promise<{
  posts: FacebookPost[];
  sources: string[];
}> {
  const { accessToken, rssFeedUrl } = getFacebookConfig();
  const postsById = new Map<string, FacebookPost>();
  const sources: string[] = [];

  if (accessToken) {
    try {
      const apiPosts = await fetchFacebookPostsFromGraphApi(limit);
      for (const post of apiPosts) {
        postsById.set(post.id, post);
      }
      if (apiPosts.length) {
        sources.push("facebook_graph_api");
      }
    } catch (error) {
      console.error("Facebook Graph API:", error);
    }
  }

  try {
    const publicPosts = await fetchFacebookPostsFromPublicPage(FACEBOOK_CLUB_PAGE_URL);
    for (const post of publicPosts) {
      postsById.set(post.id, post);
    }
    if (publicPosts.length) {
      sources.push("facebook_public_page");
    }
  } catch (error) {
    console.error("Facebook public page:", error);
  }

  if (rssFeedUrl) {
    try {
      const rssPosts = await fetchFacebookPostsFromRss(rssFeedUrl);
      for (const post of rssPosts) {
        postsById.set(post.id, post);
      }
      if (rssPosts.length) {
        sources.push("facebook_rss");
      }
    } catch (error) {
      console.error("Facebook RSS:", error);
    }
  }

  return {
    posts: Array.from(postsById.values()),
    sources,
  };
}

export function loadFacebookSeedEvents(year = FACEBOOK_RESULTS_YEAR): FacebookSeedEvent[] {
  if (!fs.existsSync(SEED_PATH)) {
    return [];
  }

  const seed = JSON.parse(fs.readFileSync(SEED_PATH, "utf8")) as {
    year: number;
    events: FacebookSeedEvent[];
  };

  if (seed.year !== year) {
    return [];
  }

  return seed.events || [];
}

export function mapSeedEventsToRows(events: FacebookSeedEvent[], year = FACEBOOK_RESULTS_YEAR) {
  const rows: FacebookResultInput[] = [];

  for (const event of events) {
    if (!isEventDateInYear(event.event_date, year)) {
      continue;
    }

    for (const result of event.results) {
      rows.push({
        facebook_post_id: event.facebook_post_id,
        event_title: event.event_title,
        event_date: event.event_date,
        location: event.location || "",
        athlete_name: result.athlete_name,
        weight_class: result.weight_class || "",
        style: result.style || "",
        place: result.place,
        year,
        source_url: event.source_url || FACEBOOK_CLUB_PAGE_URL,
        published: true,
      });
    }
  }

  return rows;
}

export function mapPostsToRows(posts: FacebookPost[], year = FACEBOOK_RESULTS_YEAR) {
  const rows: FacebookResultInput[] = [];

  for (const post of posts) {
    const message = post.message?.trim() || "";
    if (!message || !isResultPost(message)) continue;

    const postYear = extractYearFromPost(post);
    if (postYear !== year) continue;

    const parsed = parseResultsFromMessage(message);
    if (!parsed.length) continue;

    const eventTitle = extractEventTitle(message);
    const eventDate = extractEventDate(message, post.created_time);
    const location = extractLocation(message);
    const clubPlace = extractClubPlace(message);

    if (!isEventDateInYear(eventDate, year)) {
      continue;
    }

    for (const result of parsed) {
      if (!isValidAthleteName(result.athlete_name)) continue;

      rows.push({
        facebook_post_id: post.id,
        event_title: eventTitle,
        event_date: eventDate,
        location,
        athlete_name: normalizeAthleteNameFromFacebook(result.athlete_name),
        weight_class: result.weight_class || "",
        style: result.style || "",
        place: result.place,
        year,
        source_url: post.permalink_url || FACEBOOK_CLUB_PAGE_URL,
        published: true,
        club_place: clubPlace,
      });
    }
  }

  return rows;
}

function buildRowKey(row: FacebookResultInput) {
  return buildSemanticResultKey(row);
}

function dedupeRows(seedRows: FacebookResultInput[], postRows: FacebookResultInput[]) {
  const unique = new Map<string, FacebookResultInput>();

  for (const row of postRows) {
    unique.set(buildRowKey(row), row);
  }

  for (const row of seedRows) {
    unique.set(buildRowKey(row), row);
  }

  return Array.from(unique.values());
}

export async function syncAllResultsNews(
  year = FACEBOOK_RESULTS_YEAR,
  options?: { notify?: boolean }
) {
  const events = groupFacebookEvents(await listFacebookResultsForAdmin(year));
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const event of events) {
    const publishedCount = event.results.filter((result) => result.published && result.place).length;

    if (!publishedCount) {
      skipped += 1;
      continue;
    }

    const result = await syncResultsNewsForEvent(event, options);

    if (result.skipped) {
      skipped += 1;
    } else if (result.created) {
      created += 1;
    } else if (result.updated) {
      updated += 1;
    }
  }

  safeRevalidatePath("/aktualnosci");
  safeRevalidatePath("/");

  return { created, updated, skipped, totalEvents: events.length };
}

export async function syncFacebookResults(year = FACEBOOK_RESULTS_YEAR) {
  const { posts, sources } = await fetchFacebookPosts(120);
  const seedEvents = loadFacebookSeedEvents(year);

  const postRows = mapPostsToRows(posts, year);
  const seedRows = mapSeedEventsToRows(seedEvents, year);
  const rows = dedupeRows(seedRows, postRows);

  if (!rows.length) {
    const news = await syncAllResultsNews(year, { notify: false });

    return {
      ok: true,
      sources,
      postsChecked: posts.length,
      seedEvents: seedEvents.length,
      inserted: 0,
      skipped: 0,
      parsedRows: 0,
      totalYearResults: await countFacebookResults(year),
      news,
    };
  }

  const result = await upsertFacebookResults(rows);
  const dedupe = await dedupeFacebookResultsInDatabase(year);
  const news = await syncAllResultsNews(year, { notify: false });

  safeRevalidatePath("/zawody/wyniki-zawodow");
  safeRevalidatePath("/aktualnosci");
  safeRevalidatePath("/");

  return {
    ok: true,
    sources,
    postsChecked: posts.length,
    seedEvents: seedEvents.length,
    parsedRows: rows.length,
    dedupe,
    ...result,
    totalYearResults: await countFacebookResults(year),
    news,
  };
}

/** @deprecated Użyj syncFacebookResults — zachowane dla kompatybilności. */
export async function syncFacebookResultsFromApi(year = FACEBOOK_RESULTS_YEAR) {
  return syncFacebookResults(year);
}

export async function importFacebookSeedEvents(events: FacebookSeedEvent[], year = FACEBOOK_RESULTS_YEAR) {
  const rows = mapSeedEventsToRows(events, year);
  const result = await upsertFacebookResults(rows);
  const news = await syncAllResultsNews(year, { notify: false });
  safeRevalidatePath("/zawody/wyniki-zawodow");
  safeRevalidatePath("/aktualnosci");
  safeRevalidatePath("/");

  return {
    ok: true,
    source: "seed" as const,
    parsedRows: rows.length,
    ...result,
    totalYearResults: await countFacebookResults(year),
    news,
  };
}

export async function listPublicFacebookResults(year = FACEBOOK_RESULTS_YEAR) {
  return listFacebookResultsGrouped(year);
}
