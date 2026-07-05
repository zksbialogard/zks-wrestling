import { NextResponse } from "next/server";

import { syncAllParentsToSupabase } from "@/lib/notify-service";
import { getAdminFromRequest } from "@/lib/verify-admin";

export async function GET(request: Request) {
  const admin = await getAdminFromRequest(request);

  if (!admin) {
    return NextResponse.json({ error: "Brak uprawnień administratora." }, { status: 401 });
  }

  const result = await syncAllParentsToSupabase();

  return NextResponse.json({ ok: true, ...result });
}

export async function POST(request: Request) {
  return GET(request);
}
