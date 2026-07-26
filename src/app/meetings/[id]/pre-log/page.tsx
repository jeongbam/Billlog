"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import RequireAuth from "@/components/RequireAuth";
import {
  CalendarIcon,
  ChevronRightIcon,
  LinkIcon,
  PinIcon,
  XIcon,
} from "@/components/icons";
import { AvatarStack, Button, Card, Input } from "@/components/ui";
import { addPlanItem, deletePlanItem, subscribeMeeting, subscribePlanItems } from "@/lib/meetings";
import { dDay, formatDateRange } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import type { Meeting, PlanItem } from "@/types";

function PreLogContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [items, setItems] = useState<PlanItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newType, setNewType] = useState<"link" | "memo">("link");
  const [newTitle, setNewTitle] = useState("");
  const [newValue, setNewValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    const u1 = subscribeMeeting(id, setMeeting);
    const u2 = subscribePlanItems(id, setItems);
    return () => {
      u1();
      u2();
    };
  }, [id]);

  const canAdd = newTitle.trim().length > 0 && newValue.trim().length > 0;

  async function handleAdd() {
    if (!user || !canAdd) return;
    setSaving(true);
    try {
      await addPlanItem(id, {
        type: newType,
        title: newTitle.trim(),
        ...(newType === "link"
          ? { url: newValue.trim() }
          : { content: newValue.trim() }),
        createdBy: user.uid,
      });
      setNewTitle("");
      setNewValue("");
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  if (!meeting) return null;

  return (
    <AppShell backHref={`/meetings/${id}`} title="Pre-log" backLabel="모임 상세로 돌아가기">
      <div className="pt-1">
        <div className="bg-mint-50 border border-mint-100 rounded-2xl p-3.5 mb-4">
          <div className="text-[14px] font-bold text-mint-500">
            📌 모임까지 {dDay(meeting.startDate)}
          </div>
          <div className="text-[12px] text-gray-700 mt-1">
            일정 · 장소 · 준비물을 미리 정리해두면 Bill-log가 훨씬 빨라져요
          </div>
        </div>

        <div className="text-[11px] font-bold text-gray-500 uppercase mb-2">
          모임 정보
        </div>
        <Card className="mb-4">
          <div className="flex items-center gap-2 mb-2 text-gray-700">
            <CalendarIcon size={16} />
            <span className="text-[13.5px]">
              {formatDateRange(meeting.startDate, meeting.endDate)}
            </span>
          </div>
          <div className="flex items-center gap-2 mb-3 text-gray-700">
            <PinIcon size={16} />
            <span className="text-[13.5px]">{meeting.place || "장소 미정"}</span>
          </div>
          <AvatarStack
            members={meeting.memberIds.map((uid) => ({
              nickname: meeting.memberInfo[uid]?.nickname ?? "?",
              photoURL: meeting.memberInfo[uid]?.photoURL,
            }))}
          />
        </Card>

        <div className="flex justify-between items-center mb-2">
          <div className="text-[11px] font-bold text-gray-500 uppercase">계획</div>
          <button
            className="text-[11.5px] font-bold text-gray-400"
            onClick={() => setShowForm((v) => !v)}
          >
            {showForm ? "취소" : "+ 추가"}
          </button>
        </div>

        {showForm && (
          <Card className="mb-3">
            <div className="flex gap-2 mb-3">
              <button
                className={`flex-1 py-2 rounded-full text-[12.5px] font-semibold border ${
                  newType === "link"
                    ? "bg-mint-50 border-mint-300 text-mint-500"
                    : "border-gray-200 text-gray-500"
                }`}
                onClick={() => setNewType("link")}
              >
                링크
              </button>
              <button
                className={`flex-1 py-2 rounded-full text-[12.5px] font-semibold border ${
                  newType === "memo"
                    ? "bg-mint-50 border-mint-300 text-mint-500"
                    : "border-gray-200 text-gray-500"
                }`}
                onClick={() => setNewType("memo")}
              >
                메모
              </button>
            </div>
            <Input
              label="제목"
              placeholder="예) 식당 링크"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <Input
              label={newType === "link" ? "URL" : "내용"}
              placeholder={newType === "link" ? "https://..." : "메모를 입력해주세요"}
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
            />
            <Button onClick={handleAdd} loading={saving} disabled={!canAdd}>
              추가하기
            </Button>
          </Card>
        )}

        {items.length === 0 && !showForm && (
          <p className="text-[12.5px] text-gray-400 text-center py-6">
            아직 등록된 계획이 없어요.
          </p>
        )}

        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2.5 py-2.5 border-b border-gray-100">
            <div className="w-9 h-9 rounded-[10px] bg-gray-50 flex items-center justify-center text-gray-600 flex-none">
              <LinkIcon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13.5px] font-semibold">{item.title}</div>
              <div className="text-[11.5px] text-gray-500 truncate">
                {item.url || item.content}
              </div>
            </div>
            {item.url ? (
              <a href={item.url} target="_blank" rel="noreferrer">
                <ChevronRightIcon size={15} className="text-gray-300" />
              </a>
            ) : null}
            <button onClick={() => deletePlanItem(id, item.id)} className="text-gray-300">
              <XIcon size={15} />
            </button>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pb-7 pt-2 bg-white">
        <Button variant="secondary" onClick={() => router.push(`/meetings/${id}`)}>
          모임 상세로 돌아가기
        </Button>
      </div>
    </AppShell>
  );
}

export default function PreLogPage() {
  return (
    <RequireAuth>
      <PreLogContent />
    </RequireAuth>
  );
}
