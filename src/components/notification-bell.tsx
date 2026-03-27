"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Bell } from "lucide-react";
import Link from "next/link";

export function NotificationBell() {
  const count = useQuery(api.notifications.getUnreadCount);
  return (
    <Link href="/notifications" className="relative inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-muted">
      <Bell className="h-5 w-5" />
      {count !== undefined && count > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">{count > 99 ? "99+" : count}</span>
      )}
    </Link>
  );
}
