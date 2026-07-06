import { NextResponse } from "next/server";

import type { RegistrationStatus } from "@/lib/registration-types";
import {
  changeRegistrationStatus,
  removeRegistration,
} from "@/lib/registrations-service";
import { getAdminFromRequest } from "@/lib/verify-admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const admin = await getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json({ error: "Brak uprawnień administratora." }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const status = body.status as RegistrationStatus;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Niepoprawny status." }, { status: 400 });
    }

    const registration = await changeRegistrationStatus(id, status);

    return NextResponse.json({ ok: true, registration, notifyResult: registration.notifyResult });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Nie udało się zaktualizować zgłoszenia.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const admin = await getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json({ error: "Brak uprawnień administratora." }, { status: 401 });
    }

    const { id } = await context.params;
    await removeRegistration(id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Nie udało się usunąć zgłoszenia.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
