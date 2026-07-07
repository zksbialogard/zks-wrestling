import { NextResponse } from "next/server";

import {
  buildDeduplicationPlan,
  loadAllChildren,
  runChildrenDeduplication,
} from "@/lib/children-migration";
import { getAdminFromRequest } from "@/lib/verify-admin";

export async function GET(request: Request) {
  const admin = await getAdminFromRequest(request);

  if (!admin) {
    return NextResponse.json({ error: "Brak uprawnień administratora." }, { status: 401 });
  }

  try {
    const children = await loadAllChildren();
    const plan = buildDeduplicationPlan(children);

    return NextResponse.json({
      ok: true,
      ...plan,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Nie udało się przygotować podglądu migracji." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const admin = await getAdminFromRequest(request);

  if (!admin) {
    return NextResponse.json({ error: "Brak uprawnień administratora." }, { status: 401 });
  }

  try {
    const result = await runChildrenDeduplication();

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Migracja duplikatów zakończyła się błędem." },
      { status: 500 }
    );
  }
}
