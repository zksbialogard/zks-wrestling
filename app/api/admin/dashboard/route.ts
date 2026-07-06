import { NextResponse } from "next/server";

import { getAdminDashboardStats } from "@/lib/admin-dashboard";
import { getAdminFromRequest } from "@/lib/verify-admin";

export async function GET(request: Request) {
  try {
    const admin = await getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json({ error: "Brak uprawnień administratora." }, { status: 401 });
    }

    const stats = await getAdminDashboardStats();

    return NextResponse.json({ ok: true, stats });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Nie udało się pobrać statystyk dashboardu." },
      { status: 500 }
    );
  }
}
