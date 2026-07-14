import { NextResponse } from "next/server";

import { deleteFacebookResults } from "@/lib/facebook-results-db";
import {
  revalidateResultsPaths,
  syncResultsNewsImmediately,
} from "@/lib/facebook-results-revalidate";
import { getAdminFromRequest } from "@/lib/verify-admin";

export async function POST(request: Request) {
  try {
    const admin = await getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json({ error: "Brak uprawnień administratora." }, { status: 401 });
    }

    const body = (await request.json()) as { ids?: string[] };
    const ids = Array.isArray(body.ids) ? body.ids.filter(Boolean) : [];

    if (!ids.length) {
      return NextResponse.json({ error: "Wybierz co najmniej jeden wynik." }, { status: 400 });
    }

    const { deletedCount, eventGroups } = await deleteFacebookResults(ids);

    if (!deletedCount) {
      revalidateResultsPaths();
      return NextResponse.json({
        ok: true,
        deletedCount: 0,
        news: { action: "none" as const },
      });
    }

    let newsAction: "none" | "updated" | "deleted" = "none";

    for (const group of eventGroups) {
      const news = await syncResultsNewsImmediately(group.facebookPostId, group.eventTitle, {
        newsPostId: group.newsPostId,
        eventDate: group.eventDate,
        year: group.year,
      });

      if (news.action === "deleted") {
        newsAction = "deleted";
      } else if (news.action === "updated" && newsAction !== "deleted") {
        newsAction = "updated";
      }
    }

    return NextResponse.json({ ok: true, deletedCount, news: { action: newsAction } });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Nie udało się usunąć wyników.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
