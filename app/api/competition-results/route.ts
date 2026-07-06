import { NextResponse } from "next/server";

import { listPublishedResultsGrouped } from "@/lib/competition-results-db";

export async function GET() {
  try {
    const results = await listPublishedResultsGrouped();
    return NextResponse.json({ ok: true, results });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: true, results: [] });
  }
}
