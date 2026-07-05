import { createSupabaseAdmin } from "./supabase";
import { supabaseRestInsertMany } from "./supabase-rest";
import {
  DEFAULT_TEMPLATES,
  getDefaultTemplate,
  type MessageTemplate,
  type TemplateKey,
} from "./message-templates";

export type NotificationRecord = {
  id: string;
  user_uid: string;
  type: string;
  title: string;
  body: string;
  link?: string | null;
  channels?: string[] | null;
  read_at?: string | null;
  created_at: string;
};

export type NotificationInsert = {
  user_uid: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  channels?: string[];
};

function hasServiceRole() {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

export async function listNotificationsForUser(userUid: string, limit = 50) {
  if (!hasServiceRole()) {
    return [];
  }

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_uid", userUid)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("listNotificationsForUser:", error);
    return [];
  }

  return (data || []) as NotificationRecord[];
}

export async function countUnreadNotifications(userUid: string) {
  if (!hasServiceRole()) {
    return 0;
  }

  const supabase = createSupabaseAdmin();
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_uid", userUid)
    .is("read_at", null);

  if (error) {
    console.error("countUnreadNotifications:", error);
    return 0;
  }

  return count || 0;
}

export async function createNotificationRecord(input: NotificationInsert) {
  const created = await createNotificationRecordsBulk([input]);
  return created.records[0] || null;
}

export async function createNotificationRecordsBulk(inputs: NotificationInsert[]) {
  if (!inputs.length) {
    return { created: 0, records: [] as NotificationRecord[], errors: [] as string[] };
  }

  if (!hasServiceRole()) {
    return {
      created: 0,
      records: [],
      errors: ["Brak SUPABASE_SERVICE_ROLE_KEY — powiadomienia nie zostały zapisane."],
    };
  }

  try {
    const rows = inputs.map((input) => ({
      user_uid: input.user_uid,
      type: input.type,
      title: input.title,
      body: input.body,
      link: input.link || null,
      channels: input.channels || [],
    }));

    const records = await supabaseRestInsertMany("notifications", rows);

    return {
      created: records.length,
      records: records as NotificationRecord[],
      errors: [] as string[],
    };
  } catch (error) {
    console.error("createNotificationRecordsBulk:", error);
    const message = error instanceof Error ? error.message : "Błąd zapisu powiadomień.";

    return {
      created: 0,
      records: [],
      errors: [message],
    };
  }
}

export async function markNotificationRead(id: string, userUid: string) {
  if (!hasServiceRole()) {
    return false;
  }

  const supabase = createSupabaseAdmin();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_uid", userUid);

  if (error) {
    console.error("markNotificationRead:", error);
    return false;
  }

  return true;
}

export async function markAllNotificationsRead(userUid: string) {
  if (!hasServiceRole()) {
    return false;
  }

  const supabase = createSupabaseAdmin();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_uid", userUid)
    .is("read_at", null);

  if (error) {
    console.error("markAllNotificationsRead:", error);
    return false;
  }

  return true;
}

export async function listMessageTemplates(): Promise<MessageTemplate[]> {
  if (!hasServiceRole()) {
    return DEFAULT_TEMPLATES;
  }

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("message_templates")
    .select("*")
    .order("name", { ascending: true });

  if (error || !data?.length) {
    return DEFAULT_TEMPLATES;
  }

  return data.map((item) => ({
    key: item.key as TemplateKey,
    name: item.name,
    subject: item.subject,
    body_text: item.body_text,
    body_html: item.body_html,
    sms_text: item.sms_text,
    push_title: item.push_title,
    push_body: item.push_body,
  }));
}

export async function getMessageTemplate(key: TemplateKey): Promise<MessageTemplate> {
  if (!hasServiceRole()) {
    return getDefaultTemplate(key);
  }

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("message_templates")
    .select("*")
    .eq("key", key)
    .maybeSingle();

  if (error || !data) {
    return getDefaultTemplate(key);
  }

  return {
    key: data.key as TemplateKey,
    name: data.name,
    subject: data.subject,
    body_text: data.body_text,
    body_html: data.body_html,
    sms_text: data.sms_text,
    push_title: data.push_title,
    push_body: data.push_body,
  };
}

export async function upsertMessageTemplate(template: MessageTemplate) {
  if (!hasServiceRole()) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY_MISSING");
  }

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("message_templates")
    .upsert(
      {
        key: template.key,
        name: template.name,
        subject: template.subject,
        body_text: template.body_text,
        body_html: template.body_html,
        sms_text: template.sms_text,
        push_title: template.push_title,
        push_body: template.push_body,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    )
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function seedDefaultTemplatesIfEmpty() {
  if (!hasServiceRole()) {
    return;
  }

  const supabase = createSupabaseAdmin();
  const { count, error } = await supabase
    .from("message_templates")
    .select("*", { count: "exact", head: true });

  if (error || (count ?? 0) > 0) {
    return;
  }

  await supabase.from("message_templates").insert(
    DEFAULT_TEMPLATES.map((template) => ({
      ...template,
      updated_at: new Date().toISOString(),
    }))
  );
}
