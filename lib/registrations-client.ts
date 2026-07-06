import { auth } from "./firebase";
import type { NotifyResult } from "./notify-service";
import type { RegistrationRecord } from "./registration-types";

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

export type RegistrationItem = RegistrationRecord;

export async function fetchMyRegistrations() {
  const headers = await getAuthHeader();
  const response = await fetch("/api/registrations", { headers });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Nie udało się pobrać zgłoszeń.");
  }

  return result.registrations as RegistrationItem[];
}

export async function fetchRegistrationsForEvent(eventId: string) {
  const headers = await getAuthHeader();
  const response = await fetch(
    `/api/registrations?eventId=${encodeURIComponent(eventId)}`,
    { headers }
  );
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Nie udało się pobrać zgłoszeń.");
  }

  return result.registrations as RegistrationItem[];
}

export async function submitRegistration(eventId: string, childId: string) {
  const headers = await getAuthHeader();
  const response = await fetch("/api/registrations", {
    method: "POST",
    headers,
    body: JSON.stringify({ eventId, childId }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Nie udało się zgłosić dziecka.");
  }

  return result.registration as RegistrationItem;
}

export async function fetchAdminRegistrations(eventId?: string) {
  const headers = await getAuthHeader();
  const url = eventId
    ? `/api/admin/registrations?eventId=${encodeURIComponent(eventId)}`
    : "/api/admin/registrations";

  const response = await fetch(url, { headers });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Nie udało się pobrać zgłoszeń.");
  }

  return result.registrations as RegistrationItem[];
}

export async function fetchRegistrationCounts(eventIds: string[]) {
  const headers = await getAuthHeader();
  const response = await fetch(
    `/api/admin/registrations/counts?ids=${encodeURIComponent(eventIds.join(","))}`,
    { headers }
  );
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Nie udało się pobrać liczników.");
  }

  return result.counts as Record<string, number>;
}

export async function updateAdminRegistrationStatus(
  id: string,
  status: "pending" | "approved" | "rejected"
) {
  const headers = await getAuthHeader();
  const response = await fetch(`/api/admin/registrations/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ status }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Nie udało się zaktualizować zgłoszenia.");
  }

  return {
    registration: result.registration as RegistrationItem,
    notifyResult: result.notifyResult as NotifyResult | undefined,
  };
}

export async function updateAdminRegistrationData(
  id: string,
  data: {
    child_name?: string;
    child_surname?: string;
    child_birth_year?: string;
    child_gender?: string;
    child_weight?: string;
    parent_phone?: string | null;
  }
) {
  const headers = await getAuthHeader();
  const response = await fetch(`/api/admin/registrations/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ data }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Nie udało się zaktualizować danych zgłoszenia.");
  }

  return result.registration as RegistrationItem;
}

export async function deleteAdminRegistration(id: string) {
  const headers = await getAuthHeader();
  const response = await fetch(`/api/admin/registrations/${id}`, {
    method: "DELETE",
    headers,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Nie udało się usunąć zgłoszenia.");
  }

  return true;
}
