"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationItem,
} from "@/lib/notifications-client";
import {
  getWebPushStatus,
  subscribeToWebPush,
  unsubscribeFromWebPush,
} from "@/lib/push-client";

export default function ParentNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);

  useEffect(() => {
    loadNotifications();

    async function loadPushStatus() {
      const status = await getWebPushStatus();
      setPushEnabled(status.subscribed);
    }

    loadPushStatus();

    const interval = window.setInterval(loadNotifications, 60000);
    return () => window.clearInterval(interval);
  }, []);

  async function loadNotifications() {
    try {
      setLoading(true);
      const result = await fetchNotifications();
      setNotifications(result.notifications);
      setUnreadCount(result.unreadCount);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nie udało się pobrać powiadomień.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkRead(item: NotificationItem) {
    try {
      await markNotificationAsRead(item.id);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === item.id
            ? { ...notification, read_at: new Date().toISOString() }
            : notification
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nie udało się oznaczyć powiadomienia.";
      toast.error(message);
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read_at: notification.read_at || new Date().toISOString(),
        }))
      );
      setUnreadCount(0);
      toast.success("Wszystkie powiadomienia oznaczone jako przeczytane.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nie udało się oznaczyć powiadomień.";
      toast.error(message);
    }
  }

  async function enablePush() {
    try {
      await subscribeToWebPush();
      setPushEnabled(true);
      toast.success("Powiadomienia push włączone — dostaniesz je na telefon.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nie udało się włączyć powiadomień push.";
      toast.error(message);
    }
  }

  async function disablePush() {
    try {
      await unsubscribeFromWebPush();
      setPushEnabled(false);
      toast.success("Powiadomienia push wyłączone.");
    } catch (error) {
      toast.error("Nie udało się wyłączyć powiadomień push.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold uppercase text-white">
            Powiadomienia
          </h1>
          <p className="mt-2 text-sm text-zks-text-muted">
            Komunikaty od klubu: zawody, zgłoszenia i ważne informacje.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {!pushEnabled ? (
            <button
              type="button"
              onClick={enablePush}
              className="zks-btn-outline px-4 py-2.5 text-xs"
            >
              Włącz powiadomienia push
            </button>
          ) : (
            <button
              type="button"
              onClick={disablePush}
              className="zks-btn-outline px-4 py-2.5 text-xs"
            >
              Wyłącz powiadomienia push
            </button>
          )}

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="zks-btn-outline inline-flex items-center gap-2 px-4 py-2.5 text-xs"
            >
              <CheckCheck className="h-4 w-4" />
              Oznacz wszystkie
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="zks-card flex items-center gap-3 p-6 text-zks-text-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
          Ładowanie powiadomień...
        </div>
      ) : notifications.length === 0 ? (
        <div className="zks-card p-8 text-center">
          <Bell className="mx-auto h-10 w-10 text-zks-gold-mid" />
          <p className="mt-4 text-zks-text-muted">Brak powiadomień.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => {
            const unread = !item.read_at;

            return (
              <article
                key={item.id}
                className={`zks-card p-5 transition ${
                  unread ? "border-zks-gold-bright/40" : "opacity-90"
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      {unread && (
                        <span className="h-2 w-2 rounded-full bg-zks-gold-bright" />
                      )}
                      <h2 className="text-lg font-bold text-white">{item.title}</h2>
                    </div>
                    <p className="mt-2 text-sm text-zks-text">{item.body}</p>
                    <p className="mt-3 text-xs text-zks-text-muted">
                      {new Date(item.created_at).toLocaleString("pl-PL")}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {item.link && (
                      <Link
                        href={item.link}
                        onClick={() => unread && handleMarkRead(item)}
                        className="zks-btn-primary px-4 py-2 text-xs"
                      >
                        Otwórz
                      </Link>
                    )}

                    {unread && (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(item)}
                        className="zks-btn-outline px-4 py-2 text-xs"
                      >
                        Oznacz jako przeczytane
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
