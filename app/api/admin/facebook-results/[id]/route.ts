import { NextResponse, after } from "next/server";
import { revalidatePath } from "next/cache";

import {
  deleteFacebookResult,
  getFacebookEventGroup,
  updateFacebookResult,
} from "@/lib/facebook-results-db";
import { syncResultsNewsForEvent } from "@/lib/facebook-results-news";
import type { FacebookResultInput } from "@/lib/facebook-results-types";
import { getAdminFromRequest } from "@/lib/verify-admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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

    if (data.published !== false) {
      after(
        refreshResultsNews(data.facebook_post_id, data.event_title).catch((error) => {
          console.error("Auto news after result update:", error);
        })
      );
    }

    return NextResponse.json({ ok: true, data, newsScheduled: data.published !== false });
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
    await deleteFacebookResult(id);
    revalidateResultsPaths();

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Nie udało się usunąć wyniku.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
