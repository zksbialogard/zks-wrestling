import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { notifyParents } from "@/lib/notify-service";
import { seedDefaultTemplatesIfEmpty } from "@/lib/notifications-db";
import { supabaseRestInsert, testSupabaseConnection } from "@/lib/supabase-rest";
import { getAdminFromRequest } from "@/lib/verify-admin";

type EventPayload = {
  title: string;
  location: string;
  event_date: string;
  registration_deadline: string;
};

type NotifyPayload = {
  email?: boolean;
  sms?: boolean;
  inApp?: boolean;
  push?: boolean;
};

function validatePayload(body: unknown): EventPayload | null {
  if (!body || typeof body !== "object") return null;

  const { title, location, event_date, registration_deadline } = body as EventPayload;

  if (!title?.trim() || !location?.trim() || !event_date || !registration_deadline) {
    return null;
  }

  return {
    title: title.trim(),
    location: location.trim(),
    event_date,
    registration_deadline,
  };
}

function hasSupabaseAdminKey() {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

function mapServerError(error: unknown, context: string) {
  const message = error instanceof Error ? error.message : "Nieznany błąd";

  if (message.includes("fetch failed") || message.includes("ECONNREFUSED")) {
    return `${context}: brak połączenia z Supabase. Sprawdź NEXT_PUBLIC_SUPABASE_URL=https://ubvgiglzteunqgxmezkt.supabase.co oraz SUPABASE_SERVICE_ROLE_KEY (secret service_role) na Vercel, potem Redeploy.`;
  }

  if (
    message.includes("SUPABASE_SERVICE_ROLE_KEY_MISSING") ||
    message.includes("Brak SUPABASE_SERVICE_ROLE_KEY")
  ) {
    return "Brak SUPABASE_SERVICE_ROLE_KEY na Vercel. Dodaj secret service_role w Environment Variables i zrób Redeploy.";
  }

  if (message.includes("Invalid API key") || message.includes("Niepoprawny SUPABASE_SERVICE_ROLE_KEY")) {
    return "Niepoprawny SUPABASE_SERVICE_ROLE_KEY na Vercel. Skopiuj ponownie secret service_role z Supabase (nie publishable/anon).";
  }

  if (message.includes("Niepoprawny NEXT_PUBLIC_SUPABASE_URL")) {
    return message;
  }

  return `${context}: ${message}`;
}

export async function GET(request: Request) {
  const admin = await getAdminFromRequest(request);

  if (!admin) {
    return NextResponse.json({ error: "Brak uprawnień administratora." }, { status: 401 });
  }

  if (!hasSupabaseAdminKey()) {
    return NextResponse.json(
      { ok: false, error: "Brak SUPABASE_SERVICE_ROLE_KEY na Vercel." },
      { status: 500 }
    );
  }

  try {
    const result = await testSupabaseConnection();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: mapServerError(error, "Test Supabase") },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json({ error: "Brak uprawnień administratora." }, { status: 401 });
    }

    const body = await request.json();
    const payload = validatePayload(body);
    const notify = (body.notify || {}) as NotifyPayload;

    if (!payload) {
      return NextResponse.json(
        { error: "Uzupełnij nazwę, miejsce i daty zawodów." },
        { status: 400 }
      );
    }

    if (!hasSupabaseAdminKey()) {
      return NextResponse.json(
        {
          error:
            "Brak SUPABASE_SERVICE_ROLE_KEY na Vercel. Dodaj klucz service_role w Environment Variables i zrób Redeploy.",
        },
        { status: 500 }
      );
    }

    let data;

    try {
      data = await supabaseRestInsert("events", payload);
    } catch (insertError) {
      console.error("Supabase events insert:", insertError);
      return NextResponse.json(
        { error: mapServerError(insertError, "Nie udało się dodać zawodów") },
        { status: 500 }
      );
    }

    revalidatePath("/");
    revalidatePath("/zawody");
    revalidatePath("/zawody/najblizsze-zawody");
    revalidatePath("/admin/zawody");

    let notifyResult = null;

    if (notify.email || notify.sms || notify.inApp || notify.push) {
      try {
        await seedDefaultTemplatesIfEmpty();
        notifyResult = await notifyParents({
          templateKey: "event_new",
          variables: {
            title: payload.title,
            location: payload.location,
            eventDate: new Date(payload.event_date).toLocaleDateString("pl-PL"),
            registrationDeadline: new Date(
              payload.registration_deadline
            ).toLocaleDateString("pl-PL"),
            link: `/zawody/${data.id}`,
          },
          channels: {
            email: Boolean(notify.email),
            sms: Boolean(notify.sms),
            inApp: notify.inApp !== false,
            push: Boolean(notify.push),
          },
          type: "event",
          link: `/zawody/${data.id}`,
        });
      } catch (notifyError) {
        console.error("Notify after event create:", notifyError);
        notifyResult = {
          totalParents: 0,
          emailsSent: 0,
          smsSent: 0,
          inAppSent: 0,
          pushSent: 0,
          errors: [mapServerError(notifyError, "Powiadomienia")],
        };
      }
    }

    return NextResponse.json({ ok: true, data, notifyResult });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: mapServerError(error, "Nie udało się dodać zawodów") },
      { status: 500 }
    );
  }
}
