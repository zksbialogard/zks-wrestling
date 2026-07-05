import { NextResponse } from "next/server";

import { savePushPreference } from "@/lib/notify-service";
import {
  removePushSubscription,
  upsertPushSubscription,
} from "@/lib/push-subscriptions-db";
import { getUserFromRequest } from "@/lib/verify-admin";

type SubscribeBody = {
  enabled?: boolean;
  subscription?: {
    endpoint?: string;
    keys?: {
      p256dh?: string;
      auth?: string;
    };
  };
};

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
    }

    const body = (await request.json()) as SubscribeBody;
    const enabled = Boolean(body.enabled);
    const subscription = body.subscription;

    await savePushPreference(user.uid, enabled);

    if (enabled && subscription?.endpoint && subscription.keys?.p256dh && subscription.keys?.auth) {
      const saved = await upsertPushSubscription({
        user_uid: user.uid,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      });

      if (!saved) {
        return NextResponse.json(
          { error: "Nie udało się zapisać subskrypcji push. Uruchom SQL 003_push_subscriptions.sql w Supabase." },
          { status: 500 }
        );
      }
    }

    if (!enabled && subscription?.endpoint) {
      await removePushSubscription(subscription.endpoint);
    }

    return NextResponse.json({ ok: true, enabled });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Nie udało się zapisać preferencji powiadomień." },
      { status: 500 }
    );
  }
}
