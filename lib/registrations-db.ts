import { createSupabaseAdmin } from "./supabase";
import {
  supabaseRestDelete,
  supabaseRestInsert,
  supabaseRestPatch,
} from "./supabase-rest";
import type {
  RegistrationInsert,
  RegistrationRecord,
  RegistrationStatus,
} from "./registration-types";

function hasServiceRole() {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

export async function listRegistrationsForParent(parentUid: string) {
  if (!hasServiceRole()) {
    return [];
  }

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("registrations")
    .select("*")
    .eq("parent_uid", parentUid)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("listRegistrationsForParent:", error);
    return [];
  }

  return (data || []) as RegistrationRecord[];
}

export async function listRegistrationsForEvent(eventId: string) {
  if (!hasServiceRole()) {
    return [];
  }

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("registrations")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("listRegistrationsForEvent:", error);
    return [];
  }

  return (data || []) as RegistrationRecord[];
}

export async function listAllRegistrations() {
  if (!hasServiceRole()) {
    return [];
  }

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("registrations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("listAllRegistrations:", error);
    return [];
  }

  return (data || []) as RegistrationRecord[];
}

export async function countRegistrationsByEvent(eventIds: string[]) {
  if (!hasServiceRole() || !eventIds.length) {
    return {} as Record<string, number>;
  }

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("registrations")
    .select("event_id")
    .in("event_id", eventIds);

  if (error) {
    console.error("countRegistrationsByEvent:", error);
    return {};
  }

  const counts: Record<string, number> = {};

  for (const row of data || []) {
    counts[row.event_id] = (counts[row.event_id] || 0) + 1;
  }

  return counts;
}

export async function findRegistrationByEventAndChild(
  eventId: string,
  childId: string
) {
  if (!hasServiceRole()) {
    return null;
  }

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("registrations")
    .select("*")
    .eq("event_id", eventId)
    .eq("child_id", childId)
    .maybeSingle();

  if (error) {
    console.error("findRegistrationByEventAndChild:", error);
    return null;
  }

  return (data as RegistrationRecord | null) || null;
}

export async function getRegistrationById(id: string) {
  if (!hasServiceRole()) {
    return null;
  }

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("registrations")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getRegistrationById:", error);
    return null;
  }

  return (data as RegistrationRecord | null) || null;
}

export async function createRegistration(input: RegistrationInsert) {
  if (!hasServiceRole()) {
    throw new Error("Brak SUPABASE_SERVICE_ROLE_KEY — nie można zapisać zgłoszenia.");
  }

  try {
    return await supabaseRestInsert("registrations", {
      ...input,
      parent_phone: input.parent_phone || null,
      status: "pending",
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Błąd zapisu zgłoszenia.";

    if (/duplicate key|unique constraint/i.test(message)) {
      throw new Error("To dziecko jest już zgłoszone na te zawody.");
    }

    throw error instanceof Error ? error : new Error(message);
  }
}

export async function updateRegistrationStatus(
  id: string,
  status: RegistrationStatus
) {
  if (!hasServiceRole()) {
    return false;
  }

  try {
    await supabaseRestPatch(
      "registrations",
      { id: `eq.${id}` },
      { status, updated_at: new Date().toISOString() }
    );
    return true;
  } catch (error) {
    console.error("updateRegistrationStatus:", error);
    return false;
  }
}

export async function updateRegistrationData(
  id: string,
  data: Partial<
    Pick<
      RegistrationRecord,
      | "child_name"
      | "child_surname"
      | "child_birth_year"
      | "child_gender"
      | "child_weight"
      | "parent_phone"
    >
  >
) {
  if (!hasServiceRole()) {
    return false;
  }

  try {
    await supabaseRestPatch(
      "registrations",
      { id: `eq.${id}` },
      { ...data, updated_at: new Date().toISOString() }
    );
    return true;
  } catch (error) {
    console.error("updateRegistrationData:", error);
    return false;
  }
}

export async function deleteRegistration(id: string) {
  if (!hasServiceRole()) {
    return false;
  }

  try {
    await supabaseRestDelete("registrations", { id: `eq.${id}` });
    return true;
  } catch (error) {
    console.error("deleteRegistration:", error);
    return false;
  }
}
