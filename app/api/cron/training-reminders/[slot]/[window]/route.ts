import { NextResponse } from "next/server";

import {
  isTrainingReminderSlot,
  runTrainingSlotReminders,
} from "@/lib/cron-reminders";

function isAuthorized(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET?.trim();

  if (!cronSecret) {
    return false;
  }

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

type RouteParams = {
  params: Promise<{ slot: string; window: string }>;
};

/** Drugi wyzwalacz UTC (CET/CEST) — ten sam slot, osobna ścieżka dla limitu Hobby Vercel. */
export async function GET(request: Request, { params }: RouteParams) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Brak autoryzacji cron." }, { status: 401 });
  }

  const { slot } = await params;

  if (!isTrainingReminderSlot(slot)) {
    return NextResponse.json(
      { error: "Nieprawidłowy slot. Dozwolone: 11 lub 14." },
      { status: 400 }
    );
  }

  try {
    const result = await runTrainingSlotReminders(slot);

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Nie udało się uruchomić przypomnień o treningu.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, context: RouteParams) {
  return GET(request, context);
}
