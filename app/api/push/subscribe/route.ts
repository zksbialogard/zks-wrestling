import { NextResponse } from "next/server";

import { savePushPreference } from "@/lib/notify-service";
import { getUserFromRequest } from "@/lib/verify-admin";

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
    }

    const body = await request.json();
    const enabled = Boolean(body.enabled);

    await savePushPreference(user.uid, enabled);

    return NextResponse.json({ ok: true, enabled });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Nie udało się zapisać preferencji powiadomień." },
      { status: 500 }
    );
  }
}
