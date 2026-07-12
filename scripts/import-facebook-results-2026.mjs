/**
 * Import początkowych wyników 2026 z data/facebook-results-2026.seed.json do Supabase.
 *
 * Wymaga w .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Uruchomienie:
 *   node scripts/import-facebook-results-2026.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_PATH = path.join(__dirname, "../data/facebook-results-2026.seed.json");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.join(__dirname, "../.env.local"));
loadEnvFile(path.join(__dirname, "../.env"));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Brak NEXT_PUBLIC_SUPABASE_URL lub SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const seed = JSON.parse(fs.readFileSync(SEED_PATH, "utf8"));
const supabase = createClient(supabaseUrl, serviceRoleKey);

const seasonFrom = `${seed.year}-01-01`;
const seasonTo = `${seed.year}-12-31`;

const { error: cleanupError } = await supabase
  .from("facebook_competition_results")
  .delete()
  .or(`year.neq.${seed.year},event_date.lt.${seasonFrom},event_date.gt.${seasonTo}`);

if (cleanupError) {
  console.error("Cleanup error:", cleanupError.message);
  process.exit(1);
}

let inserted = 0;
let skipped = 0;

for (const event of seed.events) {
  for (const result of event.results) {
    const payload = {
      facebook_post_id: event.facebook_post_id,
      event_title: event.event_title,
      event_date: event.event_date,
      location: event.location || "",
      athlete_name: result.athlete_name,
      weight_class: result.weight_class || "",
      style: result.style || "",
      place: result.place,
      year: seed.year,
      source_url: event.source_url || "https://www.facebook.com/zksbialogard",
      published: true,
      updated_at: new Date().toISOString(),
    };

    const { data: existing } = await supabase
      .from("facebook_competition_results")
      .select("id")
      .eq("facebook_post_id", payload.facebook_post_id)
      .eq("athlete_name", payload.athlete_name)
      .eq("place", payload.place)
      .eq("event_title", payload.event_title)
      .eq("style", payload.style)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("facebook_competition_results")
        .update(payload)
        .eq("id", existing.id);

      if (error) {
        console.error("Update error:", error.message);
        process.exit(1);
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

      console.error("Insert error:", error.message);
      process.exit(1);
    }

    inserted += 1;
  }
}

const totalRows = seed.events.reduce((sum, event) => sum + event.results.length, 0);

console.log(
  JSON.stringify(
    {
      ok: true,
      year: seed.year,
      events: seed.events.length,
      seedRows: totalRows,
      inserted,
      skipped,
    },
    null,
    2
  )
);
