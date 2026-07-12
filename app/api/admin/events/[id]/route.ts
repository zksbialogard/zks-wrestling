import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { createSupabaseAdmin } from "@/lib/supabase";
import { eventPayloadToRow, normalizeEventPayload } from "@/lib/event-api-payload";
import { getStaffFromRequest } from "@/lib/verify-admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function validatePayload(body: unknown) {
  return normalizeEventPayload(body);
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const staff = await getStaffFromRequest(request);

    if (!staff) {
      return NextResponse.json({ error: "Brak uprawnień." }, { status: 401 });
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
      .update(eventPayloadToRow(payload))
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
    revalidatePath("/moderator/zawody");
    revalidatePath("/kalendarz-imprez");
    revalidatePath(`/zawody/${id}`);

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
    const staff = await getStaffFromRequest(request);

    if (!staff) {
      return NextResponse.json({ error: "Brak uprawnień." }, { status: 401 });
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
    revalidatePath("/moderator/zawody");
    revalidatePath("/kalendarz-imprez");

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Nie udało się usunąć zawodów.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
