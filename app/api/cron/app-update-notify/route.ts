import { NextResponse } from "next/server";

import { runAppUpdateNotify } from "@/lib/app-update-notify";
import { getDeploymentVersion } from "@/lib/app-version";
import { sanitizeNotifyResult } from "@/lib/notify-result-utils";
import { seedDefaultTemplatesIfEmpty } from "@/lib/notifications-db";

function isAuthorized(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET?.trim();

  if (!cronSecret) {
    return false;
  }

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Brak autoryzacji cron." }, { status: 401 });
  }

  try {
    await seedDefaultTemplatesIfEmpty();

    const result = await runAppUpdateNotify(getDeploymentVersion());

    return NextResponse.json({
      ok: true,
      skipped: result.skipped,
      reason: result.reason,
      version: result.version,
      result: result.notify ? sanitizeNotifyResult(result.notify) : undefined,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Nie udało się wysłać powiadomień o aktualizacji.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
}
