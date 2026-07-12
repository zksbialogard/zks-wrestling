import { NextResponse } from "next/server";

import { removeParentUserFromDb, upsertParentUser } from "@/lib/parent-users-db";
import { updateUserRole } from "@/lib/users-admin-server";
import { isUserRole } from "@/lib/user-roles";
import { getAdminFromRequest } from "@/lib/verify-admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await getAdminFromRequest(request);

  if (!admin) {
    return NextResponse.json({ error: "Brak uprawnień administratora." }, { status: 401 });
  }

  const { id } = await context.params;

  if (!id?.trim()) {
    return NextResponse.json({ error: "Brak identyfikatora użytkownika." }, { status: 400 });
  }

  let body: { rola?: string };

  try {
    body = (await request.json()) as { rola?: string };
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe dane żądania." }, { status: 400 });
  }

  const rola = body.rola?.trim();

  if (!rola || !isUserRole(rola)) {
    return NextResponse.json({ error: "Nieprawidłowa rola." }, { status: 400 });
  }

  if (rola === "admin" && admin.localId) {
    // allow promoting to admin
  }

  try {
    const updated = await updateUserRole(id, rola);

    if (updated.uid) {
      if (rola === "rodzic" || rola === "zawodnik") {
        await upsertParentUser({
          uid: updated.uid,
          email: updated.email,
          telefon: updated.telefon,
          imie: updated.imie,
          nazwisko: updated.nazwisko,
          rola,
        });
      } else {
        await removeParentUserFromDb(updated.uid);
      }
    }

    return NextResponse.json({ ok: true, rola });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Nie udało się zaktualizować roli użytkownika." },
      { status: 500 }
    );
  }
}
