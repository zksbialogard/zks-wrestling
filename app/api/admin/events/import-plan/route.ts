import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getPlan2026Events, importPlan2026 } from "@/lib/events-plan-import";
import { getAdminFromRequest } from "@/lib/verify-admin";

export async function GET(request: Request) {
  const admin = await getAdminFromRequest(request);

  if (!admin) {
    return NextResponse.json({ error: "Brak uprawnień administratora." }, { status: 401 });
  }

  const events = getPlan2026Events();

  return NextResponse.json({
    ok: true,
    season: 2026,
    total: events.length,
    preview: events.slice(0, 8),
  });
}

export async function POST(request: Request) {
  const admin = await getAdminFromRequest(request);

  if (!admin) {
    return NextResponse.json({ error: "Brak uprawnień administratora." }, { status: 401 });
  }

  let replaceSeason = false;

  try {
    const body = (await request.json()) as { replaceSeason?: boolean };
    replaceSeason = Boolean(body.replaceSeason);
  } catch {
    replaceSeason = false;
  }

  try {
    const result = await importPlan2026(replaceSeason);

    revalidatePath("/");
    revalidatePath("/zawody");
    revalidatePath("/kalendarz-imprez");
    revalidatePath("/admin/zawody");
    revalidatePath("/moderator/zawody");

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Nie udało się zaimportować planu sezonu 2026.",
      },
      { status: 500 }
    );
  }
}
