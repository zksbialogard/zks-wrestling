"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, BellOff, CheckCheck } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { useAuth } from "@/components/auth/AuthProvider";
import {
  PanelEmptyState,
  PanelList,
  PanelLoadingState,
  PanelPage,
  PanelPageHeader,
} from "@/components/layout/PanelLayout";
import {
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationItem,
} from "@/lib/notifications-client";

type Props = {
  profileHref: string;
};

export default function NotificationsPanel({ profileHref }: Props) {
  const router = useRouter();
  const { user, ready, loadingProfile } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    if (!ready || loadingProfile || !user) return;

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
      toast.error(
        error instanceof Error ? error.message : "Nie udało się pobrać powiadomień."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkRead(item: NotificationItem) {
    try {
      await markNotificationAsRead(item.id);
      setNotifications((prev) => prev.filter((n) => n.id !== item.id));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      return true;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Nie udało się oznaczyć powiadomienia."
      );
      return false;
    }
  }

  async function handleOpenNotification(item: NotificationItem) {
    const marked = await handleMarkRead(item);
    if (marked && item.link) router.push(item.link);
  }

  async function handleMarkAllRead() {
    try {
      setMarkingAll(true);
      await markAllNotificationsAsRead();
      setNotifications([]);
      setUnreadCount(0);
      toast.success("Wszystkie powiadomienia oznaczone jako przeczytane.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Nie udało się oznaczyć powiadomień."
      );
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <PanelPage>
      <PanelPageHeader
        title="Powiadomienia"
        description="Komunikaty od klubu o treningach, zawodach i ważnych informacjach."
        badge={
          unreadCount > 0 ? (
            <span className="inline-flex items-center rounded-full bg-red-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-red-400 ring-1 ring-inset ring-red-500/30">
              {unreadCount} {unreadCount === 1 ? "nowe" : "nowych"}
            </span>
          ) : undefined
        }
        action={
          unreadCount > 0 ? (
            <button
              type="button"
              disabled={markingAll}
              onClick={handleMarkAllRead}
              className="zks-btn-primary inline-flex min-h-[44px] w-full items-center justify-center gap-2 px-5 py-2.5 text-xs sm:w-auto sm:text-sm disabled:opacity-60"
            >
              {markingAll ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zks-black/20 border-t-zks-black" />
              ) : (
                <CheckCheck className="h-4 w-4" />
              )}
              Oznacz wszystkie jako przeczytane
            </button>
          ) : undefined
        }
      />

      {loading ? (
        <PanelLoadingState label="Ładowanie powiadomień..." />
      ) : notifications.length === 0 ? (
        <PanelEmptyState
          icon={<BellOff className="h-7 w-7 text-zks-gold-mid" />}
          title="Brak nowych powiadomień"
          description="Włącz push w profilu, żeby nie przegapić odwołań treningów i informacji o zawodach."
          action={
            <Link
              href={profileHref}
              className="zks-btn-outline inline-flex min-h-[44px] items-center gap-2 px-6 py-2.5 text-xs sm:text-sm"
            >
              <Bell className="h-4 w-4" />
              Ustawienia powiadomień
            </Link>
          }
        />
      ) : (
        <PanelList>
          {notifications.map((item) => (
            <article key={item.id} className="zks-card zks-card-pad border-zks-gold-bright/30">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-bold text-white sm:text-lg">{item.title}</h2>
                  <p className="mt-2 break-words text-sm leading-relaxed text-zks-text">
                    {item.body}
                  </p>
                  <time dateTime={item.created_at} className="mt-3 block text-xs text-zks-text-muted">
                    {new Date(item.created_at).toLocaleString("pl-PL")}
                  </time>
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
        </PanelList>
      )}
    </PanelPage>
  );
}
