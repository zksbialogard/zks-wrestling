import {
  buildFacebookEventGroupKey,
  extractEventSignature,
  isResultsNewsTitle,
  isSameCompetitionEvent,
  preferCanonicalEventTitle,
  preferCanonicalFacebookPostId,
} from "./facebook-event-utils";
import { normalizeAthleteNameKey, normalizeAthleteNameFromFacebook } from "./athlete-name-utils";
import { createSupabaseAdmin } from "./supabase";
import type { FacebookEventResults, FacebookResultInput, FacebookResultRecord } from "./facebook-results-types";

type ResultRow = FacebookResultRecord;

function normalizeStyle(style?: string | null) {
  const value = style?.trim().toLowerCase() || "";
  if (value.includes("woln")) return "wolny";
  if (value.includes("klasyczn")) return "klasyczny";
  return "";
}

function athleteResultKey(row: Pick<ResultRow, "event_title" | "event_date" | "athlete_name" | "place" | "style" | "weight_class">) {
  return [
    extractEventSignature(row.event_title),
    normalizeAthleteNameKey(row.athlete_name),
    row.place,
  ].join("::");
}

function pickCanonicalRow(rows: ResultRow[]) {
  return [...rows].sort((a, b) => {
    const aSeed = a.facebook_post_id.startsWith("seed-") ? 1 : 0;
    const bSeed = b.facebook_post_id.startsWith("seed-") ? 1 : 0;
    if (aSeed !== bSeed) return bSeed - aSeed;

    const aNumeric = /^\d+$/.test(a.facebook_post_id) ? 1 : 0;
    const bNumeric = /^\d+$/.test(b.facebook_post_id) ? 1 : 0;
    if (aNumeric !== bNumeric) return bNumeric - aNumeric;

    const aWeight = a.weight_class?.trim() ? 1 : 0;
    const bWeight = b.weight_class?.trim() ? 1 : 0;
    if (aWeight !== bWeight) return bWeight - aWeight;

    const aStyle = normalizeStyle(a.style) ? 1 : 0;
    const bStyle = normalizeStyle(b.style) ? 1 : 0;
    if (aStyle !== bStyle) return bStyle - aStyle;

    return a.event_title.length - b.event_title.length;
  })[0];
}

function mergeEventGroups(events: FacebookEventResults[]): FacebookEventResults[] {
  const grouped = new Map<string, FacebookEventResults>();

  for (const event of events) {
    const key = buildFacebookEventGroupKey(event.event_title, event.event_date);
    const existing = grouped.get(key);

    if (!existing) {
      grouped.set(key, {
        ...event,
        results: [...event.results],
      });
      continue;
    }

    existing.results.push(...event.results);
    existing.facebook_post_id = preferCanonicalFacebookPostId([
      existing.facebook_post_id,
      event.facebook_post_id,
    ]);
    existing.event_title = preferCanonicalEventTitle([
      existing.event_title,
      event.event_title,
    ]);
    existing.event_date = existing.event_date || event.event_date;
    existing.location = existing.location || event.location;
    existing.source_url = existing.source_url || event.source_url;
    existing.club_place = existing.club_place ?? event.club_place ?? null;
    existing.club_points = existing.club_points || event.club_points || null;
    existing.news_post_id = existing.news_post_id || event.news_post_id || null;
  }

  return Array.from(grouped.values()).map((group) => ({
    ...group,
    results: dedupeResultsInEvent(group.results),
  }));
}

function dedupeResultsInEvent(results: ResultRow[]) {
  const unique = new Map<string, ResultRow>();

  for (const row of results) {
    const key = athleteResultKey(row);
    const existing = unique.get(key);
    if (!existing) {
      unique.set(key, {
        ...row,
        athlete_name: normalizeAthleteNameFromFacebook(row.athlete_name),
      });
      continue;
    }
    const canonical = pickCanonicalRow([existing, row]);
    unique.set(key, {
      ...canonical,
      athlete_name: normalizeAthleteNameFromFacebook(canonical.athlete_name),
    });
  }

  return Array.from(unique.values()).sort((a, b) => (a.place || 99) - (b.place || 99));
}

export function groupFacebookEvents(events: FacebookEventResults[]) {
  return mergeEventGroups(events);
}

export function buildSemanticResultKey(row: FacebookResultInput | ResultRow) {
  return athleteResultKey(row);
}

