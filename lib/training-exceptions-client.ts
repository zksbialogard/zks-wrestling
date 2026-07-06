import { auth } from "./firebase";
import { supabase } from "./supabase";
import type { TrainingGroupId } from "./training-groups";
import type { TrainingException } from "./training-exceptions-db";

export async function fetchTrainingExceptions(
  groupId: TrainingGroupId,
  fromDate?: string
): Promise<TrainingException[]> {
  let query = supabase
    .from("training_exceptions")
    .select("*")
    .eq("group_id", groupId)
    .order("session_date", { ascending: false });

  if (fromDate) {
    query = query.gte("session_date", fromDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error("fetchTrainingExceptions:", error);
    return [];
  }

  return (data || []) as TrainingException[];
}

async function getAuthHeader() {
  const user = auth.currentUser;
  if (!user) throw new Error("Musisz być zalogowany.");
  const token = await user.getIdToken();
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function submitTrainingException(input: {
  group_id: TrainingGroupId;
  session_date: string;
  status: "cancelled" | "rescheduled";
  new_start?: string;
  new_end?: string;
  message: string;
}) {
  const headers = await getAuthHeader();
  const response = await fetch("/api/admin/training-exceptions", {
    method: "POST",
    headers,
    body: JSON.stringify({ ...input, notify: { inApp: true, push: true } }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Nie udało się zapisać zmiany treningu.");
  }

  return result;
}
