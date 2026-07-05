import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { createSupabaseAdmin } from "@/lib/supabase";
import { getAdminFromRequest } from "@/lib/verify-admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const admin = await getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json({ error: "Brak uprawnień administratora." }, { status: 401 });
    }

    const { id } = await context.params;
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
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("Supabase events update error:", error);
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
      error instanceof Error ? error.message : "Nie udało się zaktualizować zawodów.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const admin = await getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json({ error: "Brak uprawnień administratora." }, { status: 401 });
    }

    const { id } = await context.params;
    const supabase = createSupabaseAdmin();
    const { error } = await supabase.from("events").delete().eq("id", id);

    if (error) {
      console.error("Supabase events delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath("/");
    revalidatePath("/zawody");
    revalidatePath("/zawody/najblizsze-zawody");
    revalidatePath("/admin/zawody");

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Nie udało się usunąć zawodów.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
