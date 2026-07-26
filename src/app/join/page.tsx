"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import RequireAuth from "@/components/RequireAuth";
import { Button } from "@/components/ui";
import { joinMeetingByCode } from "@/lib/meetings";
import { useAuthStore } from "@/store/useAuthStore";

function JoinEntryContent() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = code.trim().length >= 4;

  async function handleJoin() {
    if (!user || !canSubmit) return;
    setError("");
    setLoading(true);
    try {
      const meetingId = await joinMeetingByCode(code, user);
      if (meetingId) {
        router.push(`/meetings/${meetingId}`);
      } else {
        setError("유효하지 않은 초대 코드예요. 다시 확인해주세요.");
      }
    } catch {
      setError("문제가 발생했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell backHref="/home" title="초대 코드로 참여">
      <div className="pt-4">
        <h1 className="text-[18px] font-bold mb-1.5">
          참여 코드를 입력해주세요
        </h1>
        <p className="text-[17px] text-gray-500 mb-6">
          모임장에게 받은 6자리 코드를 입력하면 바로 참여돼요
        </p>

        <input
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError("");
          }}
          maxLength={8}
          placeholder="예) XK29FQ"
          className="w-full bg-mint-50 border border-mint-100 rounded-xl p-4 text-center text-[22px] font-bold tracking-[0.3em] text-mint-500 outline-none focus:ring-4 focus:ring-mint-100"
        />
        {error && (
          <p className="text-[12.5px] text-error-d mt-3 text-center">{error}</p>
        )}
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pb-7 pt-2 bg-white">
        <Button onClick={handleJoin} loading={loading} disabled={!canSubmit}>
          참여하기
        </Button>
      </div>
    </AppShell>
  );
}

export default function JoinEntryPage() {
  return (
    <RequireAuth>
      <JoinEntryContent />
    </RequireAuth>
  );
}
