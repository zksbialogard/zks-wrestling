import { supabase } from "./supabase";
import { createSupabaseAdmin } from "./supabase";

export type { Event } from "./events";
export { fetchEvents } from "./events";

export async function getEvents() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    try {
      const admin = createSupabaseAdmin();
      const { data, error } = await admin
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });

      if (!error) {
        return data || [];
      }

      console.error(error);
    } catch (error) {
      console.error(error);
    }
  }

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  return data || [];
}
