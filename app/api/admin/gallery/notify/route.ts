import { NextResponse, after } from "next/server";
import { revalidatePath } from "next/cache";

import { seedDefaultTemplatesIfEmpty } from "@/lib/notifications-db";
import { notifyClubMembers } from "@/lib/notify-service";
import { getStaffFromRequest } from "@/lib/verify-admin";

async function notifyGalleryPublished(title: string) {
  await seedDefaultTemplatesIfEmpty();
  await notifyClubMembers({
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
}

export async function POST(request: Request) {
  try {
    const staff = await getStaffFromRequest(request);

    if (!staff) {
      return NextResponse.json({ error: "Brak uprawnień." }, { status: 401 });
    }

    const body = await request.json();
    const { title } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: "Brak tytułu zdjęcia." }, { status: 400 });
    }

    revalidatePath("/galeria");

    after(
      notifyGalleryPublished(String(title).trim()).catch((notifyError) => {
        console.error("Notify after gallery upload:", notifyError);
      })
    );

    return NextResponse.json({ ok: true, notifyScheduled: true });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Nie udało się zaplanować powiadomień.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
