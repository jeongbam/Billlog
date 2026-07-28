"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import RequireAuth from "@/components/RequireAuth";
import { ChevronRightIcon, ReceiptIcon } from "@/components/icons";
import { Avatar, Badge, Button, Card, ProgressBar } from "@/components/ui";
import { subscribeMeeting } from "@/lib/meetings";
import {
  markSettlementPaid,
  requestSettlementReminder,
  subscribeReceipts,
  subscribeSettlements,
} from "@/lib/receipts";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import type { Meeting, Receipt, Settlement } from "@/types";

function BillLogContent() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [busyUid, setBusyUid] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const u1 = subscribeMeeting(id, setMeeting);
    const u2 = subscribeReceipts(id, setReceipts);
    const u3 = subscribeSettlements(id, setSettlements);
    return () => {
      u1();
      u2();
      u3();
    };
  }, [id]);

  if (!meeting) return null;

  const isReadOnly = meeting.status === "done";
  const total = receipts.reduce((sum, r) => sum + r.total, 0);
  const paid = settlements.filter((s) => s.status === "paid").length;
  const percent = settlements.length ? (paid / settlements.length) * 100 : 0;
  const nickname = (uid: string) =>
    meeting.memberInfo[uid]?.nickname ?? "알 수 없음";
  const isOwner = meeting.ownerId === user?.uid;

  async function handleMarkPaid(uid: string) {
    setBusyUid(uid);
    try {
      await markSettlementPaid(id, uid, meeting!.ownerId);
    } finally {
      setBusyUid(null);
    }
  }

  async function handleRemind(uid: string) {
    setBusyUid(uid);
    try {
      await requestSettlementReminder(id, uid, user?.nickname ?? "모임장");
    } finally {
      setBusyUid(null);
    }
  }

  return (
    <AppShell backHref={`/meetings/${id}`} title="Bill-log">
      <div className="pt-1">
        {isReadOnly && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 mb-4">
            <div className="text-[18px] font-bold text-gray-600">
              종료된 모임이에요
            </div>
            <div className="text-[16px] text-gray-500 mt-1">
              열람만 가능하며 새로운 결제내역은 등록할 수 없어요
            </div>
          </div>
        )}
        {receipts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4 text-gray-400">
              <ReceiptIcon size={26} />
            </div>
            <p className="text-[20px] font-bold">
              아직 등록된 결제내역이 없어요
            </p>
            <p className="text-[16px] text-gray-500 mt-1.5">
              결제내역을 등록하고 정산을 시작해보세요
            </p>
          </div>
        ) : (
          <>
            <div className="text-[18px] font-bold mb-1">
              {paid} / {settlements.length} 정산 완료
            </div>
            <div className="text-[16px] text-gray-500 mb-3">
              영수증 {receipts.length}건 · 총 {formatCurrency(total)}
            </div>
            <ProgressBar percent={percent} />

            <div className="text-[18px] font-bold text-gray-700 uppercase mt-5 mb-2">
              정산 현황
            </div>
            <Card className="mb-5">
              {settlements.map((s, i) => (
                <div
                  key={s.uid}
                  className={`flex items-center gap-2.5 py-2.5 ${
                    i < settlements.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                >
                  <Avatar nickname={nickname(s.uid)} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[16px] font-semibold">
                      {nickname(s.uid)}
                      {s.uid === user?.uid && " (나)"}
                    </div>
                    <div className="text-[14px] text-gray-500">
                      {formatCurrency(s.amount)}
                    </div>
                  </div>
                  {s.status === "paid" ? (
                    <Badge variant="success">완료</Badge>
                  ) : s.uid === user?.uid ? (
                    <button
                      onClick={() => handleMarkPaid(s.uid)}
                      disabled={busyUid === s.uid}
                      className="text-[14px] font-bold text-white bg-mint-300 rounded-full px-3 py-1.5 disabled:opacity-50"
                    >
                      완료로 표시
                    </button>
                  ) : isOwner ? (
                    <button
                      onClick={() => handleRemind(s.uid)}
                      disabled={busyUid === s.uid}
                      className="text-[14px] font-bold text-mint-500 border border-mint-200 rounded-full px-3 py-1.5 disabled:opacity-50"
                    >
                      알림 보내기
                    </button>
                  ) : (
                    <Badge variant="error">미정산</Badge>
                  )}
                </div>
              ))}
            </Card>

            <div className="text-[18px] font-bold text-gray-700 uppercase mb-2">
              등록된 영수증 ({receipts.length})
            </div>
            {receipts.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-2.5 py-2.5 border-b border-gray-100"
              >
                <div className="w-9 h-9 rounded-[10px] bg-gray-50 flex items-center justify-center text-gray-600 flex-none">
                  <ReceiptIcon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[18px] font-semibold">
                    영수증 {r.items.length}항목
                  </div>
                  <div className="text-[16px] text-gray-500">
                    {formatCurrency(r.total)} · {nickname(r.payerId)} 결제
                  </div>
                </div>
                <ChevronRightIcon size={20} className="text-gray-300" />
              </div>
            ))}
          </>
        )}
      </div>

      {!isReadOnly && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pb-7 pt-2 bg-white">
          <Link href={`/meetings/${id}/bill-log/new`}>
            <Button variant={receipts.length === 0 ? "primary" : "secondary"}>
              + 결제내역
            </Button>
          </Link>
        </div>
      )}
    </AppShell>
  );
}

export default function BillLogPage() {
  return (
    <RequireAuth>
      <BillLogContent />
    </RequireAuth>
  );
}
