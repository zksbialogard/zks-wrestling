import { createSupabaseAdmin } from "./supabase";
import { supabaseRestInsertMany } from "./supabase-rest";

export type PushSubscriptionRecord = {
  id: string;
  user_uid: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

function hasServiceRole() {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

export async function upsertPushSubscription(input: {
  user_uid: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}) {
  if (!hasServiceRole()) {
    return false;
  }

  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_uid: input.user_uid,
      endpoint: input.endpoint,
      p256dh: input.p256dh,
      auth: input.auth,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "endpoint" }
  );

  if (error) {
    console.error("upsertPushSubscription:", error);
    return false;
  }

  return true;
}

export async function removePushSubscription(endpoint: string) {
  if (!hasServiceRole()) {
    return false;
  }

  const supabase = createSupabaseAdmin();
  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", endpoint);

  if (error) {
    console.error("removePushSubscription:", error);
    return false;
  }

  return true;
}

export async function listPushSubscriptionsForUsers(userUids: string[]) {
  if (!hasServiceRole() || !userUids.length) {
    return [];
  }

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("push_subscriptions")
    .select("id, user_uid, endpoint, p256dh, auth")
    .in("user_uid", userUids);

  if (error) {
    console.error("listPushSubscriptionsForUsers:", error);
    return [];
  }

  return (data || []) as PushSubscriptionRecord[];
}
