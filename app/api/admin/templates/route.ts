import { NextResponse } from "next/server";

import {
  listMessageTemplates,
  seedDefaultTemplatesIfEmpty,
  upsertMessageTemplate,
} from "@/lib/notifications-db";
import { type MessageTemplate } from "@/lib/message-templates";
import { getAdminFromRequest } from "@/lib/verify-admin";

export async function GET(request: Request) {
  try {
    const admin = await getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json({ error: "Brak uprawnień administratora." }, { status: 401 });
    }

    await seedDefaultTemplatesIfEmpty();
    const templates = await listMessageTemplates();

    return NextResponse.json({ ok: true, templates });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Nie udało się pobrać szablonów." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json({ error: "Brak uprawnień administratora." }, { status: 401 });
    }

    const body = (await request.json()) as MessageTemplate;

    if (!body.key || !body.name) {
      return NextResponse.json({ error: "Niepełny szablon." }, { status: 400 });
    }

    const saved = await upsertMessageTemplate(body);

    return NextResponse.json({ ok: true, template: saved });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Nie udało się zapisać szablonu.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
