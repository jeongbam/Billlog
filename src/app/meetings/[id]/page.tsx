"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import RequireAuth from "@/components/RequireAuth";
import {
  CalendarIcon,
  ChevronRightIcon,
  ImageIcon,
  PinIcon,
  ReceiptIcon,
} from "@/components/icons";
import { AvatarStack, Badge, Spinner } from "@/components/ui";
import {
  deleteMeeting,
  subscribeMeeting,
  subscribePhotos,
  subscribePlanItems,
  subscribeReviews,
} from "@/lib/meetings";
import { subscribeReceipts, subscribeSettlements } from "@/lib/receipts";
import { formatDateRange } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import type {
  Meeting,
  PlanItem,
  Photo,
  Review,
  Receipt,
  Settlement,
} from "@/types";

function MeetingHubContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [meeting, setMeeting] = useState<Meeting | null | undefined>(undefined);
  const [planItems, setPlanItems] = useState<PlanItem[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showMembers, setShowMembers] = useState(false);

  useEffect(() => {
    if (!id) return;
    const unsubs = [
      subscribeMeeting(id, setMeeting),
      subscribePlanItems(id, setPlanItems),
      subscribeReceipts(id, setReceipts),
      subscribeSettlements(id, setSettlements),
      subscribePhotos(id, setPhotos),
      subscribeReviews(id, setReviews),
    ];
    return () => unsubs.forEach((u) => u());
  }, [id]);

  if (meeting === undefined) {
    return (
      <AppShell backHref="/home">
        <div className="flex justify-center pt-24">
          <Spinner />
        </div>
      </AppShell>
    );
  }
  if (meeting === null) {
    return (
      <AppShell backHref="/home" title="모임 상세">
        <p className="text-center text-gray-400 text-[20px] pt-24">
          모임을 찾을 수 없어요.
        </p>
      </AppShell>
    );
  }

  const totalAmount = receipts.reduce((sum, r) => sum + r.total, 0);
  const paidCount = settlements.filter((s) => s.status === "paid").length;
  const totalSettlements = settlements.length;

  const preStatus =
    planItems.length > 0
      ? { text: "작성완료", variant: "success" as const }
      : { text: "작성 전", variant: "outline" as const };

  const billStatus =
    receipts.length === 0
      ? { text: "정산 전", variant: "outline" as const }
      : paidCount === totalSettlements && totalSettlements > 0
        ? { text: "정산완료", variant: "success" as const }
        : {
            text: `진행중 ${paidCount}/${totalSettlements}`,
            variant: "mint" as const,
          };

  const postStatus =
    meeting.status === "done"
      ? { text: "완료", variant: "success" as const }
      : photos.length > 0 || reviews.length > 0
        ? { text: "기록중", variant: "mintSoft" as const }
        : { text: "기록 전", variant: "outline" as const };

  const members = meeting.memberIds.map((uid) => ({
    uid,
    nickname: meeting.memberInfo[uid]?.nickname ?? "?",
    photoURL: meeting.memberInfo[uid]?.photoURL,
  }));

  async function handleDelete() {
    if (!meeting) return;
    if (meeting.ownerId !== user?.uid) return;
    if (window.confirm("모임을 삭제할까요? 되돌릴 수 없어요.")) {
      await deleteMeeting(meeting.id);
      router.push("/home");
    }
  }

  return (
    <AppShell backHref="/home" title="모임 상세">
      <div className="pt-1">
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden mb-4">
          <div
            className="checker-bg aspect-[16/8]"
            style={
              meeting.coverImage
                ? {
                    backgroundImage: `url(${meeting.coverImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
          />
          <div className="p-3.5">
            <div className="flex justify-between items-start">
              <div className="text-[20px] font-bold">{meeting.title}</div>
              {meeting.ownerId === user?.uid && (
                <button
                  onClick={handleDelete}
                  className="text-[14px] text-gray-400 border border-gray-200 rounded-full px-2.5 py-1"
                >
                  삭제
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2 text-gray-600">
              <CalendarIcon size={15} />
              <span className="text-[18px]">
                {formatDateRange(meeting.startDate, meeting.endDate)}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-gray-600">
              <PinIcon size={15} />
              <span className="text-[18px]">
                {meeting.place || "장소 미정"}
              </span>
            </div>
            <button
              onClick={() => setShowMembers((v) => !v)}
              className="flex justify-between items-center mt-2.5 w-full"
            >
              <AvatarStack members={members} />
              <span className="text-[16px] font-bold text-mint-500">
                멤버 보기
              </span>
            </button>
            {showMembers && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {members.map((m) => (
                  <span
                    key={m.uid}
                    className="text-[16px] bg-gray-50 px-2.5 py-1 rounded-full text-gray-600"
                  >
                    {m.nickname}
                    {m.uid === meeting.ownerId && " · 모임장"}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="text-[11px] font-bold tracking-wide text-gray-500 uppercase mb-2">
          이 모임의 기록
        </div>

        {meeting.status === "active" ? (
          <Link href={`/meetings/${meeting.id}/pre-log`}>
            <SectionRow
              icon={<CalendarIcon size={24} />}
              title="Pre-log"
              badge={preStatus}
              desc={
                planItems.length > 0
                  ? `계획 ${planItems.length}개 등록됨`
                  : "일정∙장소∙준비물을 미리 정리해요"
              }
            />
          </Link>
        ) : (
          <div className="opacity-50 cursor-not-allowed">
            <SectionRow
              icon={<CalendarIcon size={24} />}
              title="Pre-log"
              badge={preStatus}
              desc="모임이 종료되었습니다."
            />
          </div>
        )}
        {meeting.status === "active" ? (
          <Link href={`/meetings/${meeting.id}/bill-log`}>
            <SectionRow
              icon={<ReceiptIcon size={24} />}
              title="Bill-log"
              badge={billStatus}
              desc={
                receipts.length > 0
                  ? `영수증 ${receipts.length}건 · 총 ${totalAmount.toLocaleString()}원`
                  : "영수증으로 정산해요"
              }
            />
          </Link>
        ) : (
          <div className="opacity-50 cursor-not-allowed">
            <SectionRow
              icon={<ReceiptIcon size={24} />}
              title="Bill-log"
              badge={billStatus}
              desc="모임이 종료되었습니다."
            />
          </div>
        )}
        <Link href={`/meetings/${meeting.id}/post-log`}>
          <SectionRow
            icon={<ImageIcon size={21} />}
            title="Post-log"
            badge={postStatus}
            desc="사진과 후기를 남기면 모임 카드가 완성돼요"
          />
        </Link>
      </div>
    </AppShell>
  );
}

function SectionRow({
  icon,
  title,
  badge,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  badge: { text: string; variant: "success" | "outline" | "mint" | "mintSoft" };
  desc: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`group flex items-center gap-3 p-4 rounded-[18px] border-[1.4px] mb-3 transition-all duration-150
    bg-white border-gray-100
    hover:bg-mint-50 hover:border-mint-200
    active:bg-mint-50 active:border-mint-200`}
    >
      <div
        className="w-[46px] h-[46px] rounded-[13px]
  flex items-center justify-center flex-none
  bg-gray-50 text-gray-700
  transition-colors
  group-hover:bg-white group-hover:text-mint-500
  group-active:bg-white group-active:text-mint-500"
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[18px] font-bold">{title}</span>
          <Badge variant={badge.variant}>{badge.text}</Badge>
        </div>
        <div className="text-[14px] text-gray-500 mt-0.5 truncate">{desc}</div>
      </div>
      <ChevronRightIcon size={21} className="text-gray-300 flex-none" />
    </div>
  );
}

export default function MeetingHubPage() {
  return (
    <RequireAuth>
      <MeetingHubContent />
    </RequireAuth>
  );
}
