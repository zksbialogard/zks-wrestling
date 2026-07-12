import { NextResponse } from "next/server";

import { runAppUpdateNotify } from "@/lib/app-update-notify";
import { getDeploymentVersion } from "@/lib/app-version";
import { isProductionDeployment } from "@/lib/site-config";
import { seedDefaultTemplatesIfEmpty } from "@/lib/notifications-db";

type AnnounceBody = {
  version?: string;
};

export async function POST(request: Request) {
  if (!isProductionDeployment()) {
    return NextResponse.json({ ok: true, skipped: true, reason: "Not production." });
  }

  let body: AnnounceBody = {};

  try {
    body = (await request.json()) as AnnounceBody;
  } catch {
    body = {};
  }

  const currentVersion = getDeploymentVersion();
  const requestedVersion = body.version?.trim();

  if (requestedVersion && requestedVersion !== currentVersion) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "Wersja nie zgadza się z bieżącym wdrożeniem.",
      version: currentVersion,
    });
  }

  try {
    await seedDefaultTemplatesIfEmpty();
    const result = await runAppUpdateNotify(currentVersion);

    return NextResponse.json({
      ok: true,
      skipped: result.skipped,
      reason: result.reason,
      version: result.version,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Nie udało się ogłosić aktualizacji aplikacji.",
      },
      { status: 500 }
    );
  }
}
