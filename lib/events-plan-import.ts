import plan2026Events from "@/data/plan-2026-events.json";
import { eventPayloadToRow, type EventPayload } from "@/lib/event-api-payload";
import { createSupabaseAdmin } from "@/lib/supabase";
import { supabaseRestInsert } from "@/lib/supabase-rest";

export type PlanImportItem = EventPayload;

export type PlanImportResult = {
  season: number;
  total: number;
  inserted: number;
  skipped: number;
  errors: string[];
};

function normalizeKey(item: PlanImportItem) {
  const date = item.event_date.slice(0, 10);
  const title = item.title.trim().toLowerCase();
  const location = item.location.trim().toLowerCase();
  return `${date}:${title}:${location}`;
}

export function getPlan2026Events(): PlanImportItem[] {
  return plan2026Events as PlanImportItem[];
}

export async function importSeasonPlan(
  season: number,
  items: PlanImportItem[],
  options: { replaceSeason?: boolean } = {}
): Promise<PlanImportResult> {
  const result: PlanImportResult = {
    season,
    total: items.length,
    inserted: 0,
    skipped: 0,
    errors: [],
  };

  const supabase = createSupabaseAdmin();

  if (options.replaceSeason) {
    const { error } = await supabase.from("events").delete().eq("season", season);

    if (error) {
      throw new Error(error.message);
    }
  }

  const { data: existingRows, error: existingError } = await supabase
    .from("events")
    .select("event_date, title, location");

  if (existingError) {
    throw new Error(existingError.message);
  }

  const existingKeys = new Set(
    (existingRows || []).map((row) =>
      `${String(row.event_date).slice(0, 10)}:${String(row.title).trim().toLowerCase()}:${String(row.location).trim().toLowerCase()}`
    )
  );

  for (const item of items) {
    const key = normalizeKey(item);

    if (existingKeys.has(key)) {
      result.skipped += 1;
      continue;
    }

    try {
      await supabaseRestInsert("events", eventPayloadToRow({ ...item, season }));
      existingKeys.add(key);
      result.inserted += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Nie udało się dodać imprezy.";
      result.errors.push(`${item.title} (${item.event_date}): ${message}`);
    }
  }

  return result;
}

export async function importPlan2026(replaceSeason = false) {
  return importSeasonPlan(2026, getPlan2026Events(), { replaceSeason });
}
