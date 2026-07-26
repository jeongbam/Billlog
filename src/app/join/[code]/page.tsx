"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import RequireAuth from "@/components/RequireAuth";
import { Button } from "@/components/ui";
import { joinMeetingByCode } from "@/lib/meetings";
import { useAuthStore } from "@/store/useAuthStore";

function JoinContent() {
  const router = useRouter();
  const params = useParams<{ code: string }>();
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleJoin() {
    if (!user) return;
    setError("");
    setLoading(true);
    try {
      const meetingId = await joinMeetingByCode(params.code, user);
      if (meetingId) {
        router.replace(`/meetings/${meetingId}`);
      } else {
        setError("유효하지 않은 초대 코드예요. 링크를 다시 확인해주세요.");
      }
    } catch {
      setError("문제가 발생했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell backHref="/home" title="모임 참여">
      <div className="flex flex-col items-center justify-center pt-20 text-center">
        <p className="text-[14px] text-gray-600 mb-3">초대받은 모임의 코드예요</p>
        <div className="w-full bg-mint-50 border border-mint-100 rounded-2xl p-4 text-center text-[22px] font-bold tracking-[0.3em] text-mint-500 mb-4">
          {params.code?.toUpperCase()}
        </div>
        {error && <p className="text-[12.5px] text-error-d mb-2">{error}</p>}
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pb-7 pt-2 bg-white">
        <Button onClick={handleJoin} loading={loading}>
          이 모임에 참여하기
        </Button>
      </div>
    </AppShell>
  );
}

export default function JoinPage() {
  return (
    <RequireAuth>
      <JoinContent />
    </RequireAuth>
  );
}
