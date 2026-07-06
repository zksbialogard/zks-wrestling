import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { addGalleryItem, deleteGalleryItem } from "@/lib/gallery-server";
import { seedDefaultTemplatesIfEmpty } from "@/lib/notifications-db";
import { notifyClubMembers } from "@/lib/notify-service";
import { sanitizeNotifyResult } from "@/lib/notify-result-utils";
import { getAdminFromRequest } from "@/lib/verify-admin";

export async function POST(request: Request) {
  try {
    const admin = await getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json({ error: "Brak uprawnień administratora." }, { status: 401 });
    }

    const body = await request.json();
    const { title, url, storagePath, notify = true } = body;

    if (!title || !url) {
      return NextResponse.json(
        { error: "Tytuł i adres URL zdjęcia są wymagane." },
        { status: 400 }
      );
    }

    const id = await addGalleryItem({ title, url, storagePath });

    revalidatePath("/galeria");

    let notifyResult = null;

    if (notify) {
      try {
        await seedDefaultTemplatesIfEmpty();
        notifyResult = await notifyClubMembers({
          templateKey: "gallery_published",
          variables: { title },
          channels: {
            email: false,
            sms: false,
            inApp: true,
            push: true,
          },
          type: "gallery",
          link: "/galeria",
        });
      } catch (notifyError) {
        console.error("Notify after gallery upload:", notifyError);
      }
    }

    return NextResponse.json({
      ok: true,
      id,
      notifyResult: notifyResult ? sanitizeNotifyResult(notifyResult) : null,
    });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Nie udało się dodać zdjęcia do galerii.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = await getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json({ error: "Brak uprawnień administratora." }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Brak identyfikatora zdjęcia." }, { status: 400 });
    }

    await deleteGalleryItem(id);
    revalidatePath("/galeria");

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Nie udało się usunąć zdjęcia z galerii.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
