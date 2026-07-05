import { auth } from "./firebase";

export type Event = {
  id: string;
  title: string;
  location: string;
  event_date: string;
  registration_deadline: string;
};

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
