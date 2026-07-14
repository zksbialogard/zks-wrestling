import { auth } from "./firebase";
import type { FacebookEventResults, FacebookResultRecord } from "./facebook-results-types";

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

export type FacebookResultFormData = {
  facebook_post_id?: string;
  event_title: string;
  event_date?: string;
  location?: string;
  athlete_name: string;
  weight_class?: string;
  style?: string;
  place?: number | null;
  year: number;
  source_url?: string;
  published?: boolean;
};

export async function fetchAdminFacebookResults(year: number): Promise<FacebookEventResults[]> {
  const headers = await getAuthHeader();
  const response = await fetch(`/api/admin/facebook-results?year=${year}`, { headers });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Nie udało się pobrać wyników.");
  }

  return result.events || [];
}

export async function createAdminFacebookResult(
  data: FacebookResultFormData
): Promise<FacebookResultRecord> {
  const headers = await getAuthHeader();
  const response = await fetch("/api/admin/facebook-results", {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Nie udało się dodać wyniku.");
  }

  return result.data;
}

export async function updateAdminFacebookResult(
  id: string,
  data: Partial<FacebookResultFormData>
): Promise<FacebookResultRecord> {
  const headers = await getAuthHeader();
  const response = await fetch(`/api/admin/facebook-results/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Nie udało się zaktualizować wyniku.");
  }

  return result.data;
}

export async function deleteAdminFacebookResult(id: string) {
  const headers = await getAuthHeader();
  const response = await fetch(`/api/admin/facebook-results/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers,
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Nie udało się usunąć wyniku.");
  }

  return result;
}

export async function deleteAdminFacebookResults(ids: string[]) {
  const headers = await getAuthHeader();
  const response = await fetch("/api/admin/facebook-results/bulk-delete", {
    method: "POST",
    headers,
    body: JSON.stringify({ ids }),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Nie udało się usunąć wyników.");
  }

  return result as {
    ok: boolean;
    deletedCount: number;
    news?: { action: "none" | "updated" | "deleted" };
  };
}

export async function deleteAdminFacebookEventGroup(facebookPostId: string, eventTitle: string) {
  const headers = await getAuthHeader();
  const response = await fetch("/api/admin/facebook-results/event", {
    method: "DELETE",
    headers,
    body: JSON.stringify({ facebook_post_id: facebookPostId, event_title: eventTitle }),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Nie udało się usunąć zawodów.");
  }

  return result;
}

export async function updateAdminFacebookEventGroup(
  facebookPostId: string,
  eventTitle: string,
  data: {
    event_title?: string;
    event_date?: string;
    location?: string;
    source_url?: string;
    year?: number;
    club_place?: number | null;
    club_points?: string | null;
  }
) {
  const headers = await getAuthHeader();
  const response = await fetch("/api/admin/facebook-results/event", {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      facebook_post_id: facebookPostId,
      event_title: eventTitle,
      new_event_title: data.event_title,
      event_date: data.event_date,
      location: data.location,
      source_url: data.source_url,
      year: data.year,
      club_place: data.club_place,
      club_points: data.club_points,
    }),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Nie udało się zaktualizować zawodów.");
  }
}

export async function syncAdminFacebookResults(year: number) {
  const headers = await getAuthHeader();
  const response = await fetch("/api/admin/facebook-results/sync", {
    method: "POST",
    headers,
    body: JSON.stringify({ year }),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Nie udało się zsynchronizować wyników z Facebooka.");
  }

  return result;
}
