import { createSupabaseAdmin } from "./supabase";

export type ParentUser = {
  uid: string;
  email?: string;
  telefon?: string;
  imie?: string;
  nazwisko?: string;
  rola?: string;
};

function hasServiceRole() {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

export async function listParentUsersFromDb(): Promise<ParentUser[]> {
  if (!hasServiceRole()) {
    return [];
  }

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("parent_users")
    .select("uid, email, telefon, imie, rola")
    .eq("rola", "rodzic");

  if (error) {
    console.error("listParentUsersFromDb:", error);
    return [];
  }

  return (data || []).map((item) => ({
    uid: item.uid,
    email: item.email,
    telefon: item.telefon ? String(item.telefon).trim() : undefined,
    imie: item.imie || undefined,
    rola: item.rola || undefined,
  }));
}

export async function upsertParentUser(user: ParentUser & { nazwisko?: string }) {
  if (!hasServiceRole()) {
    return false;
  }

  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("parent_users").upsert(
    {
      uid: user.uid,
      email: user.email,
      telefon: user.telefon || null,
      imie: user.imie || null,
      nazwisko: user.nazwisko || null,
      rola: user.rola || "rodzic",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "uid" }
  );

  if (error) {
    console.error("upsertParentUser:", error);
    return false;
  }

  return true;
}

export async function upsertParentUsers(users: Array<ParentUser & { nazwisko?: string }>) {
  if (!hasServiceRole() || !users.length) {
    return 0;
  }

  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("parent_users").upsert(
    users.map((user) => ({
      uid: user.uid,
      email: user.email,
      telefon: user.telefon || null,
      imie: user.imie || null,
      nazwisko: user.nazwisko || null,
      rola: user.rola || "rodzic",
      updated_at: new Date().toISOString(),
    })),
    { onConflict: "uid" }
  );

  if (error) {
    console.error("upsertParentUsers:", error);
    return 0;
  }

  return users.length;
}
