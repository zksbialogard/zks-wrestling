import { supabase } from "./supabase";

export type { Event } from "./events";
export { fetchEvents } from "./events";

export async function getEvents() {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}