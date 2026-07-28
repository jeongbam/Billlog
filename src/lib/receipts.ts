import {
  addDoc,
  collection,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { addNotification, notifyMeetingMembers } from "./notifications";
import type { Receipt, ReceiptItem, Settlement, SplitMethod } from "@/types";

export async function mockOcrParse(file: File): Promise<ReceiptItem[]> {
  await new Promise((r) => setTimeout(r, 1200));
  return [
    { id: crypto.randomUUID(), name: "삼겹살 2인분", amount: 32000 },
    { id: crypto.randomUUID(), name: "소주 3병", amount: 12000 },
    { id: crypto.randomUUID(), name: "공깃밥 2개", amount: 4000 },
  ];
}

export function computeEqualSplit(
  total: number,
  participantIds: string[],
): Record<string, number> {
  if (participantIds.length === 0) return {};
  const base = Math.floor(total / participantIds.length);
  const remainder = total - base * participantIds.length;
  const splits: Record<string, number> = {};
  participantIds.forEach((uid, idx) => {
    splits[uid] = base + (idx < remainder ? 1 : 0);
  });
  return splits;
}

export async function createReceipt(
  meetingId: string,
  input: {
    items: ReceiptItem[];
    total: number;
    participantIds: string[];
    splitMethod: SplitMethod;
    splits: Record<string, number>;
    payerId: string;
  },
  createdBy: string,
  memberNickname: (uid: string) => string,
  memberIds: string[],
) {
  await addDoc(collection(db, "meetings", meetingId, "receipts"), {
    ...input,
    createdBy,
    createdAt: serverTimestamp(),
  });

  await Promise.all(
    input.participantIds
      .filter((uid) => uid !== input.payerId)
      .map(async (uid) => {
        const ref = doc(db, "meetings", meetingId, "settlements", uid);
        await setDoc(
          ref,
          {
            uid,
            amount: increment(input.splits[uid] ?? 0),
            status: "pending",
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
        await addNotification(
          uid,
          "settlement_request",
          `${memberNickname(input.payerId)} 님이 정산을 요청했어요`,
          meetingId,
        );
      }),
  );

  const alreadyNotified = new Set([
    createdBy,
    ...input.participantIds.filter((uid) => uid !== input.payerId),
  ]);
  await notifyMeetingMembers(
    memberIds.filter((uid) => !alreadyNotified.has(uid)),
    "receipt_added",
    `${memberNickname(createdBy)} 님이 영수증을 등록했어요`,
    meetingId,
  );
}

export function subscribeReceipts(
  meetingId: string,
  cb: (r: Receipt[]) => void,
) {
  const q = query(
    collection(db, "meetings", meetingId, "receipts"),
    orderBy("createdAt", "asc"),
  );
  return onSnapshot(q, (snap) => {
    cb(
      snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          items: data.items ?? [],
          total: data.total,
          participantIds: data.participantIds ?? [],
          splitMethod: data.splitMethod,
          splits: data.splits ?? {},
          payerId: data.payerId,
          createdBy: data.createdBy,
          createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
        } as Receipt;
      }),
    );
  });
}

export function subscribeSettlements(
  meetingId: string,
  cb: (s: Settlement[]) => void,
) {
  const q = collection(db, "meetings", meetingId, "settlements");
  return onSnapshot(q, (snap) => {
    cb(
      snap.docs.map((d) => {
        const data = d.data();
        return {
          uid: data.uid,
          amount: data.amount ?? 0,
          status: data.status ?? "pending",
          updatedAt: data.updatedAt?.toMillis?.() ?? Date.now(),
        } as Settlement;
      }),
    );
  });
}

export async function markSettlementPaid(
  meetingId: string,
  uid: string,
  ownerId: string,
) {
  await updateDoc(doc(db, "meetings", meetingId, "settlements", uid), {
    status: "paid",
    updatedAt: serverTimestamp(),
  });
  await addNotification(
    ownerId,
    "settlement_done",
    "정산이 완료됐어요",
    meetingId,
  );
}

export async function requestSettlementReminder(
  meetingId: string,
  uid: string,
  fromNickname: string,
) {
  await addNotification(
    uid,
    "settlement_request",
    `${fromNickname} 님이 정산을 다시 요청했어요`,
    meetingId,
  );
}
