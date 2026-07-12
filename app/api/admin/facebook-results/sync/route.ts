import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { FACEBOOK_RESULTS_YEAR, syncFacebookResults } from "@/lib/facebook-results-sync";
import { getAdminFromRequest } from "@/lib/verify-admin";

function revalidateResultsPaths() {
  revalidatePath("/zawody/wyniki-zawodow");
  revalidatePath("/panel-rodzica/wyniki");
  revalidatePath("/aktualnosci");
  revalidatePath("/");
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json({ error: "Brak uprawnień administratora." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const year = Number(body.year) || FACEBOOK_RESULTS_YEAR;
    const result = await syncFacebookResults(year);
    revalidateResultsPaths();

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Nie udało się zsynchronizować wyników z Facebooka.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
