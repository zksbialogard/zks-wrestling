import { NextResponse } from "next/server";

import { broadcastSmsToAllParents } from "@/lib/sms-broadcast";
import { getAdminFromRequest } from "@/lib/verify-admin";

export async function POST(request: Request) {
  try {
    const admin = await getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json({ error: "Brak uprawnień administratora." }, { status: 401 });
    }

    const body = await request.json();
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!message) {
      return NextResponse.json({ error: "Podaj treść SMS." }, { status: 400 });
    }

    if (body.confirmed !== true) {
      return NextResponse.json(
        { error: "Potwierdź wysyłkę masową w aplikacji." },
        { status: 400 }
      );
    }

    const result = await broadcastSmsToAllParents(message);

    if (result.errors.length && result.smsSent === 0) {
      return NextResponse.json(
        {
          error: result.errors[0] || "Nie udało się wysłać SMS.",
          result,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: `Wysłano ${result.smsSent} SMS (${result.skippedNoPhone} rodziców bez numeru).`,
      result,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Błąd wysyłki masowej SMS." }, { status: 500 });
  }
}
