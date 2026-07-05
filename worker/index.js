import { clientsClaim } from "workbox-core";
import { precacheAndRoute } from "workbox-precaching";

clientsClaim();
precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("push", (event) => {
  const payload = event.data
    ? event.data.json()
    : { title: "ZKS Białogard", body: "Nowe powiadomienie", url: "/panel-rodzica/powiadomienia" };

  event.waitUntil(
    self.registration.showNotification(payload.title || "ZKS Białogard", {
      body: payload.body || "",
      icon: "/logo-shield.png",
      badge: "/logo-shield.png",
      data: { url: payload.url || "/panel-rodzica/powiadomienia" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/panel-rodzica/powiadomienia";

  event.waitUntil(clients.openWindow(targetUrl));
});
