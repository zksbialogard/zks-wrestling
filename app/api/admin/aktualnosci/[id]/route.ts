import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import {
  deleteFirebaseNews,
  updateFirebaseNews,
} from "@/lib/news-firebase";
import { normalizeNewsImages, deleteNewsImagesFromStorage } from "@/lib/news-images";
import { createSupabaseAdmin } from "@/lib/supabase";
import { getStaffFromRequest } from "@/lib/verify-admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function hasSupabaseAdminKey() {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

function isMissingImagesColumnError(message: string) {
  return /images|schema cache|column.*does not exist|could not find the/i.test(message);
}

function isFirebaseId(id: string) {
  return id.startsWith("fb_");
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const staff = await getStaffFromRequest(request);

    if (!staff) {
      return NextResponse.json({ error: "Brak uprawnień." }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { title, content, images } = body;
    const normalizedImages =
      images !== undefined ? normalizeNewsImages(images) : undefined;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Tytuł i treść są wymagane." },
        { status: 400 }
      );
    }

    if (isFirebaseId(id)) {
      await updateFirebaseNews(id.replace(/^fb_/, ""), {
        title,
        content,
        images: normalizedImages,
      });
      revalidatePath("/aktualnosci");
      revalidatePath("/");
      return NextResponse.json({ ok: true, source: "firebase" });
    }

    if (!hasSupabaseAdminKey()) {
      return NextResponse.json(
        {
          error:
            "Edycja wpisów z Supabase wymaga SUPABASE_SERVICE_ROLE_KEY (Vercel → Environment Variables).",
        },
        { status: 503 }
      );
    }

    const supabase = createSupabaseAdmin();

    if (normalizedImages !== undefined) {
      const { data: existingRow, error: fetchError } = await supabase
        .from("aktualnosci")
        .select("images")
        .eq("id", id)
        .maybeSingle();

      if (!fetchError && existingRow) {
        const previousImages = normalizeNewsImages(existingRow.images);
        const nextPaths = new Set(
          normalizedImages
            .map((image) => image.storagePath)
            .filter((path): path is string => Boolean(path))
        );
        const removedImages = previousImages.filter(
          (image) => image.storagePath && !nextPaths.has(image.storagePath)
        );

        if (removedImages.length) {
          await deleteNewsImagesFromStorage(removedImages);
        }
      }
    }

    const updatePayload: Record<string, unknown> = {
      title,
      content,
    };

    if (normalizedImages !== undefined) {
      updatePayload.images = normalizedImages;
    }

    let { data, error } = await supabase
      .from("aktualnosci")
      .update(updatePayload)
      .eq("id", id)
      .select("*")
      .single();

    if (error && isMissingImagesColumnError(error.message)) {
      ({ data, error } = await supabase
        .from("aktualnosci")
        .update({ title, content })
        .eq("id", id)
        .select("*")
        .single());
    }

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath("/aktualnosci");
    revalidatePath("/");
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
    const staff = await getStaffFromRequest(request);

    if (!staff) {
      return NextResponse.json({ error: "Brak uprawnień." }, { status: 401 });
    }

    const { id } = await context.params;

    if (isFirebaseId(id)) {
      await deleteFirebaseNews(id.replace(/^fb_/, ""));
      revalidatePath("/aktualnosci");
      revalidatePath("/");
      return NextResponse.json({ ok: true, source: "firebase" });
    }

    if (!hasSupabaseAdminKey()) {
      return NextResponse.json(
        {
          error:
            "Usuwanie wpisów z Supabase wymaga SUPABASE_SERVICE_ROLE_KEY (Vercel → Environment Variables).",
        },
        { status: 503 }
      );
    }

    const supabase = createSupabaseAdmin();

    const { data: existingRow, error: fetchError } = await supabase
      .from("aktualnosci")
      .select("images")
      .eq("id", id)
      .maybeSingle();

    if (fetchError && !isMissingImagesColumnError(fetchError.message)) {
      console.error("Supabase fetch before delete error:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const { error } = await supabase.from("aktualnosci").delete().eq("id", id);

    if (error) {
      console.error("Supabase delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (existingRow) {
      await deleteNewsImagesFromStorage(normalizeNewsImages(existingRow.images));
    }

    revalidatePath("/aktualnosci");
    revalidatePath("/");
    return NextResponse.json({ ok: true, source: "supabase" });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Nie udało się usunąć aktualności.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
