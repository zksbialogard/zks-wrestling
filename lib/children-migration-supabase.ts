import { createSupabaseAdmin } from "./supabase";

function hasServiceRole() {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

const STATUS_PRIORITY: Record<string, number> = {
  approved: 3,
  pending: 2,
  rejected: 1,
};

function pickPreferredRegistration<
  T extends { id: string; status: string; created_at?: string | null }
>(rows: T[]) {
  return [...rows].sort((a, b) => {
    const statusDiff =
      (STATUS_PRIORITY[b.status] || 0) - (STATUS_PRIORITY[a.status] || 0);

    if (statusDiff !== 0) {
      return statusDiff;
    }

    return String(b.created_at || "").localeCompare(String(a.created_at || ""));
  })[0];
}

export async function remapChildReferences(canonicalId: string, duplicateId: string) {
  const summary = {
    registrationsRemapped: 0,
    registrationsRemoved: 0,
    resultsRemapped: 0,
  };

  if (!hasServiceRole() || canonicalId === duplicateId) {
    return summary;
  }

  const supabase = createSupabaseAdmin();

  const { data: duplicateRegistrations, error: duplicateRegistrationsError } =
    await supabase.from("registrations").select("*").eq("child_id", duplicateId);

  if (duplicateRegistrationsError) {
    throw new Error(duplicateRegistrationsError.message);
  }

  for (const registration of duplicateRegistrations || []) {
    const { data: canonicalRegistrations, error: canonicalRegistrationsError } =
      await supabase
        .from("registrations")
        .select("*")
        .eq("event_id", registration.event_id)
        .eq("child_id", canonicalId);

    if (canonicalRegistrationsError) {
      throw new Error(canonicalRegistrationsError.message);
    }

    if ((canonicalRegistrations || []).length > 0) {
      const keep = pickPreferredRegistration([
        ...canonicalRegistrations!,
        registration,
      ]);

      const removeIds = [registration.id, ...canonicalRegistrations!.map((row) => row.id)].filter(
        (id) => id !== keep.id
      );

      if (removeIds.length) {
        const { error } = await supabase.from("registrations").delete().in("id", removeIds);

        if (error) {
          throw new Error(error.message);
        }

        summary.registrationsRemoved += removeIds.length;
      }

      continue;
    }

    const { error } = await supabase
      .from("registrations")
      .update({ child_id: canonicalId, updated_at: new Date().toISOString() })
      .eq("id", registration.id);

    if (error) {
      throw new Error(error.message);
    }

    summary.registrationsRemapped += 1;
  }

  const { data: duplicateResults, error: duplicateResultsError } = await supabase
    .from("competition_results")
    .select("id")
    .eq("child_id", duplicateId);

  if (duplicateResultsError) {
    throw new Error(duplicateResultsError.message);
  }

  if ((duplicateResults || []).length > 0) {
    const { error } = await supabase
      .from("competition_results")
      .update({ child_id: canonicalId, updated_at: new Date().toISOString() })
      .eq("child_id", duplicateId);

    if (error) {
      throw new Error(error.message);
    }

    summary.resultsRemapped += duplicateResults!.length;
  }

  return summary;
}
