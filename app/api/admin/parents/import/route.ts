import { NextResponse } from "next/server";

import { upsertParentUsers, type ParentUser } from "@/lib/parent-users-db";
import { getAdminFromRequest } from "@/lib/verify-admin";

type ImportBody = {
  parents?: Array<{
    uid?: string;
    email?: string;
    telefon?: string;
    imie?: string;
    nazwisko?: string;
    rola?: string;
  }>;
};

export async function POST(request: Request) {
  try {
    const admin = await getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json({ error: "Brak uprawnień administratora." }, { status: 401 });
    }

    const body = (await request.json()) as ImportBody;
    const parents: ParentUser[] = (body.parents || [])
      .filter((item) => item.uid && item.rola === "rodzic")
      .map((item) => ({
        uid: item.uid as string,
        email: item.email,
        telefon: item.telefon,
        imie: item.imie,
        nazwisko: item.nazwisko,
        rola: "rodzic",
      }));

    if (!parents.length) {
      return NextResponse.json(
        { error: "Brak rodziców do synchronizacji (rola „rodzic”)." },
        { status: 400 }
      );
    }

    await upsertParentUsers(parents);

    return NextResponse.json({ ok: true, count: parents.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Nie udało się zsynchronizować rodziców." }, { status: 500 });
  }
}
