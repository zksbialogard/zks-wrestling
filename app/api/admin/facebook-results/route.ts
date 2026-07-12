import { NextResponse, after } from "next/server";
import { revalidatePath } from "next/cache";

import {
  createFacebookResult,
  getFacebookEventGroup,
  listFacebookResultsForAdmin,
} from "@/lib/facebook-results-db";
import { syncResultsNewsForEvent } from "@/lib/facebook-results-news";
import type { FacebookResultInput } from "@/lib/facebook-results-types";
import { getAdminFromRequest } from "@/lib/verify-admin";

function parseYear(value: string | null) {
  const year = Number(value);
  return Number.isFinite(year) && year > 2000 ? year : new Date().getFullYear();
}

function revalidateResultsPaths() {
  revalidatePath("/zawody/wyniki-zawodow");
  revalidatePath("/panel-rodzica/wyniki");
  revalidatePath("/aktualnosci");
  revalidatePath("/");
}

async function publishResultsNews(facebookPostId: string, eventTitle: string) {
  const event = await getFacebookEventGroup(facebookPostId, eventTitle);

  if (!event) {
    return;
  }

  await syncResultsNewsForEvent(event);
  revalidatePath("/aktualnosci");
  revalidatePath("/");
}

export async function GET(request: Request) {
  try {
    const admin = await getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json({ error: "Brak uprawnień administratora." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const year = parseYear(searchParams.get("year"));
    const events = await listFacebookResultsForAdmin(year);

    return NextResponse.json({ ok: true, year, events });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Nie udało się pobrać wyników.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json({ error: "Brak uprawnień administratora." }, { status: 401 });
    }

    const body = (await request.json()) as FacebookResultInput;

    if (!body.athlete_name?.trim() || !body.event_title?.trim() || !body.year) {
      return NextResponse.json(
        { error: "Imię zawodnika, nazwa zawodów i rok są wymagane." },
        { status: 400 }
      );
    }

    const data = await createFacebookResult(body);
    revalidateResultsPaths();

    const shouldPublishNews = body.published !== false;

    if (shouldPublishNews) {
      after(
        publishResultsNews(data.facebook_post_id, data.event_title).catch((error) => {
          console.error("Auto news after result create:", error);
        })
      );
    }

    return NextResponse.json({ ok: true, data, newsScheduled: shouldPublishNews });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Nie udało się dodać wyniku.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
