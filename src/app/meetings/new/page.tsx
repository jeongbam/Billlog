"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import RequireAuth from "@/components/RequireAuth";
import { ImageIcon } from "@/components/icons";
import { Button, Input } from "@/components/ui";
import { createMeeting, updateMeetingCover } from "@/lib/meetings";
import { uploadImage } from "@/lib/storage";
import { useAuthStore } from "@/store/useAuthStore";

function NewMeetingContent() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [place, setPlace] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit =
    title.trim().length > 0 && !!startDate && !!endDate && endDate >= startDate;

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  function handleStartChange(value: string) {
    setStartDate(value);
    if (endDate && endDate < value) setEndDate(value);
  }

  async function handleNext() {
    if (!user || !canSubmit) return;
    setError("");
    setLoading(true);
    try {
      const meetingId = await createMeeting(
        {
          title: title.trim(),
          startDate,
          endDate,
          place: place.trim(),
          coverImage: null,
        },
        user,
      );
      if (coverFile) {
        const url = await uploadImage(`meetings/${meetingId}/cover`, coverFile);
        await updateMeetingCover(meetingId, url);
      }
      router.push(`/meetings/new/invite?id=${meetingId}`);
    } catch {
      setError("모임을 만드는 중 문제가 발생했어요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell backHref="/home" title="모임 만들기" backLabel="1 / 3">
      <div className="pt-2">
        <div className="h-1 bg-gray-100 rounded-full mb-5 overflow-hidden">
          <div className="h-full bg-mint-300 w-1/3 rounded-full" />
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCoverChange}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full aspect-[16/9] rounded-xl mb-5 flex flex-col items-center justify-center gap-1.5 text-gray-400 overflow-hidden"
          style={
            coverPreview
              ? {
                  backgroundImage: `url(${coverPreview})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          {!coverPreview && (
            <div className="bg-gray-50 border-[1.5px] border-dashed border-gray-300 w-full h-full rounded-xl flex flex-col items-center justify-center gap-1.5">
              <ImageIcon size={22} />
              <span className="text-[16px]">커버 이미지 추가 (선택)</span>
            </div>
          )}
        </button>

        <Input
          label="모임명"
          placeholder="예) 종강 회식"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              label="시작일"
              type="date"
              value={startDate}
              onChange={(e) => handleStartChange(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Input
              label="종료일"
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <Input
          label="장소"
          placeholder="장소를 입력해주세요"
          value={place}
          onChange={(e) => setPlace(e.target.value)}
        />

        {error && <p className="text-[12.5px] text-error-d mb-2">{error}</p>}

        <div className="text-center mt-2">
          <Link
            href="/join"
            className="text-[16px] text-gray-400 font-semibold"
          >
            이미 초대받았나요? 코드로 참여하기
          </Link>
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pb-7 pt-2 bg-white">
        <Button onClick={handleNext} loading={loading} disabled={!canSubmit}>
          다음
        </Button>
      </div>
    </AppShell>
  );
}

export default function NewMeetingPage() {
  return (
    <RequireAuth>
      <NewMeetingContent />
    </RequireAuth>
  );
}
