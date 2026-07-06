"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, BellOff, CheckCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { useAuth } from "@/components/auth/AuthProvider";

import {
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationItem,
} from "@/lib/notifications-client";

export default function ParentNotificationsPage() {
  const router = useRouter();
  const { user, ready, loadingProfile } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    if (!ready || loadingProfile || !user) {
      return;
    }

    loadNotifications();

    const interval = window.setInterval(loadNotifications, 60000);
    return () => window.clearInterval(interval);
  }, [ready, loadingProfile, user]);

  async function loadNotifications() {
    try {
      setLoading(true);
      const result = await fetchNotifications();
      setNotifications(result.notifications.filter((item) => !item.read_at));
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
      setNotifications((prev) => prev.filter((notification) => notification.id !== item.id));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nie udało się oznaczyć powiadomienia.";
      toast.error(message);
      return false;
    }
  }

  async function handleOpenNotification(item: NotificationItem) {
    const marked = await handleMarkRead(item);

    if (marked && item.link) {
      router.push(item.link);
    }
  }

  async function handleMarkAllRead() {
    try {
      setMarkingAll(true);
      await markAllNotificationsAsRead();
      setNotifications([]);
      setUnreadCount(0);
      toast.success("Wszystkie powiadomienia oznaczone jako przeczytane.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nie udało się oznaczyć powiadomień.";
      toast.error(message);
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold uppercase text-white sm:text-3xl">
              Powiadomienia
            </h1>
            {unreadCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-red-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-red-400 ring-1 ring-inset ring-red-500/30">
                {unreadCount} {unreadCount === 1 ? "nowe" : "nowych"}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-zks-text-muted">
            Tylko nieprzeczytane wiadomości. Po odczytaniu znikają z listy.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            disabled={markingAll}
            onClick={handleMarkAllRead}
            className="zks-btn-primary inline-flex min-h-[44px] w-full items-center justify-center gap-2 px-5 py-2.5 text-xs sm:w-auto sm:text-sm disabled:opacity-60"
          >
            {markingAll ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCheck className="h-4 w-4" />
            )}
            Oznacz wszystkie jako przeczytane
          </button>
        )}
      </div>

      {loading ? (
        <div className="zks-card flex min-h-[120px] items-center gap-3 p-6 text-zks-text-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
          Ładowanie powiadomień...
        </div>
      ) : notifications.length === 0 ? (
        <div className="zks-card rounded-2xl p-8 text-center sm:p-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-zks-gold-mid/30 bg-zks-gold/10">
            <BellOff className="h-7 w-7 text-zks-gold-mid" />
          </div>
          <h2 className="mt-5 font-[family-name:var(--font-heading)] text-xl font-bold uppercase text-white sm:text-2xl">
            Brak nowych powiadomień
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-zks-text-muted">
            Gdy klub wyśle komunikat o zawodach, zgłoszeniach lub wynikach, pojawi się
            tutaj. Włącz push w profilu, żeby nie przegapić ważnych wiadomości.
          </p>
          <Link
            href="/panel-rodzica/profil"
            className="zks-btn-outline mt-6 inline-flex min-h-[44px] items-center gap-2 px-6 py-2.5 text-xs sm:text-sm"
          >
            <Bell className="h-4 w-4" />
            Ustawienia powiadomień
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => (
            <article
              key={item.id}
              className="zks-card border-zks-gold-bright/30 p-4 sm:p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-2">
                    <span
                      className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-zks-gold-bright"
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <h2 className="text-base font-bold text-white sm:text-lg">
                        {item.title}
                      </h2>
                      <p className="mt-2 break-words text-sm leading-relaxed text-zks-text">
                        {item.body}
                      </p>
                      <time
                        dateTime={item.created_at}
                        className="mt-3 block text-xs text-zks-text-muted"
                      >
                        {new Date(item.created_at).toLocaleString("pl-PL")}
                      </time>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-2 sm:min-w-[140px]">
                  {item.link ? (
                    <button
                      type="button"
                      onClick={() => handleOpenNotification(item)}
                      className="zks-btn-primary min-h-[44px] w-full px-4 py-2.5 text-xs sm:text-sm"
                    >
                      Otwórz
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(item)}
                      className="zks-btn-primary min-h-[44px] w-full px-4 py-2.5 text-xs sm:text-sm"
                    >
                      Oznacz jako przeczytane
                    </button>
                  )}

                  {item.link && (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(item)}
                      className="zks-btn-outline min-h-[44px] w-full px-4 py-2.5 text-xs sm:text-sm"
                    >
                      Usuń z listy
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
