"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import RequireAuth from "@/components/RequireAuth";
import { ChevronRightIcon, CopyIcon, ReceiptIcon } from "@/components/icons";
import { Avatar, Badge, Button, Card, ProgressBar } from "@/components/ui";
import { getUserProfile } from "@/lib/auth";
import { subscribeMeeting } from "@/lib/meetings";
import {
  markSettlementPaid,
  requestSettlementReminder,
  subscribeReceipts,
  subscribeSettlements,
} from "@/lib/receipts";
import { dayLabel, formatCurrency, isoDateFromTimestamp } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import type { AppUser, Meeting, Receipt, Settlement } from "@/types";

function BillLogContent() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<Record<string, AppUser>>({});
  const [copiedUid, setCopiedUid] = useState<string | null>(null);

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

  // Fetch bank account details for anyone the current user owes money to,
  // so we can offer a one-tap "copy account number" instead of the old
  // KakaoPay friend-search flow.
  useEffect(() => {
    if (!user) return;
    const creditorIds = new Set(
      settlements
        .filter((s) => s.debtorUid === user.uid && s.status !== "paid")
        .map((s) => s.creditorUid),
    );
    creditorIds.forEach((uid) => {
      if (profiles[uid]) return;
      getUserProfile(uid).then((profile) => {
        if (profile) setProfiles((prev) => ({ ...prev, [uid]: profile }));
      });
    });
  }, [settlements, user, profiles]);

  const dayGroups = useMemo(() => {
    const groups = new Map<string, Receipt[]>();
    receipts.forEach((r) => {
      const key = isoDateFromTimestamp(r.createdAt);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(r);
    });
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [receipts]);

  if (!meeting) return null;

  const isReadOnly = meeting.status === "done";
  const total = receipts.reduce((sum, r) => sum + r.total, 0);
  const paid = settlements.filter((s) => s.status === "paid").length;
  const percent = settlements.length ? (paid / settlements.length) * 100 : 0;
  const nickname = (uid: string) =>
    meeting.memberInfo[uid]?.nickname ?? "알 수 없음";

  async function handleMarkPaid(s: Settlement) {
    setBusyId(s.id);
    try {
      await markSettlementPaid(id, s.debtorUid, s.creditorUid);
    } finally {
      setBusyId(null);
    }
  }

  async function handleRemind(s: Settlement) {
    setBusyId(s.id);
    try {
      await requestSettlementReminder(
        id,
        s.debtorUid,
        user?.nickname ?? "멤버",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleCopyAccount(uid: string, accountNumber: string) {
    try {
      await navigator.clipboard.writeText(accountNumber.replace(/\s/g, ""));
      setCopiedUid(uid);
      setTimeout(() => setCopiedUid((cur) => (cur === uid ? null : cur)), 1500);
    } catch {
      // clipboard access denied — nothing we can do silently
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
            {settlements.length === 0 ? (
              <p className="text-[16px] text-gray-400 mb-5">
                정산할 금액이 없어요.
              </p>
            ) : (
              <Card className="mb-5">
                {settlements.map((s, i) => {
                  const creditorProfile = profiles[s.creditorUid];
                  const iAmDebtor = s.debtorUid === user?.uid;
                  const iAmCreditor = s.creditorUid === user?.uid;
                  return (
                    <div
                      key={s.id}
                      className={`py-2.5 ${
                        i < settlements.length - 1
                          ? "border-b border-gray-100"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Avatar nickname={nickname(s.debtorUid)} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="text-[16px] font-semibold truncate">
                            {nickname(s.debtorUid)}
                            {iAmDebtor && " (나)"} → {nickname(s.creditorUid)}
                            {iAmCreditor && " (나)"}
                          </div>
                          <div className="text-[14px] text-gray-500">
                            {formatCurrency(s.amount)}
                          </div>
                        </div>
                        {s.status === "paid" ? (
                          <Badge variant="success">완료</Badge>
                        ) : iAmDebtor ? (
                          <button
                            onClick={() => handleMarkPaid(s)}
                            disabled={busyId === s.id}
                            className="text-[14px] font-bold text-white bg-mint-300 rounded-full px-3 py-1.5 disabled:opacity-50 flex-none"
                          >
                            완료로 표시
                          </button>
                        ) : iAmCreditor ? (
                          <button
                            onClick={() => handleRemind(s)}
                            disabled={busyId === s.id}
                            className="text-[14px] font-bold text-mint-500 border border-mint-200 rounded-full px-3 py-1.5 disabled:opacity-50 flex-none"
                          >
                            알림 보내기
                          </button>
                        ) : (
                          <Badge variant="error">미정산</Badge>
                        )}
                      </div>

                      {iAmDebtor && s.status !== "paid" && (
                        <div className="mt-2 ml-[42px]">
                          {creditorProfile?.accountNumber ? (
                            <button
                              onClick={() =>
                                handleCopyAccount(
                                  s.creditorUid,
                                  creditorProfile.accountNumber!,
                                )
                              }
                              className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5"
                            >
                              <CopyIcon size={14} />
                              {copiedUid === s.creditorUid
                                ? "복사됨"
                                : `${creditorProfile.bankName ?? ""} ${creditorProfile.accountNumber}`}
                            </button>
                          ) : (
                            <span className="text-[12.5px] text-gray-400">
                              {nickname(s.creditorUid)}님이 아직 계좌를 등록하지
                              않았어요
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </Card>
            )}

            <div className="text-[18px] font-bold text-gray-700 uppercase mb-2">
              등록된 영수증 ({receipts.length})
            </div>
            {dayGroups.map(([dateKey, dayReceipts]) => {
              const dayTotal = dayReceipts.reduce((s, r) => s + r.total, 0);
              return (
                <div key={dateKey} className="mb-4">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-[15px] font-bold text-mint-500">
                      {dayLabel(meeting.startDate, dayReceipts[0].createdAt)}
                    </span>
                    <span className="text-[13px] text-gray-400">
                      {formatCurrency(dayTotal)}
                    </span>
                  </div>
                  {dayReceipts.map((r) => (
                    <Link
                      key={r.id}
                      href={`/meetings/${id}/bill-log/${r.id}`}
                      className="flex items-center gap-2.5 py-2.5 border-b border-gray-100"
                    >
                      <div className="w-9 h-9 rounded-[10px] bg-gray-50 flex items-center justify-center text-gray-600 flex-none">
                        <ReceiptIcon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[18px] font-semibold truncate">
                          {r.title || "영수증"}
                        </div>
                        <div className="text-[16px] text-gray-500">
                          {formatCurrency(r.total)} · {nickname(r.payerId)} 결제
                        </div>
                      </div>
                      <ChevronRightIcon size={20} className="text-gray-300" />
                    </Link>
                  ))}
                </div>
              );
            })}
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
