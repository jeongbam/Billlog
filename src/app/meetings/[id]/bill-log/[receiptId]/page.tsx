"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import RequireAuth from "@/components/RequireAuth";
import { Avatar, Badge, Card } from "@/components/ui";
import { subscribeMeeting } from "@/lib/meetings";
import { subscribeReceipt } from "@/lib/receipts";
import { dayLabel, formatCurrency } from "@/lib/utils";
import type { Meeting, Receipt } from "@/types";

function ReceiptDetailContent() {
  const { id, receiptId } = useParams<{ id: string; receiptId: string }>();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null | undefined>(undefined);

  useEffect(() => {
    if (!id) return;
    return subscribeMeeting(id, setMeeting);
  }, [id]);

  useEffect(() => {
    if (!id || !receiptId) return;
    return subscribeReceipt(id, receiptId, setReceipt);
  }, [id, receiptId]);

  if (!meeting || receipt === undefined) return null;

  const nickname = (uid: string) =>
    meeting.memberInfo[uid]?.nickname ?? "알 수 없음";

  if (!receipt) {
    return (
      <AppShell backHref={`/meetings/${id}/bill-log`} title="영수증">
        <p className="text-center text-[20px] text-gray-400 py-16">
          삭제되었거나 존재하지 않는 영수증이에요.
        </p>
      </AppShell>
    );
  }

  return (
    <AppShell backHref={`/meetings/${id}/bill-log`} title="영수증">
      <div className="pt-1">
        <Badge variant="outline">
          {dayLabel(meeting.startDate, receipt.createdAt)}
        </Badge>
        <h1 className="text-[24px] font-bold mt-5 mb-2">
          {receipt.title || "영수증"}
        </h1>
        <div className="flex items-center gap-2 text-gray-500 text-[16px] mb-5">
          <Avatar nickname={nickname(receipt.payerId)} size="sm" />
          <span>{nickname(receipt.payerId)} 결제</span>
        </div>

        <div className="text-[20px] font-bold text-gray-700 uppercase mb-2">
          결제 항목 ({receipt.items.length})
        </div>
        <Card className="mb-5">
          {receipt.items.map((it, i) => (
            <div
              key={it.id}
              className={`flex justify-between items-center py-2.5 ${
                i < receipt.items.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              <span className="text-[18px] font-semibold">{it.name}</span>
              <span className="text-[18px]">{formatCurrency(it.amount)}</span>
            </div>
          ))}
          <div className="flex justify-between items-center pt-3 mt-1 border-t border-gray-200">
            <span className="text-[18px] font-bold text-gray-700">합계</span>
            <span className="text-[20px] text-mint-500">
              {formatCurrency(receipt.total)}
            </span>
          </div>
        </Card>

        <div className="text-[20px] font-bold text-gray-700 uppercase mb-2">
          {receipt.splitMethod === "equal" ? "N분의 1" : "직접 입력"} (
          {receipt.participantIds.length})
        </div>
        <Card>
          {receipt.participantIds.map((uid, i) => (
            <div
              key={uid}
              className={`flex items-center gap-2.5 py-2.5 ${
                i < receipt.participantIds.length - 1
                  ? "border-b border-gray-100"
                  : ""
              }`}
            >
              <Avatar nickname={nickname(uid)} size="sm" />
              <div className="flex-1 text-[18px] font-semibold">
                {nickname(uid)}
                {uid === receipt.payerId && (
                  <span className="text-mint-500 text-[14px] font-bold ml-1.5">
                    결제자
                  </span>
                )}
              </div>
              <span className="text-[18px]">
                {formatCurrency(receipt.splits[uid] ?? 0)}
              </span>
            </div>
          ))}
        </Card>
      </div>
    </AppShell>
  );
}

export default function ReceiptDetailPage() {
  return (
    <RequireAuth>
      <ReceiptDetailContent />
    </RequireAuth>
  );
}
