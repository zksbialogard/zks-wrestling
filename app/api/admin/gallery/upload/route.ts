import { NextResponse } from "next/server";

import {
  deleteGalleryImageFromSupabase,
  uploadGalleryImageToSupabase,
} from "@/lib/gallery-supabase-storage";
import { getStaffFromRequest } from "@/lib/verify-admin";

export async function POST(request: Request) {
  try {
    const staff = await getStaffFromRequest(request);

    if (!staff) {
      return NextResponse.json({ error: "Brak uprawnień." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Brak pliku zdjęcia." }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Plik jest zbyt duży po kompresji (max 5 MB)." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadGalleryImageToSupabase(
      buffer,
      file.name || "photo.jpg",
      file.type || "image/jpeg"
    );

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("Gallery upload:", error);
    const message =
      error instanceof Error ? error.message : "Nie udało się wysłać zdjęcia.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const staff = await getStaffFromRequest(request);

    if (!staff) {
      return NextResponse.json({ error: "Brak uprawnień." }, { status: 401 });
    }

    const body = await request.json();
    const { storagePath } = body;

    if (!storagePath) {
      return NextResponse.json({ error: "Brak ścieżki pliku." }, { status: 400 });
    }

    await deleteGalleryImageFromSupabase(storagePath);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Gallery storage delete:", error);
    const message =
      error instanceof Error ? error.message : "Nie udało się usunąć pliku zdjęcia.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
