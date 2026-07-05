import { supabase } from "./supabase";

export type Event = {
  id: string;
  title: string;
  location: string;
  event_date: string;
  registration_deadline: string;
};

// ==========================
// Pobierz wszystkie zawody
// ==========================

export async function getEvents() {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true });

  if (error) throw error;

  return data as Event[];
}

// ==========================
// Pobierz jedne zawody
// ==========================

export async function getEvent(id: string) {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data as Event;
}

// ==========================
// Dodaj zawody
// ==========================

export async function createEvent(data: {
  title: string;
  location: string;
  event_date: string;
  registration_deadline: string;
}) {
  const { error } = await supabase
    .from("events")
    .insert([data]);

  if (error) throw error;

  return true;
}

// ==========================
// Aktualizuj zawody
// ==========================

export async function updateEvent(
  id: string,
  data: {
    title: string;
    location: string;
    event_date: string;
    registration_deadline: string;
  }
) {
  const { error } = await supabase
    .from("events")
    .update(data)
    .eq("id", id);

  if (error) throw error;

  return true;
}

// ==========================
// Usuń zawody
// ==========================

export async function deleteEvent(id: string) {
  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", id);

  if (error) throw error;

  return true;
}