import { NextResponse, after } from "next/server";
import { revalidatePath } from "next/cache";

import {
  deleteFacebookEventGroup,
  getFacebookEventGroup,
  updateFacebookEventGroup,
} from "@/lib/facebook-results-db";
import { syncResultsNewsForEvent } from "@/lib/facebook-results-news";
import { getAdminFromRequest } from "@/lib/verify-admin";

function revalidateResultsPaths() {
  revalidatePath("/zawody/wyniki-zawodow");
  revalidatePath("/panel-rodzica/wyniki");
  revalidatePath("/aktualnosci");
  revalidatePath("/");
}

async function refreshResultsNews(facebookPostId: string, eventTitle: string) {
  const event = await getFacebookEventGroup(facebookPostId, eventTitle);

  if (!event) {
    return;
  }

  await syncResultsNewsForEvent(event);
  revalidatePath("/aktualnosci");
  revalidatePath("/");
}

export async function PATCH(request: Request) {
  try {
    const admin = await getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json({ error: "Brak uprawnień administratora." }, { status: 401 });
    }

    const body = await request.json();
    const facebookPostId = body.facebook_post_id?.trim();
    const eventTitle = body.event_title?.trim();

    if (!facebookPostId || !eventTitle) {
      return NextResponse.json(
        { error: "Identyfikator posta i nazwa zawodów są wymagane." },
        { status: 400 }
      );
    }

    await updateFacebookEventGroup(facebookPostId, eventTitle, {
      event_title: body.new_event_title,
      event_date: body.event_date,
      location: body.location,
      source_url: body.source_url,
      year: body.year,
      club_place: body.club_place,
      club_points: body.club_points,
    });

    revalidateResultsPaths();

    const nextEventTitle = body.new_event_title?.trim() || eventTitle;

    after(
      refreshResultsNews(facebookPostId, nextEventTitle).catch((error) => {
        console.error("Auto news after event update:", error);
      })
    );

    return NextResponse.json({ ok: true, newsScheduled: true });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Nie udało się zaktualizować zawodów.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = await getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json({ error: "Brak uprawnień administratora." }, { status: 401 });
    }

    const body = await request.json();
    const facebookPostId = body.facebook_post_id?.trim();
    const eventTitle = body.event_title?.trim();

    if (!facebookPostId || !eventTitle) {
      return NextResponse.json(
        { error: "Identyfikator posta i nazwa zawodów są wymagane." },
        { status: 400 }
      );
    }

    await deleteFacebookEventGroup(facebookPostId, eventTitle);
    revalidateResultsPaths();

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Nie udało się usunąć zawodów.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