export async function dedupeFacebookResultsInDatabase(year: number) {
  const supabase = createSupabaseAdmin();
  const seasonFrom = `${year}-01-01`;
  const seasonTo = `${year}-12-31`;

  const { data, error } = await supabase
    .from("facebook_competition_results")
    .select("*")
    .eq("year", year)
    .gte("event_date", seasonFrom)
    .lte("event_date", seasonTo);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data || []) as ResultRow[];
  const groups = new Map<string, ResultRow[]>();

  for (const row of rows) {
    const key = athleteResultKey(row);
    const existing = groups.get(key) || [];
    existing.push(row);
    groups.set(key, existing);
  }

  let deletedRows = 0;
  let updatedRows = 0;

  for (const groupRows of groups.values()) {
    if (groupRows.length <= 1) {
      const canonical = groupRows[0];
      const canonicalName = normalizeAthleteNameFromFacebook(canonical.athlete_name);
      if (canonicalName !== canonical.athlete_name) {
        await supabase
          .from("facebook_competition_results")
          .update({
            athlete_name: canonicalName,
            updated_at: new Date().toISOString(),
          })
          .eq("id", canonical.id);
        updatedRows += 1;
      }
      continue;
    }

    const canonical = pickCanonicalRow(groupRows);
    const canonicalPostId = preferCanonicalFacebookPostId(
      groupRows.map((row) => row.facebook_post_id)
    );
    const canonicalTitle = preferCanonicalEventTitle(
      groupRows.map((row) => row.event_title)
    );
    const canonicalName = normalizeAthleteNameFromFacebook(canonical.athlete_name);

    const { error: updateError } = await supabase
      .from("facebook_competition_results")
      .update({
        facebook_post_id: canonicalPostId,
        event_title: canonicalTitle,
        athlete_name: canonicalName,
        updated_at: new Date().toISOString(),
      })
      .eq("id", canonical.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    updatedRows += 1;

    const duplicateIds = groupRows
      .filter((row) => row.id !== canonical.id)
      .map((row) => row.id);

    if (!duplicateIds.length) continue;

    const { error: deleteError } = await supabase
      .from("facebook_competition_results")
      .delete()
      .in("id", duplicateIds);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    deletedRows += duplicateIds.length;
  }

  const eventCleanup = await mergeDuplicateEventGroups(year);
  const newsCleanup = await dedupeResultsNewsPosts(year);

  return {
    deletedRows,
    updatedRows,
    ...eventCleanup,
    ...newsCleanup,
  };
}

async function mergeDuplicateEventGroups(year: number) {
  const supabase = createSupabaseAdmin();
  const seasonFrom = `${year}-01-01`;
  const seasonTo = `${year}-12-31`;

  const { data, error } = await supabase
    .from("facebook_competition_results")
    .select("id,event_title,event_date,facebook_post_id")
    .eq("year", year)
    .gte("event_date", seasonFrom)
    .lte("event_date", seasonTo);

  if (error) {
    throw new Error(error.message);
  }

  const eventGroups = new Map<string, Array<{ id: string; event_title: string; facebook_post_id: string }>>();

  for (const row of data || []) {
    const key = buildFacebookEventGroupKey(row.event_title, row.event_date);
    const existing = eventGroups.get(key) || [];
    existing.push(row);
    eventGroups.set(key, existing);
  }

  let mergedEvents = 0;

  for (const rows of eventGroups.values()) {
    const titles = [...new Set(rows.map((row) => row.event_title))];
    const postIds = [...new Set(rows.map((row) => row.facebook_post_id))];
    if (titles.length <= 1 && postIds.length <= 1) continue;

    const canonicalTitle = preferCanonicalEventTitle(titles);
    const canonicalPostId = preferCanonicalFacebookPostId(postIds);
    const ids = rows.map((row) => row.id);

    const { error: updateError } = await supabase
      .from("facebook_competition_results")
      .update({
        event_title: canonicalTitle,
        facebook_post_id: canonicalPostId,
        updated_at: new Date().toISOString(),
      })
      .in("id", ids);

    if (updateError) {
      throw new Error(updateError.message);
    }

    mergedEvents += 1;
  }

  return { mergedEvents };
}

async function dedupeResultsNewsPosts(year: number) {
  const supabase = createSupabaseAdmin();
  const seasonFrom = `${year}-01-01`;
  const seasonTo = `${year}-12-31`;

  const [{ data: rows }, { data: newsRows }] = await Promise.all([
    supabase
      .from("facebook_competition_results")
      .select("event_title,event_date,news_post_id")
      .eq("year", year)
      .gte("event_date", seasonFrom)
      .lte("event_date", seasonTo)
      .not("news_post_id", "is", null),
    supabase
      .from("aktualnosci")
      .select("id,title,content,created_at")
      .order("created_at", { ascending: true }),
  ]);

  const eventNewsMap = new Map<string, string[]>();

  for (const row of rows || []) {
    if (!row.news_post_id) continue;
    const key = buildFacebookEventGroupKey(row.event_title, row.event_date);
    const existing = eventNewsMap.get(key) || [];
    existing.push(row.news_post_id);
    eventNewsMap.set(key, existing);
  }

  let deletedNews = 0;
  const keepNewsIds = new Set<string>();

  for (const newsIds of eventNewsMap.values()) {
    const unique = [...new Set(newsIds)];
    if (!unique.length) continue;
    keepNewsIds.add(unique[0]);
    for (const newsId of unique.slice(1)) {
      await supabase.from("aktualnosci").delete().eq("id", newsId);
      deletedNews += 1;
    }
  }

  const resultsNewsGroups = new Map<string, string[]>();

  for (const item of newsRows || []) {
    if (!isResultsNewsTitle(item.title)) continue;

    const titlePart = item.title.replace(/^wyniki zawodów:\s*/i, "").trim();
    const dateMatch = item.content.match(/\((\d{1,2}\s+\w+\s+\d{4}|\d{4}-\d{2}-\d{2})\)/);
    const eventDate = dateMatch?.[1]?.includes("-") ? dateMatch[1] : null;
    const key = buildFacebookEventGroupKey(titlePart, eventDate);
    const existing = resultsNewsGroups.get(key) || [];
    existing.push(item.id);
    resultsNewsGroups.set(key, existing);
  }

  for (const newsIds of resultsNewsGroups.values()) {
    const unique = [...new Set(newsIds)];
    if (unique.length <= 1) continue;

    const keepId = unique.find((id) => keepNewsIds.has(id)) || unique[0];
    keepNewsIds.add(keepId);

    for (const newsId of unique) {
      if (newsId === keepId) continue;
      await supabase.from("aktualnosci").delete().eq("id", newsId);
      deletedNews += 1;
    }
  }

  return { deletedNews };
}
