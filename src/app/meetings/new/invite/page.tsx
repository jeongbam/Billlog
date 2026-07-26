"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import RequireAuth from "@/components/RequireAuth";
import { CheckCircleIcon, CopyIcon } from "@/components/icons";
import { Button } from "@/components/ui";
import { subscribeMeeting } from "@/lib/meetings";
import type { Meeting } from "@/types";

function InviteContent() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [copied, setCopied] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!id) return;
    return subscribeMeeting(id, setMeeting);
  }, [id]);

  const link = meeting
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/join/${meeting.joinCode}`
    : "";

  function handleCopy() {
    if (!link) return;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  if (done && meeting) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center text-center pt-24">
          <div className="w-[88px] h-[88px] rounded-full bg-mint-50 flex items-center justify-center mb-5">
            <CheckCircleIcon size={40} className="text-mint-500" />
          </div>
          <h1 className="text-[22px] font-bold">모임이 생성됐어요</h1>
          <p className="text-[14px] text-gray-500 mt-2 leading-relaxed">
            모임 상세에서 계획을 정리하거나
            <br />
            모임 당일 정산을 진행할 수 있어요
          </p>
          <div className="w-full bg-white border border-gray-100 rounded-2xl p-3.5 mt-7 text-left">
            <div className="text-[15px] font-bold">{meeting.title}</div>
            <div className="text-[12px] text-gray-500 mt-1">
              {meeting.place || "장소 미정"} · {meeting.memberIds.length}명 참여
            </div>
          </div>
        </div>
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pb-7 pt-2 bg-white">
          <Button onClick={() => router.push(`/meetings/${meeting.id}`)}>
            모임 상세로 이동
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell backHref="/home" title="친구 초대하기" backLabel="2 / 3">
      <div className="pt-2">
        <div className="h-1 bg-gray-100 rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-mint-300 w-2/3 rounded-full" />
        </div>

        <h2 className="text-[18px] font-bold leading-snug">
          {meeting?.title ?? "모임"}에
          <br />
          함께할 친구들을 초대해보세요
        </h2>

        <div className="bg-white border border-gray-100 rounded-2xl p-3.5 my-5 flex justify-between items-center">
          <div className="min-w-0">
            <div className="text-[12px] text-gray-500">초대 링크</div>
            <div className="text-[13.5px] font-semibold mt-1 truncate">{link}</div>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-[12px] font-bold border border-gray-200 rounded-full px-3.5 py-2 flex-none ml-2"
          >
            <CopyIcon size={14} />
            {copied ? "복사됨" : "복사"}
          </button>
        </div>

        <p className="text-[12px] text-gray-400 mb-2.5">참여 코드</p>
        <div className="bg-mint-50 border border-mint-100 rounded-2xl p-4 text-center text-[22px] font-bold tracking-[0.3em] text-mint-500">
          {meeting?.joinCode ?? "------"}
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pb-7 pt-2 bg-white">
        <Button onClick={() => setDone(true)}>다음</Button>
      </div>
    </AppShell>
  );
}

export default function InvitePage() {
  return (
    <RequireAuth>
      <Suspense fallback={null}>
        <InviteContent />
      </Suspense>
    </RequireAuth>
  );
}
