import { NextResponse } from "next/server";

import {
  countUnreadNotifications,
  listNotificationsForUser,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications-db";
import { getUserFromRequest } from "@/lib/verify-admin";

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
    }

    const notifications = await listNotificationsForUser(user.uid);
    const unreadCount = await countUnreadNotifications(user.uid);

    return NextResponse.json({ ok: true, notifications, unreadCount });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Nie udało się pobrać powiadomień." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
    }

    const body = await request.json();

    if (body.markAll) {
      await markAllNotificationsRead(user.uid);
      return NextResponse.json({ ok: true });
    }

    if (!body.id) {
      return NextResponse.json({ error: "Brak ID powiadomienia." }, { status: 400 });
    }

    await markNotificationRead(body.id, user.uid);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Nie udało się zaktualizować powiadomienia." },
      { status: 500 }
    );
  }
}
