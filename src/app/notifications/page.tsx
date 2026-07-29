"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import RequireAuth from "@/components/RequireAuth";
import {
  BellIcon,
  CheckIcon,
  HeartIcon,
  ImageIcon,
  PlusIcon,
  ReceiptIcon,
  UsersIcon,
  WalletIcon,
} from "@/components/icons";
import { enablePushNotifications, hasPushPermission } from "@/lib/messaging";
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
    case "member_joined":
      return {
        icon: <UsersIcon size={17} />,
        bg: "bg-gray-50",
        fg: "text-gray-600",
      };
    case "plan_item_added":
      return {
        icon: <PlusIcon size={17} />,
        bg: "bg-mint-50",
        fg: "text-mint-500",
      };
    case "receipt_added":
      return {
        icon: <ReceiptIcon size={17} />,
        bg: "bg-mint-50",
        fg: "text-mint-500",
      };
    case "review_added":
      return {
        icon: <HeartIcon size={17} />,
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

function linkFor(n: NotificationItem): string {
  if (!n.meetingId) return "/home";
  switch (n.type) {
    case "plan_item_added":
      return `/meetings/${n.meetingId}/pre-log`;
    case "settlement_request":
    case "settlement_done":
    case "receipt_added":
      return `/meetings/${n.meetingId}/bill-log`;
    case "photo_added":
    case "review_added":
      return `/meetings/${n.meetingId}/post-log`;
    default:
      return `/meetings/${n.meetingId}`;
  }
}

function NotificationsContent() {
  const user = useAuthStore((s) => s.user);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [pushEnabled, setPushEnabled] = useState(() => hasPushPermission());
  const [pushLoading, setPushLoading] = useState(false);
  const [pushDenied, setPushDenied] = useState(false);

  useEffect(() => {
    if (!user) return;
    return subscribeNotifications(user.uid, setItems);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    markAllNotificationsRead(user.uid).catch(() => null);
  }, [user]);

  async function handleEnablePush() {
    if (!user || pushLoading) return;
    setPushLoading(true);
    try {
      const result = await enablePushNotifications(user.uid);
      if (result === "enabled") setPushEnabled(true);
      if (result === "denied") setPushDenied(true);
    } finally {
      setPushLoading(false);
    }
  }

  return (
    <AppShell backHref="/home" title="알림">
      <div className="pt-1">
        {!pushEnabled && (
          <div className="bg-mint-50 border border-mint-100 rounded-xl p-3.5 mb-4 flex items-center justify-between gap-2">
            <div>
              <div className="text-[15px] font-bold text-mint-500">
                푸시 알림을 받아보세요
              </div>
              <div className="text-[13px] text-gray-500 mt-0.5">
                {pushDenied
                  ? "브라우저 알림 권한이 꺼져 있어요. 설정에서 허용해주세요."
                  : "새 소식이 오면 바로 알려드려요."}
              </div>
            </div>
            {!pushDenied && (
              <button
                onClick={handleEnablePush}
                disabled={pushLoading}
                className="flex-none text-[13px] font-bold text-white bg-mint-300 rounded-full px-3.5 py-2 disabled:opacity-50"
              >
                {pushLoading ? "설정 중..." : "받기"}
              </button>
            )}
          </div>
        )}
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
              href={linkFor(n)}
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
