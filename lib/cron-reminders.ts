import { dateKeyInWarsaw, dayOfWeekInWarsaw, formatDateKeyPl } from "./date-utils";
import { formatEventDate } from "./event-utils";
import type { Event } from "./events";
import { getEvents } from "./events-server";
import { notifyTrainingGroup } from "./notify-group";
import { notifyParents } from "./notify-service";
import { normalizeRegistrationStatus } from "./registration-types";
import { listAllRegistrations } from "./registrations-db";
import {
  hasScheduledReminderBeenSent,
  markScheduledReminderSent,
} from "./scheduled-reminder-log";
import { getTrainingExceptionForSession } from "./training-exceptions-db";
import {
  formatTrainingTime,
  TRAINING_GROUP_OPTIONS,
  type TrainingGroupId,
} from "./training-groups";

export type CronReminderResult = {
  tomorrowKey: string;
  eventRemindersSent: number;
  trainingRemindersSent: number;
  skipped: string[];
  errors: string[];
};

function eventDateKey(eventDate: string): string {
  return eventDate.slice(0, 10);
}

async function sendEventReminders(
  tomorrowKey: string,
  events: Event[],
  result: CronReminderResult
) {
  const tomorrowEvents = events.filter((event) => eventDateKey(event.event_date) === tomorrowKey);

  if (!tomorrowEvents.length) {
    return;
  }

  const registrations = await listAllRegistrations();
  const approved = registrations.filter(
    (item) => normalizeRegistrationStatus(item.status) === "approved"
  );

  for (const event of tomorrowEvents) {
    const parentUids = Array.from(
      new Set(
        approved.filter((item) => item.event_id === event.id).map((item) => item.parent_uid)
      )
    );

    for (const parentUid of parentUids) {
      const reminderKey = `event:${event.id}:${parentUid}:${tomorrowKey}`;

      if (await hasScheduledReminderBeenSent(reminderKey)) {
        result.skipped.push(reminderKey);
        continue;
      }

      try {
        const notifyResult = await notifyParents({
          templateKey: "event_reminder",
          type: "cron_event_reminder",
          targetUid: parentUid,
          link: `/zawody/${event.id}`,
          variables: {
            title: event.title,
            location: event.location,
            eventDate: formatEventDate(event.event_date),
            registrationDeadline: formatEventDate(event.registration_deadline),
          },
          channels: {
            email: false,
            sms: false,
            inApp: true,
            push: true,
          },
        });

        if (notifyResult.errors.length) {
          result.errors.push(...notifyResult.errors.slice(0, 2));
          continue;
        }

        await markScheduledReminderSent(reminderKey);
        result.eventRemindersSent += 1;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Nie udało się wysłać przypomnienia o zawodach.";
        result.errors.push(`${reminderKey}: ${message}`);
      }
    }
  }
}

async function sendTrainingReminders(tomorrowKey: string, result: CronReminderResult) {
  const tomorrowDay = dayOfWeekInWarsaw(tomorrowKey);
  const sessionDateLabel = formatDateKeyPl(tomorrowKey);

  for (const group of TRAINING_GROUP_OPTIONS) {
    if (!group.days.includes(tomorrowDay)) {
      continue;
    }

    const reminderKey = `training:${group.id}:${tomorrowKey}`;

    if (await hasScheduledReminderBeenSent(reminderKey)) {
      result.skipped.push(reminderKey);
      continue;
    }

    const exception = await getTrainingExceptionForSession(
      group.id as TrainingGroupId,
      tomorrowKey
    );

    if (exception?.status === "cancelled") {
      result.skipped.push(`${reminderKey}:cancelled`);
      continue;
    }

    const sessionTime =
      exception?.status === "rescheduled"
        ? formatTrainingTime(
            exception.new_start || group.start,
            exception.new_end || group.end
          )
        : formatTrainingTime(group.start, group.end);

    try {
      const notifyResult = await notifyTrainingGroup({
        groupId: group.id,
        templateKey: "training_reminder",
        message: `Przypomnienie: jutro trening ${group.label} o godz. ${sessionTime}.`,
        variables: {
          groupName: group.label,
          sessionDate: sessionDateLabel,
          sessionTime,
        },
        channels: {
          email: false,
          sms: false,
          inApp: true,
          push: true,
        },
      });

      if (notifyResult.errors.length) {
        result.errors.push(...notifyResult.errors.slice(0, 2));
        continue;
      }

      await markScheduledReminderSent(reminderKey);
      result.trainingRemindersSent += 1;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nie udało się wysłać przypomnienia o treningu.";
      result.errors.push(`${reminderKey}: ${message}`);
    }
  }
}

export async function runDailyReminders(): Promise<CronReminderResult> {
  const tomorrowKey = dateKeyInWarsaw(1);
  const result: CronReminderResult = {
    tomorrowKey,
    eventRemindersSent: 0,
    trainingRemindersSent: 0,
    skipped: [],
    errors: [],
  };

  const events = await getEvents();

  await sendEventReminders(tomorrowKey, events as Event[], result);
  await sendTrainingReminders(tomorrowKey, result);

  return result;
}
