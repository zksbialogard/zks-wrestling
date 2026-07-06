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

export function isIosDevice() {
  if (typeof navigator === "undefined") {
    return false;
  }

  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export function isStandalonePwa() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

async function getServiceWorkerRegistration() {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service Worker niedostępny.");
  }

  const existing = await navigator.serviceWorker.getRegistration("/");

  if (existing) {
    return existing;
  }

  return navigator.serviceWorker.register("/sw.js", { scope: "/" });
}

async function getOrCreatePushSubscription() {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  if (!vapidPublicKey) {
    throw new Error("Brak NEXT_PUBLIC_VAPID_PUBLIC_KEY — skontaktuj się z administratorem.");
  }

  await getServiceWorkerRegistration();
  const registration = await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });
  }

  return subscription;
}

async function savePushSubscriptionToServer(subscription: PushSubscription) {
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
    throw new Error(result.error || "Nie udało się zapisać powiadomień push na serwerze.");
  }

  return true;
}

export async function subscribeToWebPush() {
  if (!isWebPushSupported()) {
    throw new Error("Twoja przeglądarka nie obsługuje powiadomień push.");
  }

  if (isIosDevice() && !isStandalonePwa()) {
    throw new Error(
      "Na iPhone: najpierw dodaj aplikację na ekran główny (Safari → Udostępnij → Do ekranu początkowego), potem włącz powiadomienia."
    );
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error("Brak zgody na powiadomienia. Włącz je w ustawieniach przeglądarki.");
  }

  const subscription = await getOrCreatePushSubscription();
  await savePushSubscriptionToServer(subscription);

  return true;
}

/**
 * Po zalogowaniu: jeśli zgoda już jest, tworzy subskrypcję push i zapisuje w Supabase.
 * To odróżnia „zezwól w przeglądarce” od prawdziwego push (jak Facebook).
 */
export async function ensureWebPushSubscription() {
  if (!isWebPushSupported()) {
    return { ok: false as const, reason: "unsupported" as const };
  }

  if (Notification.permission === "denied") {
    return { ok: false as const, reason: "denied" as const };
  }

  if (Notification.permission === "default") {
    return { ok: false as const, reason: "needs_prompt" as const };
  }

  if (isIosDevice() && !isStandalonePwa()) {
    return { ok: false as const, reason: "ios_needs_pwa" as const };
  }

  try {
    const subscription = await getOrCreatePushSubscription();
    await savePushSubscriptionToServer(subscription);
    return { ok: true as const, reason: "subscribed" as const };
  } catch {
    return { ok: false as const, reason: "error" as const };
  }
}

export async function syncPushSubscriptionIfGranted() {
  const result = await ensureWebPushSubscription();
  return result.ok;
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

  try {
    await getServiceWorkerRegistration();
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    return {
      supported: true,
      subscribed: Boolean(subscription),
      permission: Notification.permission,
      iosNeedsPwa: isIosDevice() && !isStandalonePwa(),
    };
  } catch {
    return {
      supported: true,
      subscribed: false,
      permission: Notification.permission,
      iosNeedsPwa: isIosDevice() && !isStandalonePwa(),
    };
  }
}
