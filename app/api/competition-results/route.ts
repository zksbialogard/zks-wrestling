import { NextResponse } from "next/server";

import {
  FACEBOOK_RESULTS_YEAR,
  listPublicFacebookResults,
} from "@/lib/facebook-results-sync";

export async function GET() {
  try {
    const results = await listPublicFacebookResults(FACEBOOK_RESULTS_YEAR);
    return NextResponse.json({ ok: true, year: FACEBOOK_RESULTS_YEAR, results });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      ok: true,
      year: FACEBOOK_RESULTS_YEAR,
      results: [],
    });
  }
}
