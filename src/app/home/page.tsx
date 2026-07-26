"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import RequireAuth from "@/components/RequireAuth";
import { AvatarStack, Badge, Chip } from "@/components/ui";
import { subscribeUserMeetings } from "@/lib/meetings";
import { formatDateRange } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import type { Meeting } from "@/types";

function HomeContent() {
  const user = useAuthStore((s) => s.user);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [tab, setTab] = useState<"active" | "done">("active");

  useEffect(() => {
    if (!user) return;
    return subscribeUserMeetings(user.uid, setMeetings);
  }, [user]);

  const list = meetings.filter((m) => m.status === tab);
  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <AppShell logo bell bottomNav>
      <img src="/hi.png" alt="hi" className="w-full rounded-2xl mb-4" />
      <div className="flex justify-between items-center mb-4 mt-2">
        <div className="flex gap-2 overflow-x-auto">
          <Chip active={tab === "active"} onClick={() => setTab("active")}>
            진행 중인 모임{" "}
            {meetings.filter((m) => m.status === "active").length}
          </Chip>
          <Chip active={tab === "done"} onClick={() => setTab("done")}>
            종료된 모임 {meetings.filter((m) => m.status === "done").length}
          </Chip>
        </div>
      </div>

      {tab === "active" ? (
        <div className="flex flex-col gap-3.5">
          {list.map((m) => {
            const isPre = m.startDate > todayStr;
            return (
              <Link key={m.id} href={`/meetings/${m.id}`}>
                <div className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-[0_2px_10px_rgba(33,37,44,0.04)] active:scale-[0.99] transition-transform">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[20px] font-bold">{m.title}</span>
                    <Badge variant={isPre ? "outline" : "mintSoft"}>
                      {isPre ? "Pre-log" : "진행중"}
                    </Badge>
                  </div>
                  <div className="text-[16px] text-gray-500 mb-3">
                    {formatDateRange(m.startDate, m.endDate)} ·{" "}
                    {m.place || "장소 미정"}
                  </div>
                  <div className="flex justify-between items-center">
                    <AvatarStack
                      members={m.memberIds.map((uid) => ({
                        nickname: m.memberInfo[uid]?.nickname ?? "?",
                        photoURL: m.memberInfo[uid]?.photoURL,
                      }))}
                    />
                    <span className="text-[20px] font-semibold text-mint-500">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}

          <Link
            href="/join"
            className="block text-center text-[18px] font-semibold text-mint-500 mb-4"
          >
            초대 코드로 참여하기
          </Link>

          {list.length === 0 && (
            <div className="text-center py-16 text-gray-400 text-[20px]">
              {tab === "active"
                ? "+ 버튼으로 새 모임을 만들어보세요."
                : "아직 종료된 모임이 없어요."}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {list.map((m) => (
            <Link key={m.id} href={`/meetings/${m.id}`}>
              <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-[0_2px_10px_rgba(33,37,44,0.04)]">
                {" "}
                <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                  {" "}
                  {m.coverImage ? (
                    <img
                      src={m.coverImage}
                      alt={m.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="checker-bg w-full h-full" />
                  )}{" "}
                </div>{" "}
                <div className="p-2.5">
                  <Badge variant="success">기록완료</Badge>
                  <div className="text-[18px] font-bold mt-2 truncate">
                    {m.title}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    {formatDateRange(m.startDate, m.endDate)}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}

export default function HomePage() {
  return (
    <RequireAuth>
      <HomeContent />
    </RequireAuth>
  );
}
