"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { subscribePhotos, subscribeReviews } from "@/lib/meetings";
import { subscribeReceipts } from "@/lib/receipts";
import { formatCurrency, formatDateRange } from "@/lib/utils";
import type { Meeting, Photo, Receipt, Review } from "@/types";
import { Badge } from "./ui";

export function EndedMeetingCard({ meeting }: { meeting: Meeting }) {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const u1 = subscribeReceipts(meeting.id, setReceipts);
    const u2 = subscribePhotos(meeting.id, setPhotos);
    const u3 = subscribeReviews(meeting.id, setReviews);
    return () => {
      u1();
      u2();
      u3();
    };
  }, [meeting.id]);

  const total = receipts.reduce((sum, r) => sum + r.total, 0);

  return (
    <div className="bg-mint-900 rounded-xl overflow-hidden shadow-[0_2px_10px_rgba(33,37,44,0.08)]">
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={meeting.coverImage || "/default.png"}
          alt={meeting.title}
          fill
          className="object-cover opacity-90"
          sizes="(max-width: 768px) 100vw, 400px"
        />
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="text-gray text-[18px] font-bold truncate flex-1 min-w-0">
            {meeting.title}
          </div>
          <div className="flex-none">
            <Badge variant="mint">완료</Badge>
          </div>
        </div>
        <div className="text-gray-400 text-[14px] mt-1">
          {formatDateRange(meeting.startDate, meeting.endDate)}
        </div>

        <div className="border-t border-white/10 my-2.5" />

        <div className="grid grid-cols-2 gap-x-3 gap-y-3">
          <Stat label="참여 인원" value={`${meeting.memberIds.length}명`} />
          <Stat label="총 사용금액" value={formatCurrency(total)} accent />
          <Stat label="사진" value={`${photos.length}장`} />
          <Stat label="후기" value={`${reviews.length}개`} />
        </div>
      </div>
    </div>
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
    <div className="min-w-0">
      <div className="text-[11px] font-bold text-gray-400 truncate">
        {label}
      </div>
      <div
        className={`text-[16px] font-bold mt-1 truncate ${
          accent ? "text-mint-300" : "text-mint-300"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
