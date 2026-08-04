"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import RequireAuth from "@/components/RequireAuth";
import { ChevronRightIcon, EditIcon } from "@/components/icons";
import { Avatar, Chip } from "@/components/ui";
import { signOutUser } from "@/lib/auth";
import { subscribeUserMeetings } from "@/lib/meetings";
import { formatDateRange } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import type { Meeting } from "@/types";

function MyPageContent() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [tab, setTab] = useState<"owned" | "joined">("owned");

  useEffect(() => {
    if (!user) return;
    return subscribeUserMeetings(user.uid, setMeetings);
  }, [user]);

  if (!user) return null;

  const owned = meetings.filter((m) => m.ownerId === user.uid);
  const joined = meetings.filter((m) => m.ownerId !== user.uid);
  const done = meetings.filter((m) => m.status === "done");
  const list = tab === "owned" ? owned : joined;

  async function handleLogout() {
    await signOutUser();
    router.push("/");
  }

  return (
    <AppShell title="마이페이지" bell bottomNav>
      <div className="pt-1">
        <div className="flex items-center gap-3 mb-5">
          <Avatar nickname={user.nickname} photoURL={user.photoURL} size="lg" />
          <div className="flex-1">
            <div className="text-[22px] font-bold">{user.nickname}</div>
            <div className="text-[18px] text-gray-400 mt-0.5">{user.email}</div>
          </div>
          <Link
            href="/mypage/edit-profile"
            aria-label="프로필 수정"
            className="w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 flex-none"
          >
            <EditIcon size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <StatCard label="만든 모임" value={owned.length} />
          <StatCard label="참여한 모임" value={joined.length} />
          <StatCard label="종료된 모임" value={done.length} />
        </div>

        <div className="text-[20px] font-bold text-gray-700 uppercase mt-8 mb-2">
          내 모임
        </div>
        <div className="flex gap-2 mb-3">
          <Chip active={tab === "owned"} onClick={() => setTab("owned")}>
            내가 만든 모임
          </Chip>
          <Chip active={tab === "joined"} onClick={() => setTab("joined")}>
            참여한 모임
          </Chip>
        </div>
        <div className="flex flex-col gap-2 mb-6">
          {list.length === 0 && (
            <p className="text-[18px] text-gray-400 py-3">모임이 없어요.</p>
          )}
          {list.map((m) => (
            <Link
              key={m.id}
              href={`/meetings/${m.id}`}
              className="flex items-center justify-between py-2.5 border-b border-gray-100"
            >
              <div>
                <div className="text-[18px] font-semibold">{m.title}</div>
                <div className="text-[16px] text-gray-500">
                  {formatDateRange(m.startDate, m.endDate)}
                </div>
              </div>
              <ChevronRightIcon size={20} className="text-gray-300" />
            </Link>
          ))}
        </div>

        <div className="text-[20px] font-bold text-gray-700 uppercase mt-14 mb-2">
          설정
        </div>
        <Link
          href="/notifications"
          className="flex items-center justify-between py-2.5 border-b border-gray-100"
        >
          <span className="text-[18px] font-semibold">알림 설정</span>
          <ChevronRightIcon size={20} className="text-gray-300" />
        </Link>
        <Link
          href="/mypage/account"
          className="flex items-center justify-between py-2.5 border-b border-gray-100"
        >
          <span className="text-[18px] font-semibold">계좌 관리</span>
          <div className="flex items-center gap-1.5">
            {user.accountNumber && (
              <span className="text-[14px] text-gray-400">
                {user.bankName} {user.accountNumber}
              </span>
            )}
            <ChevronRightIcon size={20} className="text-gray-300" />
          </div>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full text-left py-2.5 text-[18px] font-semibold text-error-d"
        >
          로그아웃
        </button>
      </div>
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`text-center rounded-xl py-3 border ${
        accent ? "bg-mint-50 border-mint-100" : "bg-gray-50 border-gray-100"
      }`}
    >
      <div
        className={`text-[20px] font-bold ${accent ? "text-mint-500" : "text-gray-900"}`}
      >
        {value}
      </div>
      <div
        className={`text-[16px] mt-0.5 ${accent ? "text-mint-500" : "text-gray-500"}`}
      >
        {label}
      </div>
    </div>
  );
}

export default function MyPagePage() {
  return (
    <RequireAuth>
      <MyPageContent />
    </RequireAuth>
  );
}
