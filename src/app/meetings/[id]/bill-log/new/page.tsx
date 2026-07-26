"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import RequireAuth from "@/components/RequireAuth";
import { XIcon } from "@/components/icons";
import { Avatar, Button, Card, Chip } from "@/components/ui";
import { subscribeMeeting } from "@/lib/meetings";
import { computeEqualSplit, createReceipt } from "@/lib/receipts";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import type { Meeting, ReceiptItem, SplitMethod } from "@/types";

function blankItem(): ReceiptItem {
  return { id: crypto.randomUUID(), name: "", amount: 0 };
}

function WizardContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [step, setStep] = useState(1);
  const [items, setItems] = useState<ReceiptItem[]>([blankItem()]);
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const [splitMethod, setSplitMethod] = useState<SplitMethod>("equal");
  const [splits, setSplits] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    return subscribeMeeting(id, (m) => {
      setMeeting(m);
      if (m && user) setParticipantIds(m.memberIds);
    });
  }, [id, user]);

  const total = items.reduce((s, it) => s + it.amount, 0);
  const itemsValid =
    items.length > 0 && items.every((it) => it.name.trim() && it.amount > 0);

  function updateItemName(itemId: string, name: string) {
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, name } : it)),
    );
  }
  function updateItemAmount(itemId: string, amount: number) {
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, amount } : it)),
    );
  }
  function addManualItem() {
    setItems((prev) => [...prev, blankItem()]);
  }
  function removeItem(itemId: string) {
    setItems((prev) =>
      prev.length > 1 ? prev.filter((it) => it.id !== itemId) : prev,
    );
  }

  function toggleParticipant(uid: string) {
    setParticipantIds((prev) =>
      prev.includes(uid) ? prev.filter((p) => p !== uid) : [...prev, uid],
    );
  }

  function goStep2() {
    setSplits(computeEqualSplit(total, participantIds));
    setStep(2);
  }

  function goStep3() {
    setSplits((prev) => {
      if (splitMethod === "equal")
        return computeEqualSplit(total, participantIds);
      return prev;
    });
    setStep(3);
  }

  async function handleSubmit() {
    if (!meeting || !user) return;
    setSubmitting(true);
    try {
      await createReceipt(
        id,
        {
          items,
          total,
          participantIds,
          splitMethod,
          splits,
          payerId: user.uid,
        },
        user.uid,
        (uid) => meeting.memberInfo[uid]?.nickname ?? "멤버",
      );
      router.push(`/meetings/${id}/bill-log`);
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    router.push(`/meetings/${id}/bill-log`);
  }

  if (!meeting || !user) return null;

  const members = meeting.memberIds.map((uid) => ({
    uid,
    nickname: meeting.memberInfo[uid]?.nickname ?? "?",
    photoURL: meeting.memberInfo[uid]?.photoURL,
  }));

  return (
    <AppShell>
      <div className="flex items-center justify-between pt-1 mb-1">
        <button
          onClick={() => (step > 1 ? setStep(step - 1) : handleClose())}
          className="text-[13px] font-semibold text-gray-500"
        >
          ‹ {step > 1 ? "이전" : "취소"}
        </button>
        <span className="text-[15.5px] font-bold">영수증 추가</span>
        <button onClick={handleClose} className="text-gray-500">
          <XIcon size={20} />
        </button>
      </div>

      <div className="flex gap-1 my-3">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`flex-1 h-1 rounded-full ${
              s < step
                ? "bg-mint-300"
                : s === step
                  ? "bg-mint-500"
                  : "bg-gray-100"
            }`}
          />
        ))}
      </div>

      {step === 1 && (
        <div>
          <p className="text-[12px] font-bold text-mint-500 mb-1">
            1 / 3 · 항목 입력
          </p>
          <h2 className="text-[18px] font-bold mb-4">
            얼마를 썼는지 입력해주세요
          </h2>

          {items.map((it) => (
            <div
              key={it.id}
              className="flex items-center gap-3 px-4 py-4 border-[1.4px] border-gray-100 rounded-2xl mb-2.5"
            >
              <input
                className="flex-1 text-[14.5px] font-medium outline-none min-w-0"
                placeholder="항목 이름 (예: 삼겹살 2인분)"
                value={it.name}
                onChange={(e) => updateItemName(it.id, e.target.value)}
              />
              <input
                type="number"
                inputMode="numeric"
                placeholder="0"
                className="w-24 text-right text-[14.5px] font-bold outline-none"
                value={it.amount || ""}
                onChange={(e) =>
                  updateItemAmount(it.id, Number(e.target.value) || 0)
                }
              />
              <button
                onClick={() => removeItem(it.id)}
                disabled={items.length === 1}
                className="text-gray-400 disabled:opacity-30"
              >
                <XIcon size={14} />
              </button>
            </div>
          ))}

          <button
            onClick={addManualItem}
            className="w-full py-3 rounded-xl border-[1.4px] border-dashed border-gray-300 text-gray-500 text-[13px] font-semibold mb-4"
          >
            + 항목 추가
          </button>

          <div className="bg-gray-900 rounded-2xl px-4 py-4 flex justify-between items-center mb-5">
            <span className="text-white text-[15px] font-bold">합계</span>
            <span className="text-white text-[19px] font-bold">
              {formatCurrency(total)}
            </span>
          </div>

          <Button onClick={goStep2} disabled={!itemsValid}>
            다음 · 인원 태그
          </Button>
        </div>
      )}

      {step === 2 && (
        <div>
          <p className="text-[12px] font-bold text-mint-500 mb-1">
            2 / 3 · 인원 태그 &amp; 정산 방식
          </p>
          <h2 className="text-[18px] font-bold mb-3.5">누구와 나눌까요?</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {members.map((m) => (
              <Chip
                key={m.uid}
                active={participantIds.includes(m.uid)}
                onClick={() => toggleParticipant(m.uid)}
              >
                👤 {m.nickname}
              </Chip>
            ))}
          </div>

          <div className="text-[11px] font-bold text-gray-500 uppercase mb-2">
            정산 방식
          </div>
          <div className="flex gap-2 mb-4">
            <button
              className={`flex-1 py-2.5 rounded-full text-[13px] font-semibold border-[1.4px] ${
                splitMethod === "equal"
                  ? "bg-mint-50 border-mint-300 text-mint-500"
                  : "border-gray-200 text-gray-600"
              }`}
              onClick={() => setSplitMethod("equal")}
            >
              N분의 1
            </button>
            <button
              className={`flex-1 py-2.5 rounded-full text-[13px] font-semibold border-[1.4px] ${
                splitMethod === "custom"
                  ? "bg-mint-50 border-mint-300 text-mint-500"
                  : "border-gray-200 text-gray-600"
              }`}
              onClick={() => {
                setSplitMethod("custom");
                setSplits((prev) =>
                  Object.keys(prev).length
                    ? prev
                    : computeEqualSplit(total, participantIds),
                );
              }}
            >
              금액 직접입력
            </button>
          </div>

          <div className="text-[11px] font-bold text-gray-500 uppercase mb-2">
            인당 정산 금액 ({participantIds.length}명)
          </div>
          <Card>
            {participantIds.map((uid, i) => {
              const m = members.find((mm) => mm.uid === uid);
              const equalSplit = computeEqualSplit(total, participantIds);
              const amount =
                splitMethod === "equal"
                  ? (equalSplit[uid] ?? 0)
                  : (splits[uid] ?? 0);
              return (
                <div
                  key={uid}
                  className={`flex items-center gap-2.5 py-2.5 ${
                    i < participantIds.length - 1
                      ? "border-b border-gray-100"
                      : ""
                  }`}
                >
                  <Avatar nickname={m?.nickname ?? "?"} size="sm" />
                  <div className="flex-1 text-[13.5px] font-semibold">
                    {m?.nickname}
                  </div>
                  {splitMethod === "custom" ? (
                    <input
                      type="number"
                      value={amount || ""}
                      onChange={(e) =>
                        setSplits((prev) => ({
                          ...prev,
                          [uid]: Number(e.target.value) || 0,
                        }))
                      }
                      className="w-24 text-right text-[13.5px] font-bold outline-none border-b border-gray-200"
                    />
                  ) : (
                    <span className="text-[13.5px] font-bold">
                      {formatCurrency(amount)}
                    </span>
                  )}
                </div>
              );
            })}
          </Card>

          <div className="mt-4">
            <Button onClick={goStep3} disabled={participantIds.length === 0}>
              다음 · 요청 검토
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <p className="text-[12px] font-bold text-mint-500 mb-1">
            3 / 3 · 최종 확인
          </p>
          <h2 className="text-[18px] font-bold mb-3.5">
            이대로 정산을 요청할까요?
          </h2>
          <Card className="mb-3.5">
            <Row label="영수증" value={`1건 · ${items.length}항목`} />
            <Row label="총 사용 금액" value={formatCurrency(total)} bold />
            <Row
              label="정산 방식"
              value={`${splitMethod === "equal" ? "N분의 1" : "직접 입력"} · ${participantIds.length}명`}
            />
          </Card>

          <div className="text-[11px] font-bold text-gray-500 uppercase mb-2">
            정산 요청 받을 사람
          </div>
          <Card>
            {participantIds
              .filter((uid) => uid !== user.uid)
              .map((uid, i, arr) => {
                const m = members.find((mm) => mm.uid === uid);
                return (
                  <div
                    key={uid}
                    className={`flex items-center gap-2.5 py-2.5 ${
                      i < arr.length - 1 ? "border-b border-gray-100" : ""
                    }`}
                  >
                    <Avatar nickname={m?.nickname ?? "?"} size="sm" />
                    <div className="flex-1 text-[13.5px] font-semibold">
                      {m?.nickname}
                    </div>
                    <span className="text-[13.5px] font-bold">
                      {formatCurrency(splits[uid] ?? 0)}
                    </span>
                  </div>
                );
              })}
          </Card>

          <div className="mt-4">
            <Button onClick={handleSubmit} loading={submitting}>
              정산 요청 보내고 Bill-log 홈으로
            </Button>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-[12px] text-gray-500">{label}</span>
      <span className={`text-[13.5px] ${bold ? "font-bold" : "font-semibold"}`}>
        {value}
      </span>
    </div>
  );
}

export default function BillLogWizardPage() {
  return (
    <RequireAuth>
      <WizardContent />
    </RequireAuth>
  );
}
