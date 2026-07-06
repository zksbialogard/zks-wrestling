import { NextResponse } from "next/server";

import { notifyClubMembers, type NotifyChannels } from "@/lib/notify-service";
import { sanitizeNotifyResult } from "@/lib/notify-result-utils";
import { seedDefaultTemplatesIfEmpty } from "@/lib/notifications-db";
import { type TemplateKey } from "@/lib/message-templates";
import { getAdminFromRequest } from "@/lib/verify-admin";

type NotifyBody = {
  templateKey: TemplateKey;
  variables: Record<string, string>;
  channels?: NotifyChannels;
  type?: string;
  link?: string;
  targetUid?: string;
};

export async function POST(request: Request) {
  try {
    const admin = await getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json({ error: "Brak uprawnień administratora." }, { status: 401 });
    }

    await seedDefaultTemplatesIfEmpty();

    const body = (await request.json()) as NotifyBody;

    if (!body.templateKey || !body.variables) {
      return NextResponse.json(
        { error: "Brak szablonu lub zmiennych wiadomości." },
        { status: 400 }
      );
    }

    const result = await notifyClubMembers({
      templateKey: body.templateKey,
      variables: body.variables,
      channels: {
        email: body.channels?.email ?? false,
        sms: body.channels?.sms ?? false,
        inApp: body.channels?.inApp ?? true,
        push: body.channels?.push ?? true,
      },
      type: body.type,
      link: body.link,
      targetUid: body.targetUid,
    });

    return NextResponse.json({ ok: true, result: sanitizeNotifyResult(result) });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Nie udało się wysłać powiadomień.";

    return NextResponse.json({
      ok: true,
      result: {
        totalParents: 0,
        emailsSent: 0,
        smsSent: 0,
        inAppSent: 0,
        pushSent: 0,
        errors: [message],
        warnings: [],
      },
    });
  }
}
