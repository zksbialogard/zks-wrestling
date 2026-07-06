import webpush from "web-push";

import {
  listPushSubscriptionsForUsers,
  removePushSubscription,
} from "./push-subscriptions-db";

function getVapidConfig() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  const subject =
    process.env.VAPID_SUBJECT?.trim() || "mailto:kontakt@zksbialogard.pl";

  if (!publicKey || !privateKey) {
    return null;
  }

  return { publicKey, privateKey, subject };
}

export function isWebPushConfigured() {
  return Boolean(getVapidConfig());
}

export async function sendWebPushToUsers(
  userUids: string[],
  payload: { title: string; body: string; url?: string }
) {
  const config = getVapidConfig();

  if (!config) {
    return {
      sent: 0,
      failed: 0,
      errors: ["Brak VAPID_PRIVATE_KEY / NEXT_PUBLIC_VAPID_PUBLIC_KEY na Vercel."],
    };
  }

  webpush.setVapidDetails(config.subject, config.publicKey, config.privateKey);

  const subscriptions = await listPushSubscriptionsForUsers(userUids);
  const body = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url || "/panel-rodzica/powiadomienia",
  });

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const subscription of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        },
        body
      );
      sent += 1;
    } catch (error) {
      failed += 1;
      const statusCode =
        typeof error === "object" &&
        error !== null &&
        "statusCode" in error &&
        typeof error.statusCode === "number"
          ? error.statusCode
          : 0;

      if (statusCode === 404 || statusCode === 410) {
        await removePushSubscription(subscription.endpoint);
      }

      const message = error instanceof Error ? error.message : "Błąd push";
      errors.push(message);
    }
  }

  if (!subscriptions.length) {
    errors.push(
      "Push na telefon: 0 — rodzice muszą w panelu kliknąć „Włącz powiadomienia” (powiadomienia w aplikacji i tak trafiły do panelu rodzica)."
    );
  }

  return { sent, failed, errors };
}
