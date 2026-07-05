import { auth } from "./firebase";
import { supabase } from "./supabase";

export type Event = {
  id: string;
  title: string;
  location: string;
  event_date: string;
  registration_deadline: string;
};

export async function fetchEvents(): Promise<Event[]> {
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

async function getAuthHeader() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Musisz być zalogowany jako administrator.");
  }

  const token = await user.getIdToken();

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function createEvent(data: {
  title: string;
  location: string;
  event_date: string;
  registration_deadline: string;
}) {
  const headers = await getAuthHeader();

  const response = await fetch("/api/admin/events", {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Nie udało się dodać zawodów.");
  }

  return true;
}

export async function updateEvent(
  id: string,
  data: {
    title: string;
    location: string;
    event_date: string;
    registration_deadline: string;
  }
) {
  const headers = await getAuthHeader();

  const response = await fetch(`/api/admin/events/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Nie udało się zaktualizować zawodów.");
  }

  return true;
}

export async function deleteEvent(id: string) {
  const headers = await getAuthHeader();

  const response = await fetch(`/api/admin/events/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Nie udało się usunąć zawodów.");
  }

  return true;
}
