import { NextResponse } from "next/server";

import { upsertParentUser } from "@/lib/parent-users-db";
import { getUserFromRequest } from "@/lib/verify-admin";

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
    }

    const profile = user.profile as {
      imie?: string;
      nazwisko?: string;
      telefon?: string;
      rola?: string;
    };

    const saved = await upsertParentUser({
      uid: user.uid,
      email: user.email || "",
      telefon: profile.telefon,
      imie: profile.imie,
      nazwisko: profile.nazwisko,
      rola: profile.rola || "rodzic",
    });

    if (!saved) {
      return NextResponse.json(
        { error: "Nie udało się zsynchronizować profilu rodzica." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Błąd synchronizacji profilu." }, { status: 500 });
  }
}
