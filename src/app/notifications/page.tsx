"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import RequireAuth from "@/components/RequireAuth";
import {
  BellIcon,
  CheckIcon,
  ImageIcon,
  UsersIcon,
  WalletIcon,
} from "@/components/icons";
import {
  subscribeNotifications,
  markAllNotificationsRead,
} from "@/lib/notifications";
import { useAuthStore } from "@/store/useAuthStore";
import type { NotificationItem } from "@/types";

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금 전";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

function iconFor(type: NotificationItem["type"]) {
  switch (type) {
    case "settlement_request":
      return {
        icon: <WalletIcon size={17} />,
        bg: "bg-mint-50",
        fg: "text-mint-500",
      };
    case "settlement_done":
      return {
        icon: <CheckIcon size={17} />,
        bg: "bg-success-bg",
        fg: "text-success-d",
      };
    case "invite":
      return {
        icon: <UsersIcon size={17} />,
        bg: "bg-gray-50",
        fg: "text-gray-600",
      };
    default:
      return {
        icon: <ImageIcon size={17} />,
        bg: "bg-gray-50",
        fg: "text-gray-600",
      };
  }
}

function NotificationsContent() {
  const user = useAuthStore((s) => s.user);
  const [items, setItems] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (!user) return;
    return subscribeNotifications(user.uid, setItems);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    markAllNotificationsRead(user.uid).catch(() => null);
  }, [user]);

  return (
    <AppShell backHref="/home" title="알림">
      <div className="pt-1">
        {items.length === 0 && (
          <div className="text-center py-20">
            <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3 text-gray-300">
              <BellIcon size={26} />
            </div>
            <p className="text-[20px] text-gray-400">아직 알림이 없어요.</p>
          </div>
        )}
        {items.map((n) => {
          const { icon, bg, fg } = iconFor(n.type);
          return (
            <Link
              key={n.id}
              href={n.meetingId ? `/meetings/${n.meetingId}/bill-log` : "/home"}
              className="flex items-center gap-2.5 py-2.5 border-b border-gray-100"
            >
              <div
                className={`w-9 h-9 rounded-[10px] flex items-center justify-center flex-none ${bg} ${fg}`}
              >
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-semibold">{n.title}</div>
                <div className="text-[11.5px] text-gray-500 mt-0.5">
                  {timeAgo(n.createdAt)}
                </div>
              </div>
              {!n.read && (
                <span className="w-1.5 h-1.5 bg-mint-300 rounded-full flex-none" />
              )}
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}

export default function NotificationsPage() {
  return (
    <RequireAuth>
      <NotificationsContent />
    </RequireAuth>
  );
}
