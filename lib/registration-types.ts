export type RegistrationStatus = "pending" | "approved" | "rejected";

export type RegistrationRecord = {
  id: string;
  event_id: string;
  child_id: string;
  parent_uid: string;
  child_name: string;
  child_surname: string;
  child_birth_year: string;
  child_gender: string;
  child_weight: string;
  parent_phone?: string | null;
  status: RegistrationStatus;
  created_at: string;
  updated_at: string;
};

export type RegistrationInsert = {
  event_id: string;
  child_id: string;
  parent_uid: string;
  child_name: string;
  child_surname: string;
  child_birth_year: string;
  child_gender: string;
  child_weight: string;
  parent_phone?: string | null;
};

export function normalizeRegistrationStatus(status: string): RegistrationStatus {
  if (status === "approved" || status === "accepted") {
    return "approved";
  }

  if (status === "rejected") {
    return "rejected";
  }

  return "pending";
}

export function registrationStatusLabel(status: string) {
  const normalized = normalizeRegistrationStatus(status);

  if (normalized === "approved") {
    return "Zaakceptowane";
  }

  if (normalized === "rejected") {
    return "Odrzucone";
  }

  return "Oczekujące";
}
