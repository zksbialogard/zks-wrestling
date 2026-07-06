import { NextResponse } from "next/server";

import { listPushSubscriptionsForUsers } from "@/lib/push-subscriptions-db";
import { isWebPushConfigured } from "@/lib/web-push-service";
import { getUserFromRequest } from "@/lib/verify-admin";

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  const subscriptions = await listPushSubscriptionsForUsers([user.uid]);

  return NextResponse.json({
    ok: true,
    vapidConfigured: isWebPushConfigured(),
    serverSubscriptions: subscriptions.length,
    registered: subscriptions.length > 0,
  });
}
