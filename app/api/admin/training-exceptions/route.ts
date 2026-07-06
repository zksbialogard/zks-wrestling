import { NextResponse } from "next/server";

import { notifyTrainingGroup } from "@/lib/notify-group";
import { sanitizeNotifyResult } from "@/lib/notify-result-utils";
import { seedDefaultTemplatesIfEmpty } from "@/lib/notifications-db";
import { createTrainingException } from "@/lib/training-exceptions-db";
import {
  getTrainingGroup,
  isTrainingGroupId,
  type TrainingGroupId,
} from "@/lib/training-groups";
import { getAdminFromRequest } from "@/lib/verify-admin";

type TrainingExceptionBody = {
  group_id: TrainingGroupId;
  session_date: string;
  status: "cancelled" | "rescheduled";
  new_start?: string;
  new_end?: string;
  message: string;
  notify?: {
    email?: boolean;
    sms?: boolean;
    inApp?: boolean;
    push?: boolean;
  };
};

function formatDateLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json({ error: "Brak uprawnień administratora." }, { status: 401 });
    }

    await seedDefaultTemplatesIfEmpty();

    const body = (await request.json()) as TrainingExceptionBody;

    if (!body.group_id || !isTrainingGroupId(body.group_id)) {
      return NextResponse.json({ error: "Wybierz poprawną grupę treningową." }, { status: 400 });
    }

    if (!body.session_date || !body.status || !body.message?.trim()) {
      return NextResponse.json(
        { error: "Uzupełnij datę, status i komunikat." },
        { status: 400 }
      );
    }

    if (body.status === "rescheduled" && (!body.new_start || !body.new_end)) {
      return NextResponse.json(
        { error: "Przy przełożeniu treningu podaj nowe godziny." },
        { status: 400 }
      );
    }

    const group = getTrainingGroup(body.group_id);
    const dateLabel = formatDateLabel(body.session_date);

    const exception = await createTrainingException({
      group_id: body.group_id,
      session_date: body.session_date,
      status: body.status,
      original_start: group.start,
      original_end: group.end,
      new_start: body.new_start,
      new_end: body.new_end,
      message: body.message.trim(),
    });

    const defaultMessage =
      body.status === "cancelled"
        ? `Trening ${group.label} w dniu ${dateLabel} (${group.start}–${group.end}) został odwołany. ${body.message.trim()}`
        : `Trening ${group.label} w dniu ${dateLabel} został przełożony na godz. ${body.new_start}–${body.new_end}. ${body.message.trim()}`;

    const notifyResult = await notifyTrainingGroup({
      groupId: body.group_id,
      message: defaultMessage,
      channels: {
        email: body.notify?.email ?? false,
        sms: body.notify?.sms ?? false,
        inApp: body.notify?.inApp ?? true,
        push: body.notify?.push ?? true,
      },
      link: "/panel-zawodnika/treningi",
    });

    return NextResponse.json({
      ok: true,
      exception,
      notifyResult: sanitizeNotifyResult(notifyResult),
    });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Nie udało się zapisać wyjątku treningowego.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
