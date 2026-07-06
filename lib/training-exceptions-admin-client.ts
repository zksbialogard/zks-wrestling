import { auth } from "./firebase";
import type { TrainingGroupId } from "./training-groups";

type CreateTrainingExceptionInput = {
  group_id: TrainingGroupId;
  session_date: string;
  status: "cancelled" | "rescheduled";
  new_start?: string;
  new_end?: string;
  message: string;
  notify?: {
    email?: boolean;
    sms?: boolean;
    inApp?: boolean;
    push?: boolean;
  };
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

export async function createTrainingExceptionAdmin(input: CreateTrainingExceptionInput) {
  const headers = await getAuthHeader();

  const response = await fetch("/api/admin/training-exceptions", {
    method: "POST",
    headers,
    body: JSON.stringify(input),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Nie udało się zapisać wyjątku treningowego.");
  }

  return result;
}
