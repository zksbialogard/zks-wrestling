import { NextResponse } from "next/server";

import {
  deleteFacebookEventGroup,
  updateFacebookEventGroup,
} from "@/lib/facebook-results-db";
import {
  revalidateResultsPaths,
  syncResultsNewsImmediately,
} from "@/lib/facebook-results-revalidate";
import { getAdminFromRequest } from "@/lib/verify-admin";

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
    const news = await syncResultsNewsImmediately(facebookPostId, nextEventTitle, {
      eventDate: body.event_date,
      year: body.year,
    });

    return NextResponse.json({ ok: true, news });
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

    const deleted = await deleteFacebookEventGroup(facebookPostId, eventTitle);
    const news = await syncResultsNewsImmediately(facebookPostId, eventTitle, {
      newsPostId: deleted.newsPostId,
      eventDate: deleted.eventDate,
      year: deleted.year,
    });

    return NextResponse.json({ ok: true, news });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Nie udało się usunąć zawodów.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
