import { createClient, SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://ubvgiglzteunqgxmezkt.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "sb_publishable_Z3bExNGFkGBwNoS8GNYA5Q_zktBkUw0";

function cleanEnvValue(raw?: string) {
  return raw?.trim().replace(/^["']|["']$/g, "") || "";
}

export function resolveSupabaseUrl(raw?: string) {
  const value = cleanEnvValue(raw);

  if (!value) {
    return DEFAULT_SUPABASE_URL;
  }

  const candidates = value.startsWith("http") ? [value] : [`https://${value}`];

  for (const candidate of candidates) {
    try {
      const url = new URL(candidate);

      if (url.protocol === "http:" || url.protocol === "https:") {
        return url.toString().replace(/\/$/, "");
      }
    } catch {
      continue;
    }
  }

  return DEFAULT_SUPABASE_URL;
}

function resolveSupabaseAnonKey(raw?: string) {
  const value = cleanEnvValue(raw);
  return value || DEFAULT_SUPABASE_ANON_KEY;
}

let anonClient: SupabaseClient | null = null;

function getAnonClient() {
  if (!anonClient) {
    anonClient = createClient(
      resolveSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL),
      resolveSupabaseAnonKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    );
  }

  return anonClient;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, property, receiver) {
    return Reflect.get(getAnonClient(), property, receiver);
  },
});

export function createSupabaseAdmin(): SupabaseClient {
  const serviceRoleKey = cleanEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY_MISSING");
  }

  return createClient(
    resolveSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL),
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
