const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

let pendingUserReload = false;

function isServiceWorkerSupported() {
  return typeof window !== "undefined" && "serviceWorker" in navigator;
}

function notifyIfUpdateReady(
  registration: ServiceWorkerRegistration,
  onUpdate: () => void
) {
  if (registration.waiting && navigator.serviceWorker.controller) {
    onUpdate();
  }
}

function watchInstallingWorker(
  registration: ServiceWorkerRegistration,
  onUpdate: () => void
) {
  const newWorker = registration.installing;
  if (!newWorker) return;

  newWorker.addEventListener("statechange", () => {
    if (
      newWorker.state === "installed" &&
      navigator.serviceWorker.controller
    ) {
      onUpdate();
    }
  });
}

export function activatePwaUpdate(): void {
  if (!isServiceWorkerSupported()) return;

  pendingUserReload = true;

  void navigator.serviceWorker.ready.then((registration) => {
    if (registration.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
      return;
    }

    window.location.reload();
  });
}

export function subscribeToPwaUpdates(onUpdate: () => void): () => void {
  if (!isServiceWorkerSupported()) {
    return () => {};
  }

  const disposers: Array<() => void> = [];

  const checkForUpdates = () => {
    void navigator.serviceWorker.ready
      .then((registration) => registration.update())
      .then((registration) => {
        if (!registration) return;
        notifyIfUpdateReady(registration, onUpdate);
      })
      .catch(() => {});
  };

  checkForUpdates();

  const intervalId = window.setInterval(
    checkForUpdates,
    UPDATE_CHECK_INTERVAL_MS
  );
  disposers.push(() => window.clearInterval(intervalId));

  const onVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      checkForUpdates();
    }
  };
  document.addEventListener("visibilitychange", onVisibilityChange);
  disposers.push(() =>
    document.removeEventListener("visibilitychange", onVisibilityChange)
  );

  void navigator.serviceWorker.ready.then((registration) => {
    notifyIfUpdateReady(registration, onUpdate);

    registration.addEventListener("updatefound", () => {
      watchInstallingWorker(registration, onUpdate);
    });
  });

  const onControllerChange = () => {
    if (!pendingUserReload) return;
    pendingUserReload = false;
    window.location.reload();
  };

  navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
  disposers.push(() =>
    navigator.serviceWorker.removeEventListener(
      "controllerchange",
      onControllerChange
    )
  );

  return () => {
    disposers.forEach((dispose) => dispose());
  };
}
