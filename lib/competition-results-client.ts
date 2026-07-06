import { auth } from "@/lib/firebase";

async function getAuthHeader() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Musisz być zalogowany.");
  }

  const token = await user.getIdToken();

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export type ResultDraft = {
  registration_id?: string | null;
  child_id?: string | null;
  parent_uid?: string | null;
  athlete_name: string;
  weight_class?: string;
  place?: number | null;
};

export async function fetchAdminEventResults(eventId: string) {
  const headers = await getAuthHeader();
  const response = await fetch(`/api/admin/events/${eventId}/results`, { headers });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Nie udało się pobrać wyników.");
  }

  return result.results as Array<{
    id: string;
    athlete_name: string;
    weight_class: string;
    place?: number | null;
    published: boolean;
    registration_id?: string | null;
    child_id?: string | null;
    parent_uid?: string | null;
  }>;
}

export async function saveAdminEventResults(eventId: string, results: ResultDraft[]) {
  const headers = await getAuthHeader();
  const response = await fetch(`/api/admin/events/${eventId}/results`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ results }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Nie udało się zapisać wyników.");
  }

  return result.results;
}

export async function publishAdminEventResults(eventId: string) {
  const headers = await getAuthHeader();
  const response = await fetch(`/api/admin/events/${eventId}/results`, {
    method: "POST",
    headers,
    body: JSON.stringify({ action: "publish" }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Nie udało się opublikować wyników.");
  }

  return result;
}

export async function fetchMyCompetitionResults() {
  const headers = await getAuthHeader();
  const response = await fetch("/api/competition-results/me", { headers });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Nie udało się pobrać wyników.");
  }

  return result.results as Array<{
    id: string;
    event_id: string;
    event_title: string;
    athlete_name: string;
    weight_class: string;
    place?: number | null;
  }>;
}
