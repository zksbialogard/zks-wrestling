import { NextResponse } from "next/server";

import {
  deleteFacebookResult,
  updateFacebookResult,
} from "@/lib/facebook-results-db";
import {
  revalidateResultsPaths,
  syncResultsNewsImmediately,
} from "@/lib/facebook-results-revalidate";
import type { FacebookResultInput } from "@/lib/facebook-results-types";
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
    const body = (await request.json()) as Partial<FacebookResultInput>;

    if (body.athlete_name !== undefined && !body.athlete_name.trim()) {
      return NextResponse.json({ error: "Imię zawodnika jest wymagane." }, { status: 400 });
    }

    if (body.event_title !== undefined && !body.event_title.trim()) {
      return NextResponse.json({ error: "Nazwa zawodów jest wymagana." }, { status: 400 });
    }

    const data = await updateFacebookResult(id, body);
    revalidateResultsPaths();

    const news =
      data.published !== false
        ? await syncResultsNewsImmediately(data.facebook_post_id, data.event_title, {
            newsPostId: data.news_post_id,
            eventDate: data.event_date,
            year: data.year,
          })
        : { action: "none" as const };

    return NextResponse.json({ ok: true, data, news });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Nie udało się zaktualizować wyniku.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const admin = await getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json({ error: "Brak uprawnień administratora." }, { status: 401 });
    }

    const { id } = await context.params;
    const deleted = await deleteFacebookResult(id);

    if (!deleted) {
      revalidateResultsPaths();
      return NextResponse.json({ ok: true, news: { action: "none" as const } });
    }

    const news = await syncResultsNewsImmediately(
      deleted.facebook_post_id,
      deleted.event_title,
      {
        newsPostId: deleted.news_post_id,
        eventDate: deleted.event_date,
        year: deleted.year,
      }
    );

    return NextResponse.json({ ok: true, news });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Nie udało się usunąć wyniku.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
