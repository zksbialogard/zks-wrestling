import { NextResponse } from "next/server";

import { countRegistrationsByEvent } from "@/lib/registrations-db";
import { getAdminFromRequest } from "@/lib/verify-admin";

export async function GET(request: Request) {
  try {
    const admin = await getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json({ error: "Brak uprawnień administratora." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const ids = searchParams.get("ids")?.split(",").filter(Boolean) || [];

    const counts = await countRegistrationsByEvent(ids);

    return NextResponse.json({ ok: true, counts });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Nie udało się pobrać liczników zgłoszeń." },
      { status: 500 }
    );
  }
}
