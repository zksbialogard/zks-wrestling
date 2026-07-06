import { NextResponse } from "next/server";

import {
  listRegistrationsForEvent,
  listRegistrationsForParent,
} from "@/lib/registrations-db";
import { submitRegistration } from "@/lib/registrations-service";
import { getUserFromRequest } from "@/lib/verify-admin";

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    const registrations = eventId
      ? (await listRegistrationsForEvent(eventId)).filter(
          (item) => item.parent_uid === user.uid
        )
      : await listRegistrationsForParent(user.uid);

    return NextResponse.json({ ok: true, registrations });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Nie udało się pobrać zgłoszeń." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
    }

    const body = await request.json();

    if (!body.eventId || !body.childId) {
      return NextResponse.json(
        { error: "Brak eventId lub childId." },
        { status: 400 }
      );
    }

    const registration = await submitRegistration({
      eventId: String(body.eventId),
      childId: String(body.childId),
      parentUid: user.uid,
    });

    return NextResponse.json({ ok: true, registration });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Nie udało się zgłosić dziecka.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
