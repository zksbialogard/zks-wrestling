import { NextResponse } from "next/server";

import { runAppUpdateNotify } from "@/lib/app-update-notify";
import { seedDefaultTemplatesIfEmpty } from "@/lib/notifications-db";
import { sanitizeNotifyResult } from "@/lib/notify-result-utils";

function isAuthorized(request: Request): boolean {
  const secret =
    process.env.DEPLOY_WEBHOOK_SECRET?.trim() || process.env.CRON_SECRET?.trim();

  if (!secret) {
    return false;
  }

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${secret}`;
}

type VercelDeploymentPayload = {
  type?: string;
  payload?: {
    deployment?: {
      id?: string;
      meta?: {
        githubCommitSha?: string;
      };
      target?: string | null;
    };
  };
};

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Brak autoryzacji webhook." }, { status: 401 });
  }

  let body: VercelDeploymentPayload = {};

  try {
    body = (await request.json()) as VercelDeploymentPayload;
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe dane webhook." }, { status: 400 });
  }

  if (body.type && body.type !== "deployment.succeeded") {
    return NextResponse.json({ ok: true, skipped: true, reason: "Ignored event type." });
  }

  const deployment = body.payload?.deployment;
  const target = deployment?.target;

  if (target && target !== "production") {
    return NextResponse.json({ ok: true, skipped: true, reason: "Not production." });
  }

  const version =
    deployment?.meta?.githubCommitSha?.trim() ||
    deployment?.id?.trim() ||
    undefined;

  try {
    await seedDefaultTemplatesIfEmpty();
    const result = await runAppUpdateNotify(version);

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
            : "Nie udało się wysłać powiadomień po wdrożeniu.",
      },
      { status: 500 }
    );
  }
}
