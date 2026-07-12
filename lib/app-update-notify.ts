import {
  appUpdateReminderKey,
  getDeploymentVersion,
  getDisplayVersion,
} from "./app-version";
import { absoluteUrl } from "./site-config";
import { notifyClubMembers, type NotifyResult } from "./notify-service";
import {
  hasScheduledReminderBeenSent,
  markScheduledReminderSent,
} from "./scheduled-reminder-log";

export type AppUpdateNotifyResult = {
  skipped: boolean;
  reason?: string;
  version: string;
  notify?: NotifyResult;
};

export async function runAppUpdateNotify(
  versionInput?: string
): Promise<AppUpdateNotifyResult> {
  const version = versionInput?.trim() || getDeploymentVersion();

  if (!version || version === "dev") {
    return {
      skipped: true,
      reason: "Brak identyfikatora wersji produkcyjnej.",
      version: version || "unknown",
    };
  }

  const reminderKey = appUpdateReminderKey(version);

  if (await hasScheduledReminderBeenSent(reminderKey)) {
    return {
      skipped: true,
      reason: "Powiadomienie dla tej wersji zostało już wysłane.",
      version,
    };
  }

  const displayVersion = getDisplayVersion(version);
  const link = absoluteUrl("/pobierz");

  const notify = await notifyClubMembers({
    templateKey: "app_update",
    variables: {
      version: displayVersion,
      link,
    },
    channels: {
      inApp: true,
      push: true,
    },
    type: "app_update",
    link,
  });

  await markScheduledReminderSent(reminderKey);

  return {
    skipped: false,
    version,
    notify,
  };
}
