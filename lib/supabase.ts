import { createClient, SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://ubvgiglzteunqgxmezkt.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "sb_publishable_Z3bExNGFkGBwNoS8GNYA5Q_zktBkUw0";

function resolveSupabaseUrl(raw?: string) {
  const value = raw?.trim();

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

  console.warn(
    "Invalid NEXT_PUBLIC_SUPABASE_URL, using default project URL:",
    value
  );

  return DEFAULT_SUPABASE_URL;
}

function resolveSupabaseAnonKey(raw?: string) {
  const value = raw?.trim();
  return value || DEFAULT_SUPABASE_ANON_KEY;
}

const supabaseUrl = resolveSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseAnonKey = resolveSupabaseAnonKey(
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function createSupabaseAdmin(): SupabaseClient {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY_MISSING");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
