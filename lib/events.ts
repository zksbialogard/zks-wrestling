import { auth } from "./firebase";
import type { EventType } from "./event-types";
import { supabase } from "./supabase";

export type Event = {
  id: string;
  title: string;
  location: string;
  event_date: string;
  registration_deadline: string;
  event_type?: EventType | string;
  end_date?: string | null;
  age_category?: string | null;
  season?: number | null;
  notes?: string | null;
  registrations_enabled?: boolean | null;
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

export async function fetchEventById(id: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

async function getAuthHeader() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Musisz być zalogowany z uprawnieniami moderatora lub administratora.");
  }

  const token = await user.getIdToken();

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

function mapClientError(error: unknown) {
  const message = error instanceof Error ? error.message : "Nie udało się dodać zawodów.";

  if (message.includes("fetch failed") || message.includes("Failed to fetch")) {
    return "Brak połączenia z serwerem. Sprawdź deploy na Vercel i zmienne Supabase, potem odśwież stronę.";
  }

  return message;
}

export async function createEvent(data: {
  title: string;
  location: string;
  event_date: string;
  registration_deadline: string;
  event_type?: EventType;
  end_date?: string | null;
  age_category?: string | null;
  season?: number | null;
  notes?: string | null;
  registrations_enabled?: boolean | null;
  notify?: {
    email?: boolean;
    sms?: boolean;
    inApp?: boolean;
    push?: boolean;
  };
}) {
  const headers = await getAuthHeader();

  let response: Response;

  try {
    response = await fetch("/api/admin/events", {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
  } catch (error) {
    throw new Error(mapClientError(error));
  }

  let result: {
    error?: string;
    data?: Event;
    notifyResult?: {
      totalParents: number;
      emailsSent: number;
      smsSent: number;
      inAppSent: number;
      pushSent: number;
      errors: string[];
      warnings: string[];
    };
  };

  try {
    result = await response.json();
  } catch {
    throw new Error("Serwer zwrócił niepoprawną odpowiedź. Sprawdź deploy na Vercel.");
  }

  if (!response.ok) {
    throw new Error(result.error || "Nie udało się dodać zawodów.");
  }

  return {
    event: result.data as Event,
    notifyResult: result.notifyResult || null,
  };
}

export async function updateEvent(
  id: string,
  data: {
    title: string;
    location: string;
    event_date: string;
    registration_deadline: string;
    event_type?: EventType;
    end_date?: string | null;
    age_category?: string | null;
    season?: number | null;
    notes?: string | null;
    registrations_enabled?: boolean | null;
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
