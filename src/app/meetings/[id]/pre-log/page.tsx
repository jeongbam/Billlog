"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import RequireAuth from "@/components/RequireAuth";
import {
  CalendarIcon,
  ChevronRightIcon,
  HeartIcon,
  LinkIcon,
  PinIcon,
  PushPinIcon,
  TrashIcon,
} from "@/components/icons";
import {
  AvatarStack,
  Badge,
  Button,
  Card,
  ConfirmModal,
  Input,
} from "@/components/ui";
import {
  addPlanItem,
  deletePlanItem,
  subscribeMeeting,
  subscribePlanItems,
  togglePlanItemLike,
  togglePlanItemPin,
} from "@/lib/meetings";
import { dDay, formatDateRange } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import {
  PLAN_ITEM_TAGS,
  type Meeting,
  type PlanItem,
  type PlanItemTag,
} from "@/types";

function PreLogContent() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [items, setItems] = useState<PlanItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newType, setNewType] = useState<"link" | "memo">("link");
  const [newTag, setNewTag] = useState<PlanItemTag>("restaurant");
  const [newTitle, setNewTitle] = useState("");
  const [newValue, setNewValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PlanItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const u1 = subscribeMeeting(id, setMeeting);
    const u2 = subscribePlanItems(id, setItems);
    return () => {
      u1();
      u2();
    };
  }, [id]);

  const isReadOnly = meeting?.status === "done";
  const canAdd = newTitle.trim().length > 0 && newValue.trim().length > 0;

  async function handleAdd() {
    if (!user || !canAdd || !meeting || isReadOnly) return;
    setSaving(true);
    try {
      await addPlanItem(
        id,
        {
          type: newType,
          title: newTitle.trim(),
          tag: newTag,
          ...(newType === "link"
            ? { url: newValue.trim() }
            : { content: newValue.trim() }),
          createdBy: user.uid,
        },
        meeting.memberIds,
        user.nickname,
      );
      setNewTitle("");
      setNewValue("");
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePlanItem(id, deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  async function handleTogglePin(item: PlanItem) {
    if (isReadOnly) return;
    await togglePlanItemPin(id, item.id, !item.pinned);
  }

  async function handleToggleLike(item: PlanItem) {
    if (!user || isReadOnly) return;
    const liked = item.likedBy.includes(user.uid);
    await togglePlanItemLike(id, item.id, user.uid, !liked);
  }

  const { pinned, sections } = useMemo(() => {
    const pinnedItems = items.filter((i) => i.pinned);
    const grouped = PLAN_ITEM_TAGS.map(({ value, label }) => ({
      tag: value,
      label,
      items: items.filter((i) => !i.pinned && i.tag === value),
    })).filter((s) => s.items.length > 0);
    return { pinned: pinnedItems, sections: grouped };
  }, [items]);

  if (!meeting) return null;

  return (
    <AppShell backHref={`/meetings/${id}`} title="Pre-log">
      <div className="pt-1">
        {isReadOnly ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 mb-4">
            <div className="text-[18px] font-bold text-gray-600">
              종료된 모임이에요
            </div>
            <div className="text-[16px] text-gray-500 mt-1">
              열람만 가능하며 새로운 계획은 등록할 수 없어요
            </div>
          </div>
        ) : (
          <div className="bg-mint-50 border border-mint-100 rounded-xl p-3.5 mb-4">
            <div className="text-[18px] font-bold text-mint-500">
              모임까지 {dDay(meeting.startDate)}
            </div>
            <div className="text-[16px] text-gray-700 mt-1">
              일정 · 장소 · 준비물을 미리 정리해보세요
            </div>
          </div>
        )}

        <div className="text-[18px] font-bold text-gray-500 uppercase mb-2">
          모임 정보
        </div>
        <Card className="mb-4">
          <div className="flex items-center gap-2 mb-2 text-gray-700">
            <CalendarIcon size={16} />
            <span className="text-[16px]">
              {formatDateRange(meeting.startDate, meeting.endDate)}
            </span>
          </div>
          <div className="flex items-center gap-2 mb-3 text-gray-700">
            <PinIcon size={16} />
            <span className="text-[16px]">{meeting.place || "장소 미정"}</span>
          </div>
          <AvatarStack
            members={meeting.memberIds.map((uid) => ({
              nickname: meeting.memberInfo[uid]?.nickname ?? "?",
              photoURL: meeting.memberInfo[uid]?.photoURL,
            }))}
          />
        </Card>

        <div className="text-[18px] font-bold text-gray-500 uppercase mb-2">
          계획
        </div>

        {showForm && !isReadOnly && (
          <Card className="mb-3">
            <div className="flex gap-2 mb-3">
              <button
                className={`flex-1 py-2 rounded-full text-[16px] font-semibold border ${
                  newType === "link"
                    ? "bg-mint-50 border-mint-300 text-mint-500"
                    : "border-gray-200 text-gray-500"
                }`}
                onClick={() => setNewType("link")}
              >
                링크
              </button>
              <button
                className={`flex-1 py-2 rounded-full text-[16px] font-semibold border ${
                  newType === "memo"
                    ? "bg-mint-50 border-mint-300 text-mint-500"
                    : "border-gray-200 text-gray-500"
                }`}
                onClick={() => setNewType("memo")}
              >
                메모
              </button>
            </div>

            <span className="block text-[16px] font-semibold text-gray-600 mb-1.5">
              태그
            </span>
            <div className="flex flex-wrap gap-1.5 mb-3.5">
              {PLAN_ITEM_TAGS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setNewTag(t.value)}
                  className={`px-3 py-1.5 rounded-full text-[15px] font-semibold border-[1.4px] ${
                    newTag === t.value
                      ? "bg-mint-50 border-mint-300 text-mint-500"
                      : "border-gray-200 text-gray-600"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <Input
              label="제목"
              placeholder="예) 식당 링크"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <Input
              label={newType === "link" ? "URL" : "내용"}
              placeholder={
                newType === "link" ? "https://..." : "메모를 입력해주세요"
              }
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

        {pinned.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <PushPinIcon size={15} className="text-mint-500" />
              <span className="text-[16px] font-bold text-mint-500">
                고정됨
              </span>
            </div>
            {pinned.map((item) => (
              <PlanItemRow
                key={item.id}
                item={item}
                readOnly={isReadOnly}
                currentUid={user?.uid}
                onDelete={() => setDeleteTarget(item)}
                onTogglePin={() => handleTogglePin(item)}
                onToggleLike={() => handleToggleLike(item)}
              />
            ))}
          </div>
        )}

        {sections.map((section) => (
          <div key={section.tag} className="mb-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Badge variant="mintSoft">{section.label}</Badge>
              <span className="text-[14px] text-gray-400">
                {section.items.length}개
              </span>
            </div>
            {section.items.map((item) => (
              <PlanItemRow
                key={item.id}
                item={item}
                readOnly={isReadOnly}
                currentUid={user?.uid}
                onDelete={() => setDeleteTarget(item)}
                onTogglePin={() => handleTogglePin(item)}
                onToggleLike={() => handleToggleLike(item)}
              />
            ))}
          </div>
        ))}
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="계획을 삭제하시겠습니까?"
        description={
          deleteTarget ? `"${deleteTarget.title}"을(를) 삭제해요.` : undefined
        }
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {!isReadOnly && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pb-7 pt-2 bg-white">
          <Button
            variant={showForm ? "secondary" : "primary"}
            onClick={() => setShowForm((v) => !v)}
          >
            {showForm ? "취소" : "+ 계획 추가"}
          </Button>
        </div>
      )}
    </AppShell>
  );
}

function PlanItemRow({
  item,
  readOnly,
  currentUid,
  onDelete,
  onTogglePin,
  onToggleLike,
}: {
  item: PlanItem;
  readOnly: boolean;
  currentUid?: string;
  onDelete: () => void;
  onTogglePin: () => void;
  onToggleLike: () => void;
}) {
  const liked = !!currentUid && item.likedBy.includes(currentUid);
  return (
    <div className="flex items-center gap-2.5 py-2.5 border-b border-gray-100">
      <div className="w-10 h-10 rounded-[10px] bg-gray-50 flex items-center justify-center text-gray-600 flex-none">
        <LinkIcon size={22} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[18px] font-semibold">{item.title}</div>
        <div className="text-[16px] text-gray-500 truncate">
          {item.url || item.content}
        </div>
      </div>
      {item.url ? (
        <a href={item.url} target="_blank" rel="noreferrer">
          <ChevronRightIcon size={21} className="text-gray-300" />
        </a>
      ) : null}
      <button
        onClick={onToggleLike}
        disabled={readOnly}
        className={`flex items-center gap-1 disabled:opacity-40 ${
          liked ? "text-error" : "text-gray-300"
        }`}
        aria-label="좋아요"
      >
        <HeartIcon size={20} filled={liked} />
        {item.likedBy.length > 0 && (
          <span className="text-[13px] font-semibold">
            {item.likedBy.length}
          </span>
        )}
      </button>
      {!readOnly && (
        <button
          onClick={onTogglePin}
          className={item.pinned ? "text-mint-500" : "text-gray-300"}
          aria-label="고정핀"
        >
          <PushPinIcon size={20} />
        </button>
      )}
      {!readOnly && (
        <button onClick={onDelete} className="text-gray-300" aria-label="삭제">
          <TrashIcon size={20} />
        </button>
      )}
    </div>
  );
}

export default function PreLogPage() {
  return (
    <RequireAuth>
      <PreLogContent />
    </RequireAuth>
  );
}
