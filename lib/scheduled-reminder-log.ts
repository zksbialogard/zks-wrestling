import { createSupabaseAdmin } from "./supabase";
import { supabaseRestInsert } from "./supabase-rest";

function hasServiceRole() {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

export async function hasScheduledReminderBeenSent(reminderKey: string): Promise<boolean> {
  if (!hasServiceRole()) {
    return false;
  }

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("scheduled_reminder_log")
    .select("reminder_key")
    .eq("reminder_key", reminderKey)
    .maybeSingle();

  if (error) {
    console.error("hasScheduledReminderBeenSent:", error);
    return false;
  }

  return Boolean(data);
}

export async function markScheduledReminderSent(reminderKey: string): Promise<boolean> {
  if (!hasServiceRole()) {
    return false;
  }

  try {
    await supabaseRestInsert("scheduled_reminder_log", {
      reminder_key: reminderKey,
    });
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (/duplicate key|unique constraint/i.test(message)) {
      return false;
    }

    console.error("markScheduledReminderSent:", error);
    return false;
  }
}
