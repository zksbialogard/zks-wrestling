import { NextResponse } from "next/server";

import {
  listPublishedResultsForParent,
  listPublishedResultsGrouped,
} from "@/lib/competition-results-db";
import { getUserFromRequest } from "@/lib/verify-admin";

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
    }

    const results = await listPublishedResultsForParent(user.uid);
    const grouped = await listPublishedResultsGrouped();
    const eventTitles = Object.fromEntries(
      grouped.map((group) => [group.event_id, group.event_title])
    );

    return NextResponse.json({
      ok: true,
      results: results.map((item) => ({
        ...item,
        event_title: eventTitles[item.event_id] || "Zawody",
      })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Nie udało się pobrać wyników." }, { status: 500 });
  }
}
