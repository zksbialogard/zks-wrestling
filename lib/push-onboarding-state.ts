import {
  fetchPushServerStatus,
  getWebPushStatus,
  isIosDevice,
  isStandalonePwa,
  isWebPushSupported,
} from "./push-client";

export type PushOnboardingStatus =
  | "ready"
  | "unsupported"
  | "ios_needs_pwa"
  | "needs_permission"
  | "denied"
  | "needs_sync";

export type PushOnboardingState = {
  status: PushOnboardingStatus;
  subscribed: boolean;
  onServer: boolean;
  permission: NotificationPermission | "unsupported";
  iosNeedsPwa: boolean;
};

export async function resolvePushOnboardingState(): Promise<PushOnboardingState> {
  if (!isWebPushSupported()) {
    return {
      status: "unsupported",
      subscribed: false,
      onServer: false,
      permission: "unsupported",
      iosNeedsPwa: false,
    };
  }

  const iosNeedsPwa = isIosDevice() && !isStandalonePwa();

  if (iosNeedsPwa) {
    return {
      status: "ios_needs_pwa",
      subscribed: false,
      onServer: false,
      permission: Notification.permission,
      iosNeedsPwa: true,
    };
  }

  if (Notification.permission === "denied") {
    return {
      status: "denied",
      subscribed: false,
      onServer: false,
      permission: "denied",
      iosNeedsPwa: false,
    };
  }

  const browserStatus = await getWebPushStatus();
  let onServer = false;

  try {
    const serverStatus = await fetchPushServerStatus();
    onServer = serverStatus.registered;
  } catch {
    onServer = false;
  }

  if (browserStatus.subscribed && onServer) {
    return {
      status: "ready",
      subscribed: true,
      onServer: true,
      permission: Notification.permission,
      iosNeedsPwa: false,
    };
  }

  if (Notification.permission === "default") {
    return {
      status: "needs_permission",
      subscribed: browserStatus.subscribed,
      onServer,
      permission: "default",
      iosNeedsPwa: false,
    };
  }

  return {
    status: "needs_sync",
    subscribed: browserStatus.subscribed,
    onServer,
    permission: Notification.permission,
    iosNeedsPwa: false,
  };
}

export function pushOnboardingHeadline(status: PushOnboardingStatus): string {
  switch (status) {
    case "ready":
      return "Powiadomienia push są włączone";
    case "unsupported":
      return "Push niedostępny w tej przeglądarce";
    case "ios_needs_pwa":
      return "Na iPhone dodaj aplikację na ekran główny";
    case "needs_permission":
      return "Włącz powiadomienia od klubu";
    case "denied":
      return "Powiadomienia są zablokowane";
    case "needs_sync":
      return "Dokończ włączanie powiadomień";
    default:
      return "Włącz powiadomienia od klubu";
  }
}

export function pushOnboardingDescription(
  status: PushOnboardingStatus,
  role: "rodzic" | "zawodnik"
): string {
  switch (status) {
    case "ready":
      return "Na tym urządzeniu otrzymasz alerty nawet po zamknięciu aplikacji.";
    case "unsupported":
      return "Użyj Chrome lub Safari na telefonie albo zainstaluj aplikację PWA.";
    case "ios_needs_pwa":
      return "Push na iPhone działa tylko z ikony aplikacji na pulpicie — nie z zakładki Safari.";
    case "needs_permission":
      return role === "rodzic"
        ? "Jedno kliknięcie — i nie przegapisz treningów, zawodów ani decyzji klubu o zgłoszeniach."
        : "Jedno kliknięcie — i nie przegapisz treningów, zawodów ani komunikatów od klubu.";
    case "denied":
      return "Wcześniej odrzuciłeś zgodę. Odblokuj powiadomienia w ustawieniach przeglądarki, potem wróć tutaj.";
    case "needs_sync":
      return "Przeglądarka ma zgodę, ale to urządzenie nie jest jeszcze zapisane u klubu. Kliknij poniżej.";
    default:
      return "";
  }
}
