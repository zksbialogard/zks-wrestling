import { groupFacebookEvents, buildSemanticResultKey } from "./facebook-results-dedupe";
import {
  buildFacebookEventGroupKey,
  isSameCompetitionEvent,
} from "./facebook-event-utils";
import {
  normalizeAthleteNameFromFacebook,
  normalizeAthleteNameKey,
  isValidAthleteName,
} from "./athlete-name-utils";
import { createSupabaseAdmin, supabase } from "./supabase";
import type {
  FacebookEventResults,
  FacebookResultInput,
  FacebookResultRecord,
} from "./facebook-results-types";

function hasServiceRole() {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

function getReadClient() {
  return hasServiceRole() ? createSupabaseAdmin() : supabase;
}

function normalizeStyle(style?: string | null) {
  const value = style?.trim().toLowerCase() || "";
  if (value.includes("woln")) return "wolny";
  if (value.includes("klasyczn")) return "klasyczny";
  return "";
}

export async function upsertFacebookResults(rows: FacebookResultInput[]) {
  if (!hasServiceRole()) {
    throw new Error("Brak SUPABASE_SERVICE_ROLE_KEY na Vercel.");
  }

  if (!rows.length) {
    return { inserted: 0, skipped: 0 };
  }

  const supabase = createSupabaseAdmin();
  let inserted = 0;
  let skipped = 0;

  for (const row of rows) {
    const payload = {
      facebook_post_id: row.facebook_post_id,
      event_title: row.event_title.trim(),
      event_date: row.event_date || null,
      location: row.location?.trim() || "",
      athlete_name: normalizeAthleteNameFromFacebook(row.athlete_name.trim()),
      weight_class: row.weight_class?.trim() || "",
      style: row.style?.trim() || "",
      place: row.place && row.place > 0 ? row.place : null,
      year: row.year,
      source_url: row.source_url || null,
      published: row.published ?? true,
      updated_at: new Date().toISOString(),
    };

    if (!isValidAthleteName(payload.athlete_name)) {
      skipped += 1;
      continue;
    }

    const { data: exactMatch } = await supabase
      .from("facebook_competition_results")
      .select("id")
      .eq("facebook_post_id", payload.facebook_post_id)
      .eq("athlete_name", payload.athlete_name)
      .eq("place", payload.place)
      .eq("event_title", payload.event_title)
      .eq("style", payload.style)
      .maybeSingle();

    let existingId = exactMatch?.id;

    if (!existingId && payload.event_date) {
      const { data: yearRows } = await supabase
        .from("facebook_competition_results")
        .select("id,event_title,event_date,athlete_name,place,style,weight_class,facebook_post_id")
        .eq("year", payload.year)
        .eq("place", payload.place);

      const semanticMatch = (yearRows || []).find((candidate) => {
        if (buildSemanticResultKey(candidate) === buildSemanticResultKey(payload)) {
          return true;
        }

        return (
          normalizeAthleteNameKey(candidate.athlete_name) ===
            normalizeAthleteNameKey(payload.athlete_name) &&
          candidate.place === payload.place &&
          isSameCompetitionEvent(
            candidate.event_title,
            candidate.event_date,
            payload.event_title,
            payload.event_date
          )
        );
      });

      existingId = semanticMatch?.id;
    }

    if (existingId) {
      const { error } = await supabase
        .from("facebook_competition_results")
        .update(payload)
        .eq("id", existingId);

      if (error) {
        throw new Error(error.message);
      }

      skipped += 1;
      continue;
    }

    const { error } = await supabase.from("facebook_competition_results").insert(payload);

    if (error) {
      if (error.code === "23505") {
        skipped += 1;
        continue;
      }

      throw new Error(error.message);
    }

    inserted += 1;
  }

  return { inserted, skipped };
}

function seasonDateRange(year: number) {
  return {
    from: `${year}-01-01`,
    to: `${year}-12-31`,
  };
}

export function isResultInSeason(
  row: Pick<FacebookResultRecord, "year" | "event_date">,
  year: number
) {
  if (row.year !== year) {
    return false;
  }

  if (!row.event_date) {
    return true;
  }

  const eventYear = Number(row.event_date.slice(0, 4));
  return eventYear === year;
}

export async function listFacebookResultsGrouped(year: number): Promise<FacebookEventResults[]> {
  const { from, to } = seasonDateRange(year);
  const client = getReadClient();
  const { data, error } = await client
    .from("facebook_competition_results")
    .select("*")
    .eq("published", true)
    .eq("year", year)
    .gte("event_date", from)
    .lte("event_date", to)
    .not("place", "is", null)
    .order("event_date", { ascending: false, nullsFirst: false })
    .order("place", { ascending: true });

  if (error || !data?.length) {
    return [];
  }

  const grouped = new Map<string, FacebookEventResults>();

  for (const row of data as FacebookResultRecord[]) {
    const key = buildFacebookEventGroupKey(row.event_title, row.event_date);
    const existing = grouped.get(key);

    if (!existing) {
      grouped.set(key, {
        facebook_post_id: row.facebook_post_id,
        event_title: row.event_title,
        event_date: row.event_date,
        location: row.location,
        source_url: row.source_url,
        club_place: row.club_place ?? null,
        club_points: row.club_points ?? null,
        news_post_id: row.news_post_id ?? null,
        results: [row],
      });
    } else {
      existing.results.push(row);
      if (row.club_place != null) existing.club_place = row.club_place;
      if (row.club_points) existing.club_points = row.club_points;
      if (row.news_post_id) existing.news_post_id = row.news_post_id;
    }
  }

  return groupFacebookEvents(Array.from(grouped.values())).map((group) => ({
    ...group,
    results: [...group.results].sort((a, b) => (a.place || 99) - (b.place || 99)),
  }));
}

export async function countFacebookResults(year: number) {
  const { from, to } = seasonDateRange(year);
  const client = getReadClient();
  const { count, error } = await client
    .from("facebook_competition_results")
    .select("id", { count: "exact", head: true })
    .eq("year", year)
    .eq("published", true)
    .gte("event_date", from)
    .lte("event_date", to);

  if (error) {
    console.error("countFacebookResults:", error);
    return 0;
  }

  return count || 0;
}

function requireAdminClient() {
  if (!hasServiceRole()) {
    throw new Error("Brak SUPABASE_SERVICE_ROLE_KEY na Vercel.");
  }

  return createSupabaseAdmin();
}

function groupRowsIntoEvents(rows: FacebookResultRecord[]): FacebookEventResults[] {
  const grouped = new Map<string, FacebookEventResults>();

  for (const row of rows) {
    const key = buildFacebookEventGroupKey(row.event_title, row.event_date);
    const existing = grouped.get(key);

    if (!existing) {
      grouped.set(key, {
        facebook_post_id: row.facebook_post_id,
        event_title: row.event_title,
        event_date: row.event_date,
        location: row.location,
        source_url: row.source_url,
        club_place: row.club_place ?? null,
        club_points: row.club_points ?? null,
        news_post_id: row.news_post_id ?? null,
        results: [row],
      });
    } else {
      existing.results.push(row);
      if (row.club_place != null) existing.club_place = row.club_place;
      if (row.club_points) existing.club_points = row.club_points;
      if (row.news_post_id) existing.news_post_id = row.news_post_id;
    }
  }

  return groupFacebookEvents(Array.from(grouped.values()));
}

export async function listFacebookResultsForAdmin(year: number): Promise<FacebookEventResults[]> {
  const { from, to } = seasonDateRange(year);
  const supabase = requireAdminClient();
  const { data, error } = await supabase
    .from("facebook_competition_results")
    .select("*")
    .eq("year", year)
    .gte("event_date", from)
    .lte("event_date", to)
    .order("event_date", { ascending: false, nullsFirst: false })
    .order("place", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return groupRowsIntoEvents((data || []) as FacebookResultRecord[]);
}

function isMissingColumnError(message: string) {
  return /schema cache|column.*does not exist|could not find the/i.test(message);
}

function applyClubFields(
  payload: Record<string, unknown>,
  clubPlace?: number | null,
  clubPoints?: string | null
) {
  if (clubPlace !== undefined) {
    payload.club_place = clubPlace && clubPlace > 0 ? clubPlace : null;
  }

  if (clubPoints !== undefined) {
    payload.club_points = clubPoints?.trim() || null;
  }
}

export function buildFacebookResultPayload(row: FacebookResultInput) {
  const payload: Record<string, unknown> = {
    facebook_post_id: row.facebook_post_id.trim(),
    event_title: row.event_title.trim(),
    event_date: row.event_date || null,
    location: row.location?.trim() || "",
    athlete_name: row.athlete_name.trim(),
    weight_class: row.weight_class?.trim() || "",
    style: row.style?.trim() || "",
    place: row.place && row.place > 0 ? row.place : null,
    year: row.year,
    source_url: row.source_url || null,
    published: row.published ?? true,
    updated_at: new Date().toISOString(),
  };

  applyClubFields(payload, row.club_place, row.club_points);

  return payload;
}

export function createManualFacebookPostId() {
  return `manual-${crypto.randomUUID()}`;
}

export async function createFacebookResult(row: FacebookResultInput) {
  const supabase = requireAdminClient();
  const payload = buildFacebookResultPayload({
    ...row,
    facebook_post_id: row.facebook_post_id?.trim() || createManualFacebookPostId(),
  });

  const { data, error } = await supabase
    .from("facebook_competition_results")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as FacebookResultRecord;
}

export async function updateFacebookResult(id: string, row: Partial<FacebookResultInput>) {
  const supabase = requireAdminClient();
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (row.facebook_post_id !== undefined) updates.facebook_post_id = row.facebook_post_id.trim();
  if (row.event_title !== undefined) updates.event_title = row.event_title.trim();
  if (row.event_date !== undefined) updates.event_date = row.event_date || null;
  if (row.location !== undefined) updates.location = row.location?.trim() || "";
  if (row.athlete_name !== undefined) updates.athlete_name = row.athlete_name.trim();
  if (row.weight_class !== undefined) updates.weight_class = row.weight_class?.trim() || "";
  if (row.style !== undefined) updates.style = row.style?.trim() || "";
  if (row.place !== undefined) updates.place = row.place && row.place > 0 ? row.place : null;
  if (row.year !== undefined) updates.year = row.year;
  if (row.source_url !== undefined) updates.source_url = row.source_url || null;
  if (row.published !== undefined) updates.published = row.published;
  applyClubFields(updates, row.club_place, row.club_points);

  let { data, error } = await supabase
    .from("facebook_competition_results")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error && isMissingColumnError(error.message)) {
    const fallbackUpdates = { ...updates };
    delete fallbackUpdates.club_place;
    delete fallbackUpdates.club_points;

    ({ data, error } = await supabase
      .from("facebook_competition_results")
      .update(fallbackUpdates)
      .eq("id", id)
      .select("*")
      .single());
  }

  if (error) {
    throw new Error(error.message);
  }

  return data as FacebookResultRecord;
}

export async function deleteFacebookResult(id: string) {
  const supabase = requireAdminClient();
  const { error } = await supabase.from("facebook_competition_results").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteFacebookEventGroup(facebookPostId: string, eventTitle: string) {
  const supabase = requireAdminClient();
  const { error } = await supabase
    .from("facebook_competition_results")
    .delete()
    .eq("facebook_post_id", facebookPostId)
    .eq("event_title", eventTitle);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateFacebookEventGroup(
  facebookPostId: string,
  eventTitle: string,
  updates: {
    event_title?: string;
    event_date?: string | null;
    location?: string;
    source_url?: string | null;
    year?: number;
    club_place?: number | null;
    club_points?: string | null;
  }
) {
  const supabase = requireAdminClient();
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.event_title !== undefined) payload.event_title = updates.event_title.trim();
  if (updates.event_date !== undefined) payload.event_date = updates.event_date || null;
  if (updates.location !== undefined) payload.location = updates.location?.trim() || "";
  if (updates.source_url !== undefined) payload.source_url = updates.source_url || null;
  if (updates.year !== undefined) payload.year = updates.year;
  applyClubFields(payload, updates.club_place, updates.club_points);

  const hasClubFields = updates.club_place !== undefined || updates.club_points !== undefined;

  let { error } = await supabase
    .from("facebook_competition_results")
    .update(payload)
    .eq("facebook_post_id", facebookPostId)
    .eq("event_title", eventTitle);

  if (error && isMissingColumnError(error.message) && hasClubFields) {
    const fallbackPayload = { ...payload };
    delete fallbackPayload.club_place;
    delete fallbackPayload.club_points;

    ({ error } = await supabase
      .from("facebook_competition_results")
      .update(fallbackPayload)
      .eq("facebook_post_id", facebookPostId)
      .eq("event_title", eventTitle));

    if (!error) {
      throw new Error(
        "Zapisano dane zawodów, ale klasyfikacja klubowa wymaga migracji 013 w Supabase (plik supabase/migrations/013_facebook_results_club_news.sql)."
      );
    }
  }

  if (error) {
    throw new Error(error.message);
  }
}

export async function getFacebookEventGroup(
  facebookPostId: string,
  eventTitle: string
): Promise<FacebookEventResults | null> {
  const supabase = requireAdminClient();
  const { data, error } = await supabase
    .from("facebook_competition_results")
    .select("*")
    .eq("facebook_post_id", facebookPostId)
    .eq("event_title", eventTitle)
    .order("place", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.length) {
    return null;
  }

  const events = groupRowsIntoEvents(data as FacebookResultRecord[]);
  return events[0] || null;
}
