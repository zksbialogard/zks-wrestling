import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { deleteGalleryItem } from "@/lib/gallery-server";
import { getStaffFromRequest } from "@/lib/verify-admin";

/** @deprecated Usuwanie odbywa się w Firestore po stronie klienta (zalogowany admin). */
export async function DELETE(request: Request) {
  try {
    const staff = await getStaffFromRequest(request);

    if (!staff) {
      return NextResponse.json({ error: "Brak uprawnień." }, { status: 401 });
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
