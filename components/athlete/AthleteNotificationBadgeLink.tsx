"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

import { fetchNotifications } from "@/lib/notifications-client";

export default function AthleteNotificationBadgeLink() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnread();

    const interval = window.setInterval(loadUnread, 60000);
    return () => window.clearInterval(interval);
  }, []);

  async function loadUnread() {
    try {
      const result = await fetchNotifications();
      setUnreadCount(result.unreadCount);
    } catch {
      setUnreadCount(0);
    }
  }

  return (
    <Link
      href="/panel-zawodnika/powiadomienia"
      aria-label={
        unreadCount > 0
          ? `Powiadomienia, ${unreadCount} nieprzeczytanych`
          : "Powiadomienia"
      }
      className={`relative inline-flex min-h-[44px] items-center gap-2 rounded-lg border px-3 py-2.5 text-xs transition ${
        unreadCount > 0
          ? "border-red-500/40 bg-red-500/10 text-white hover:border-red-400"
          : "border-zks-gold-mid/30 text-zks-text hover:border-zks-gold-mid hover:text-zks-gold-bright"
      }`}
    >
      <Bell className="h-4 w-4 shrink-0" />
      <span className="hidden sm:inline">Powiadomienia</span>
      {unreadCount > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white sm:ml-0.5">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
