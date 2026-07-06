import { NextResponse } from "next/server";

import {
  listAllRegistrations,
  listRegistrationsForEvent,
} from "@/lib/registrations-db";
import { getAdminFromRequest } from "@/lib/verify-admin";

export async function GET(request: Request) {
  try {
    const admin = await getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json({ error: "Brak uprawnień administratora." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    const registrations = eventId
      ? await listRegistrationsForEvent(eventId)
      : await listAllRegistrations();

    return NextResponse.json({ ok: true, registrations });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Nie udało się pobrać zgłoszeń." },
      { status: 500 }
    );
  }
}
