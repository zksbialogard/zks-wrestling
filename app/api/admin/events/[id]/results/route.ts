import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import {
  listResultsForEvent,
  publishEventResults,
  upsertEventResults,
} from "@/lib/competition-results-db";
import type { CompetitionResultInput } from "@/lib/competition-results-types";
import { getAdminFromRequest } from "@/lib/verify-admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const admin = await getAdminFromRequest(_request);

    if (!admin) {
      return NextResponse.json({ error: "Brak uprawnień administratora." }, { status: 401 });
    }

    const { id } = await context.params;
    const results = await listResultsForEvent(id);

    return NextResponse.json({ ok: true, results });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Nie udało się pobrać wyników." }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const admin = await getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json({ error: "Brak uprawnień administratora." }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const rows = (body.results || []) as CompetitionResultInput[];

    const results = await upsertEventResults(id, rows);

    return NextResponse.json({ ok: true, results });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Nie udało się zapisać wyników.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const admin = await getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json({ error: "Brak uprawnień administratora." }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();

    if (body.action !== "publish") {
      return NextResponse.json({ error: "Nieobsługiwana akcja." }, { status: 400 });
    }

    const results = await publishEventResults(id);

    revalidatePath("/zawody/wyniki-zawodow");
    revalidatePath("/panel-rodzica/wyniki");

    return NextResponse.json({
      ok: true,
      results,
      message: `Opublikowano ${results.length} wyników.`,
    });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Nie udało się opublikować wyników.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
