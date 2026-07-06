import webpush from "web-push";

import {
  listPushSubscriptionsForUsers,
  removePushSubscription,
} from "./push-subscriptions-db";

type WebPushError = Error & {
  statusCode?: number;
  body?: string;
};

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

function parseWebPushFailure(error: unknown) {
  const err = error as WebPushError;
  const statusCode =
    typeof err?.statusCode === "number" ? err.statusCode : 0;
  const rawMessage = err instanceof Error ? err.message : "Błąd push";
  const body = typeof err?.body === "string" ? err.body.toLowerCase() : "";

  const staleSubscription =
    statusCode === 404 ||
    statusCode === 410 ||
    statusCode === 400 ||
    statusCode === 403 ||
    statusCode === 413 ||
    statusCode === 429 ||
    /unexpected response/i.test(rawMessage) ||
    (statusCode >= 400 && statusCode < 500) ||
    body.includes("expired") ||
    body.includes("unregistered") ||
    body.includes("invalid") ||
    body.includes("notregistered");

  if (staleSubscription) {
    return {
      statusCode,
      staleSubscription: true,
      message: "Usunięto starą subskrypcję push (np. poprzednia przeglądarka).",
    };
  }

  if (statusCode === 401 || statusCode === 403) {
    return {
      statusCode,
      staleSubscription: false,
      message: "Błąd autoryzacji push — sprawdź klucze VAPID na Vercel.",
    };
  }

  return {
    statusCode,
    staleSubscription: false,
    message:
      statusCode > 0
        ? `Push nie dotarł na jedno urządzenie (HTTP ${statusCode}).`
        : rawMessage,
  };
}

export async function sendWebPushToUsers(
  userUids: string[],
  payload: {
    title: string;
    body: string;
    url?: string;
    urlsByUid?: Record<string, string>;
  }
) {
  const config = getVapidConfig();

  if (!config) {
    return {
      sent: 0,
      failed: 0,
      removedStale: 0,
      errors: ["Brak VAPID_PRIVATE_KEY / NEXT_PUBLIC_VAPID_PUBLIC_KEY na Vercel."],
    };
  }

  webpush.setVapidDetails(config.subject, config.publicKey, config.privateKey);

  const subscriptions = await listPushSubscriptionsForUsers(userUids);
  const defaultUrl = payload.url || "/panel-rodzica/powiadomienia";

  let sent = 0;
  let failed = 0;
  let removedStale = 0;
  const errors: string[] = [];

  for (const subscription of subscriptions) {
    const url = payload.urlsByUid?.[subscription.user_uid] || defaultUrl;
    const body = JSON.stringify({
      title: payload.title,
      body: payload.body,
      url,
    });

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
      const failure = parseWebPushFailure(error);

      if (failure.staleSubscription) {
        await removePushSubscription(subscription.endpoint);
        removedStale += 1;
        continue;
      }

      errors.push(failure.message);
    }
  }

  if (!subscriptions.length) {
    errors.push(
      "Push na telefon: 0 — rodzice muszą w panelu kliknąć „Włącz powiadomienia” (powiadomienia w aplikacji i tak trafiły do panelu rodzica)."
    );
  }

  return { sent, failed, removedStale, errors };
}
