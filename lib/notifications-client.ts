import { auth } from "./firebase";

export type NotificationItem = {
  id: string;
  user_uid: string;
  type: string;
  title: string;
  body: string;
  link?: string | null;
  channels?: string[] | null;
  read_at?: string | null;
  created_at: string;
};

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

export async function fetchNotifications() {
  const headers = await getAuthHeader();
  const response = await fetch("/api/notifications", { headers });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Nie udało się pobrać powiadomień.");
  }

  return result as {
    notifications: NotificationItem[];
    unreadCount: number;
  };
}

export async function markNotificationAsRead(id: string) {
  const headers = await getAuthHeader();
  const response = await fetch("/api/notifications", {
    method: "PATCH",
    headers,
    body: JSON.stringify({ id }),
  });

  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.error || "Nie udało się oznaczyć powiadomienia.");
  }
}

export async function markAllNotificationsAsRead() {
  const headers = await getAuthHeader();
  const response = await fetch("/api/notifications", {
    method: "PATCH",
    headers,
    body: JSON.stringify({ markAll: true }),
  });

  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.error || "Nie udało się oznaczyć powiadomień.");
  }
}

export async function sendAdminNotify(input: {
  templateKey: string;
  variables: Record<string, string>;
  channels?: {
    email?: boolean;
    sms?: boolean;
    inApp?: boolean;
    push?: boolean;
  };
  type?: string;
  link?: string;
  targetUid?: string;
}) {
  const headers = await getAuthHeader();
  const response = await fetch("/api/admin/notify", {
    method: "POST",
    headers,
    body: JSON.stringify(input),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Nie udało się wysłać powiadomień.");
  }

  return result.result as {
    totalParents: number;
    emailsSent: number;
    smsSent: number;
    inAppSent: number;
    pushSent: number;
    errors: string[];
    warnings: string[];
  };
}

export function formatNotifyResultMessage(result: {
  totalParents?: number;
  inAppSent: number;
  pushSent?: number;
}) {
  const totalParents = result.totalParents ?? 0;

  return `Powiadomiono ${result.inAppSent} z ${totalParents} użytkowników${result.pushSent ? ` (push: ${result.pushSent})` : ""}`;
}

export async function savePushPreference(enabled: boolean) {
  const headers = await getAuthHeader();
  const response = await fetch("/api/push/subscribe", {
    method: "POST",
    headers,
    body: JSON.stringify({ enabled }),
  });

  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.error || "Nie udało się zapisać preferencji.");
  }
}

export function showBrowserNotification(title: string, body: string, link?: string | null) {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return;
  }

  if (Notification.permission !== "granted") {
    return;
  }

  const notification = new Notification(title, {
    body,
    icon: "/logo.png",
    badge: "/logo.png",
  });

  if (link) {
    notification.onclick = () => {
      window.open(link, "_self");
    };
  }
}

export async function requestBrowserNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  if (Notification.permission === "granted") {
    await savePushPreference(true);
    return true;
  }

  if (Notification.permission === "denied") {
    return false;
  }

  const permission = await Notification.requestPermission();
  const enabled = permission === "granted";

  if (enabled) {
    await savePushPreference(true);
  }

  return enabled;
}
