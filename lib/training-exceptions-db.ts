import { supabaseRestInsert, supabaseRestSelect } from "./supabase-rest";
import type { TrainingGroupId } from "./training-groups";

export type TrainingExceptionStatus = "cancelled" | "rescheduled";

export type TrainingException = {
  id: string;
  group_id: TrainingGroupId;
  session_date: string;
  status: TrainingExceptionStatus;
  original_start: string | null;
  original_end: string | null;
  new_start: string | null;
  new_end: string | null;
  message: string;
  created_at: string;
};

export type TrainingExceptionInsert = {
  group_id: TrainingGroupId;
  session_date: string;
  status: TrainingExceptionStatus;
  original_start?: string;
  original_end?: string;
  new_start?: string;
  new_end?: string;
  message: string;
};

export async function listTrainingExceptionsForGroup(
  groupId: TrainingGroupId,
  options: { fromDate?: string; limit?: number } = {}
): Promise<TrainingException[]> {
  const filters: Record<string, string> = {
    group_id: `eq.${groupId}`,
  };

  if (options.fromDate) {
    filters.session_date = `gte.${options.fromDate}`;
  }

  return supabaseRestSelect<TrainingException>("training_exceptions", filters, {
    order: "session_date.desc",
    limit: options.limit,
  });
}

export async function createTrainingException(
  input: TrainingExceptionInsert
): Promise<TrainingException> {
  return supabaseRestInsert("training_exceptions", {
    group_id: input.group_id,
    session_date: input.session_date,
    status: input.status,
    original_start: input.original_start || null,
    original_end: input.original_end || null,
    new_start: input.new_start || null,
    new_end: input.new_end || null,
    message: input.message,
  });
}
