"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import RequireAuth from "@/components/RequireAuth";
import { Badge, Button } from "@/components/ui";
import {
  endMeeting,
  subscribeMeeting,
  subscribePhotos,
  subscribeReviews,
} from "@/lib/meetings";
import { subscribeReceipts } from "@/lib/receipts";
import { formatCurrency, formatDateRange } from "@/lib/utils";
import type { Meeting, Photo, Receipt, Review } from "@/types";
import Image from "next/image";

function SummaryContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    if (!id) return;
    const u1 = subscribeMeeting(id, setMeeting);
    const u2 = subscribePhotos(id, setPhotos);
    const u3 = subscribeReviews(id, setReviews);
    const u4 = subscribeReceipts(id, setReceipts);
    return () => {
      u1();
      u2();
      u3();
      u4();
    };
  }, [id]);

  if (!meeting) return null;

  const total = receipts.reduce((s, r) => s + r.total, 0);
  const isDone = meeting.status === "done";

  async function handleEnd() {
    setEnding(true);
    try {
      await endMeeting(id);
    } finally {
      setEnding(false);
    }
  }

  async function handleShare() {
    const url = `${window.location.origin}/meetings/${id}/summary`;
    if (navigator.share) {
      navigator.share({ title: meeting!.title, url }).catch(() => null);
    } else {
      await navigator.clipboard.writeText(url);
      alert("링크가 복사됐어요.");
    }
  }

  return (
    <AppShell
      backHref={`/meetings/${id}`}
      title={isDone ? "모임 요약" : "모임 종료"}
    >
      <div className="pt-1 flex flex-col items-center">
        <p className="text-[16px] text-gray-500 mb-4">
          {isDone
            ? "모든 기록이 완료됐어요"
            : "종료하면 아래처럼 카드가 저장돼요"}
        </p>

        <div className="w-full bg-gray-900 rounded-xl overflow-hidden">
          <div className="relative aspect-[16/8] overflow-hidden">
            <Image
              src={meeting.coverImage || "/default.png"}
              alt={meeting.title}
              fill
              className="object-cover opacity-90"
              sizes="100vw"
            />
          </div>
          <div className="p-[18px]">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-white text-[20px] font-bold">
                  {meeting.title}
                </div>
                <div className="text-gray-400 text-[11.5px] mt-1">
                  {formatDateRange(meeting.startDate, meeting.endDate)}
                </div>
              </div>
              <Badge variant="mint">{isDone ? "완료" : "진행중"}</Badge>
            </div>
            <div className="border-t border-white/10 my-3.5" />
            <div className="grid grid-cols-2 gap-2.5">
              <Stat label="참여 인원" value={`${meeting.memberIds.length}명`} />
              <Stat label="총 사용금액" value={formatCurrency(total)} accent />
              <Stat label="사진" value={`${photos.length}장`} />
              <Stat label="후기" value={`${reviews.length}개`} />
            </div>
          </div>
        </div>

        <p className="text-[16px] text-gray-500 mt-4 text-center leading-relaxed">
          이 카드는 홈의 <b className="text-gray-800">종료된 모임</b>에
          <br />
          차곡차곡 저장돼요
        </p>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pb-7 pt-2 bg-white flex gap-2">
        {isDone ? (
          <>
            <Button
              variant="secondary"
              onClick={handleShare}
              className="flex-1"
            >
              공유하기
            </Button>
            <Button onClick={() => router.push("/home")} className="flex-1">
              홈으로
            </Button>
          </>
        ) : (
          <Button onClick={handleEnd} loading={ending}>
            모임 종료하고 기록 완성하기
          </Button>
        )}
      </div>
    </AppShell>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <div className="text-[10px] text-gray-400">{label}</div>
      <div
        className={`text-[16px] font-bold mt-0.5 ${accent ? "text-mint-200" : "text-white"}`}
      >
        {value}
      </div>
    </div>
  );
}

export default function SummaryPage() {
  return (
    <RequireAuth>
      <SummaryContent />
    </RequireAuth>
  );
}
