import { NextResponse } from "next/server";

import {
  FACEBOOK_RESULTS_YEAR,
  syncFacebookResults,
} from "@/lib/facebook-results-sync";

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
    const result = await syncFacebookResults(FACEBOOK_RESULTS_YEAR);
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Nie udało się zsynchronizować wyników z Facebooka.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
}
