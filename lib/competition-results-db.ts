import { createSupabaseAdmin } from "./supabase";
import type {
  CompetitionResultInput,
  CompetitionResultRecord,
  PublishedEventResults,
} from "./competition-results-types";

function hasServiceRole() {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

export async function listResultsForEvent(eventId: string) {
  if (!hasServiceRole()) {
    return [] as CompetitionResultRecord[];
  }

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("competition_results")
    .select("*")
    .eq("event_id", eventId)
    .order("place", { ascending: true, nullsFirst: false });

  if (error) {
    console.error("listResultsForEvent:", error);
    return [];
  }

  return (data || []) as CompetitionResultRecord[];
}

export async function upsertEventResults(
  eventId: string,
  rows: CompetitionResultInput[]
) {
  if (!hasServiceRole()) {
    throw new Error("Brak SUPABASE_SERVICE_ROLE_KEY na Vercel.");
  }

  const supabase = createSupabaseAdmin();

  const { error: deleteError } = await supabase
    .from("competition_results")
    .delete()
    .eq("event_id", eventId)
    .eq("published", false);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  const payload = rows
    .filter((row) => row.athlete_name.trim())
    .map((row) => ({
      event_id: eventId,
      registration_id: row.registration_id || null,
      child_id: row.child_id || null,
      parent_uid: row.parent_uid || null,
      athlete_name: row.athlete_name.trim(),
      weight_class: row.weight_class?.trim() || "",
      place: row.place && row.place > 0 ? row.place : null,
      published: false,
      updated_at: new Date().toISOString(),
    }));

  if (!payload.length) {
    return [] as CompetitionResultRecord[];
  }

  const { data, error } = await supabase
    .from("competition_results")
    .insert(payload)
    .select("*");

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as CompetitionResultRecord[];
}

export async function publishEventResults(eventId: string) {
  if (!hasServiceRole()) {
    throw new Error("Brak SUPABASE_SERVICE_ROLE_KEY na Vercel.");
  }

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("competition_results")
    .update({
      published: true,
      updated_at: new Date().toISOString(),
    })
    .eq("event_id", eventId)
    .not("place", "is", null)
    .select("*");

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as CompetitionResultRecord[];
}

export async function listPublishedResultsGrouped(): Promise<PublishedEventResults[]> {
  if (!hasServiceRole()) {
    return [];
  }

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("competition_results")
    .select("*")
    .eq("published", true)
    .not("place", "is", null)
    .order("created_at", { ascending: false });

  if (error || !data?.length) {
    return [];
  }

  const eventIds = [...new Set(data.map((row) => row.event_id))];
  const { data: events } = await supabase
    .from("events")
    .select("id, title, event_date, location")
    .in("id", eventIds);

  const eventMap = new Map((events || []).map((event) => [event.id, event]));
  const grouped = new Map<string, PublishedEventResults>();

  for (const row of data as CompetitionResultRecord[]) {
    const event = eventMap.get(row.event_id);
    if (!event) continue;

    const existing = grouped.get(row.event_id);

    if (!existing) {
      grouped.set(row.event_id, {
        event_id: row.event_id,
        event_title: event.title,
        event_date: event.event_date,
        location: event.location,
        results: [row],
      });
    } else {
      existing.results.push(row);
    }
  }

  return Array.from(grouped.values()).map((group) => ({
    ...group,
    results: [...group.results].sort((a, b) => (a.place || 99) - (b.place || 99)),
  }));
}

export async function listPublishedResultsForParent(parentUid: string) {
  if (!hasServiceRole()) {
    return [] as CompetitionResultRecord[];
  }

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("competition_results")
    .select("*")
    .eq("published", true)
    .eq("parent_uid", parentUid)
    .not("place", "is", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("listPublishedResultsForParent:", error);
    return [];
  }

  return (data || []) as CompetitionResultRecord[];
}
