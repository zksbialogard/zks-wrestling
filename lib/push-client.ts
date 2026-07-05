import { auth } from "./firebase";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

async function getAuthHeader() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Musisz być zalogowany.");
  }

  const token = await user.getIdToken();

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export function isWebPushSupported() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function subscribeToWebPush() {
  if (!isWebPushSupported()) {
    throw new Error("Twoja przeglądarka nie obsługuje powiadomień push.");
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error("Brak zgody na powiadomienia w przeglądarce.");
  }

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  if (!vapidPublicKey) {
    throw new Error("Brak NEXT_PUBLIC_VAPID_PUBLIC_KEY — skontaktuj się z administratorem.");
  }

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });
  }

  const headers = await getAuthHeader();
  const response = await fetch("/api/push/subscribe", {
    method: "POST",
    headers,
    body: JSON.stringify({
      enabled: true,
      subscription: subscription.toJSON(),
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Nie udało się włączyć powiadomień push.");
  }

  return true;
}

export async function unsubscribeFromWebPush() {
  if (!isWebPushSupported()) {
    return false;
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    return false;
  }

  const headers = await getAuthHeader();

  await fetch("/api/push/subscribe", {
    method: "POST",
    headers,
    body: JSON.stringify({
      enabled: false,
      subscription: subscription.toJSON(),
    }),
  });

  await subscription.unsubscribe();
  return true;
}

export async function getWebPushStatus() {
  if (!isWebPushSupported()) {
    return { supported: false, subscribed: false, permission: "unsupported" as const };
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  return {
    supported: true,
    subscribed: Boolean(subscription),
    permission: Notification.permission,
  };
}
