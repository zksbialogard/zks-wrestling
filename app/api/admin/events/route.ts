import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { createSupabaseAdmin } from "@/lib/supabase";
import { getAdminFromRequest } from "@/lib/verify-admin";

type EventPayload = {
  title: string;
  location: string;
  event_date: string;
  registration_deadline: string;
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

export async function POST(request: Request) {
  try {
    const admin = await getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json({ error: "Brak uprawnień administratora." }, { status: 401 });
    }

    const body = await request.json();
    const payload = validatePayload(body);

    if (!payload) {
      return NextResponse.json(
        { error: "Uzupełnij nazwę, miejsce i daty zawodów." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from("events")
      .insert([payload])
      .select("*")
      .single();

    if (error) {
      console.error("Supabase events insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath("/");
    revalidatePath("/zawody");
    revalidatePath("/zawody/najblizsze-zawody");
    revalidatePath("/admin/zawody");

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Nie udało się dodać zawodów.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
