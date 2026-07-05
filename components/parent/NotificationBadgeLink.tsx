"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

import { fetchNotifications } from "@/lib/notifications-client";

export default function NotificationBadgeLink() {
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
      href="/panel-rodzica/powiadomienia"
      className="relative inline-flex items-center gap-2 rounded-lg border border-zks-gold-mid/30 px-3 py-2.5 text-xs text-zks-text transition hover:border-zks-gold-mid hover:text-zks-gold-bright"
    >
      <Bell className="h-4 w-4" />
      <span className="hidden sm:inline">Powiadomienia</span>
      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
