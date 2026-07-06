import { cleanEnvValue, resolveSupabaseUrl } from "./supabase";

function getServiceRoleKey() {
  const key = cleanEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY_MISSING");
  }

  return key;
}

function parseSupabaseError(body: string, status: number) {
  try {
    const parsed = JSON.parse(body) as {
      message?: string;
      hint?: string;
      code?: string;
    };

    if (parsed.message?.includes("Invalid API key")) {
      return "Niepoprawny SUPABASE_SERVICE_ROLE_KEY na Vercel (skopiuj secret service_role, nie publishable).";
    }

    if (parsed.message?.includes("Invalid path specified")) {
      return "Niepoprawny NEXT_PUBLIC_SUPABASE_URL na Vercel. Ustaw dokładnie: https://ubvgiglzteunqgxmezkt.supabase.co (bez /rest/v1 na końcu).";
    }

    return parsed.message || parsed.hint || `Supabase HTTP ${status}`;
  } catch {
    return body || `Supabase HTTP ${status}`;
  }
}

export async function supabaseRestInsert<T extends Record<string, unknown>>(
  table: string,
  row: T
): Promise<T & { id: string }> {
  const url = resolveSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = getServiceRoleKey();

  if (!url.includes(".supabase.co")) {
    throw new Error(
      `Niepoprawny NEXT_PUBLIC_SUPABASE_URL: "${url}". Ustaw https://ubvgiglzteunqgxmezkt.supabase.co na Vercel.`
    );
  }

  let response: Response;

  try {
    response = await fetch(`${url}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(row),
      cache: "no-store",
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "fetch failed";
    throw new Error(
      `Brak połączenia z Supabase (${url}). Sprawdź NEXT_PUBLIC_SUPABASE_URL i SUPABASE_SERVICE_ROLE_KEY na Vercel, potem Redeploy. (${detail})`
    );
  }

  const body = await response.text();

  if (!response.ok) {
    throw new Error(parseSupabaseError(body, response.status));
  }

  const rows = JSON.parse(body) as Array<T & { id: string }>;

  if (!rows[0]?.id) {
    throw new Error("Supabase nie zwrócił zapisanego rekordu.");
  }

  return rows[0];
}

export async function supabaseRestInsertMany<T extends Record<string, unknown>>(
  table: string,
  rows: T[]
): Promise<T[]> {
  if (!rows.length) {
    return [];
  }

  const url = resolveSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = getServiceRoleKey();

  const response = await fetch(`${url}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(rows),
    cache: "no-store",
  });

  const body = await response.text();

  if (!response.ok) {
    throw new Error(parseSupabaseError(body, response.status));
  }

  return JSON.parse(body) as T[];
}

export async function supabaseRestPatch(
  table: string,
  filters: Record<string, string>,
  updates: Record<string, unknown>
) {
  const url = resolveSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = getServiceRoleKey();

  const query = Object.entries(filters)
    .map(([column, value]) => `${column}=${encodeURIComponent(value)}`)
    .join("&");

  const response = await fetch(`${url}/rest/v1/${table}?${query}`, {
    method: "PATCH",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(updates),
    cache: "no-store",
  });

  const body = await response.text();

  if (!response.ok) {
    throw new Error(parseSupabaseError(body, response.status));
  }

  return true;
}

export async function supabaseRestSelect<T>(
  table: string,
  filters: Record<string, string> = {},
  options: { order?: string; limit?: number } = {}
): Promise<T[]> {
  const url = resolveSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = getServiceRoleKey();

  const queryParts = Object.entries(filters).map(
    ([column, value]) => `${column}=${encodeURIComponent(value)}`
  );

  if (options.order) {
    queryParts.push(`order=${encodeURIComponent(options.order)}`);
  }

  if (options.limit) {
    queryParts.push(`limit=${options.limit}`);
  }

  const query = queryParts.length ? `?${queryParts.join("&")}` : "";

  const response = await fetch(`${url}/rest/v1/${table}${query}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    cache: "no-store",
  });

  const body = await response.text();

  if (!response.ok) {
    throw new Error(parseSupabaseError(body, response.status));
  }

  return JSON.parse(body) as T[];
}

export async function supabaseRestDelete(
  table: string,
  filters: Record<string, string>
) {
  const url = resolveSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = getServiceRoleKey();

  const query = Object.entries(filters)
    .map(([column, value]) => `${column}=${encodeURIComponent(value)}`)
    .join("&");

  const response = await fetch(`${url}/rest/v1/${table}?${query}`, {
    method: "DELETE",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    cache: "no-store",
  });

  const body = await response.text();

  if (!response.ok) {
    throw new Error(parseSupabaseError(body, response.status));
  }

  return true;
}

export async function testSupabaseConnection() {
  const url = resolveSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = getServiceRoleKey();

  const response = await fetch(`${url}/rest/v1/events?select=id&limit=1`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    cache: "no-store",
  });

  const body = await response.text();

  return {
    ok: response.ok,
    status: response.status,
    url,
    body: body.slice(0, 200),
  };
}
