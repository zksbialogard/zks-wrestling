import { NextResponse } from "next/server";

import {
  deleteFirebaseNews,
  updateFirebaseNews,
} from "@/lib/news-firebase";
import { createSupabaseAdmin } from "@/lib/supabase";
import { getAdminFromRequest } from "@/lib/verify-admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function hasSupabaseAdminKey() {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

function isFirebaseId(id: string) {
  return id.startsWith("fb_");
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const admin = await getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json({ error: "Brak uprawnień administratora." }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Tytuł i treść są wymagane." },
        { status: 400 }
      );
    }

    if (isFirebaseId(id)) {
      await updateFirebaseNews(id.replace(/^fb_/, ""), { title, content });
      return NextResponse.json({ ok: true, source: "firebase" });
    }

    if (!hasSupabaseAdminKey()) {
      return NextResponse.json(
        {
          error:
            "Edycja wpisów z Supabase wymaga SUPABASE_SERVICE_ROLE_KEY w .env.local.",
        },
        { status: 503 }
      );
    }

    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from("aktualnosci")
      .update({ title, content })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data, source: "supabase" });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Nie udało się zaktualizować aktualności.";

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

    if (isFirebaseId(id)) {
      await deleteFirebaseNews(id.replace(/^fb_/, ""));
      return NextResponse.json({ ok: true, source: "firebase" });
    }

    if (!hasSupabaseAdminKey()) {
      return NextResponse.json(
        {
          error:
            "Usuwanie wpisów z Supabase wymaga SUPABASE_SERVICE_ROLE_KEY w .env.local.",
        },
        { status: 503 }
      );
    }

    const supabase = createSupabaseAdmin();
    const { error } = await supabase.from("aktualnosci").delete().eq("id", id);

    if (error) {
      console.error("Supabase delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, source: "supabase" });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Nie udało się usunąć aktualności.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
