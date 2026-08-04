import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
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

async function applyDebt(
  meetingId: string,
  debtorUid: string,
  creditorUid: string,
  amount: number,
) {
  if (!amount || amount <= 0 || debtorUid === creditorUid) return;

  const forwardRef = doc(
    db,
    "meetings",
    meetingId,
    "settlements",
    `${debtorUid}__${creditorUid}`,
  );
  const reverseRef = doc(
    db,
    "meetings",
    meetingId,
    "settlements",
    `${creditorUid}__${debtorUid}`,
  );

  await runTransaction(db, async (tx) => {
    const [forwardSnap, reverseSnap] = await Promise.all([
      tx.get(forwardRef),
      tx.get(reverseRef),
    ]);
    const forwardAmount = forwardSnap.exists()
      ? (forwardSnap.data().amount ?? 0)
      : 0;
    const reverseAmount = reverseSnap.exists()
      ? (reverseSnap.data().amount ?? 0)
      : 0;

    if (reverseAmount > 0) {
      if (reverseAmount > amount) {
        tx.set(
          reverseRef,
          {
            debtorUid: creditorUid,
            creditorUid: debtorUid,
            amount: reverseAmount - amount,
            status: reverseSnap.data()?.status ?? "pending",
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
        return;
      }
      tx.delete(reverseRef);
      const remainder = amount - reverseAmount;
      if (remainder > 0) {
        tx.set(forwardRef, {
          debtorUid,
          creditorUid,
          amount: forwardAmount + remainder,
          status: "pending",
          updatedAt: serverTimestamp(),
        });
      } else if (forwardSnap.exists()) {
        tx.delete(forwardRef);
      }
      return;
    }

    tx.set(forwardRef, {
      debtorUid,
      creditorUid,
      amount: forwardAmount + amount,
      status: "pending",
      updatedAt: serverTimestamp(),
    });
  });
}

export async function createReceipt(
  meetingId: string,
  input: {
    title: string;
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

  const debtors = input.participantIds.filter((uid) => uid !== input.payerId);

  await Promise.all(
    debtors.map((uid) =>
      applyDebt(meetingId, uid, input.payerId, input.splits[uid] ?? 0),
    ),
  );

  await Promise.all(
    debtors.map((uid) =>
      addNotification(
        uid,
        "settlement_request",
        `${memberNickname(input.payerId)} 님이 정산을 요청했어요`,
        meetingId,
      ),
    ),
  );

  const alreadyNotified = new Set([createdBy, ...debtors]);
  await notifyMeetingMembers(
    memberIds.filter((uid) => !alreadyNotified.has(uid)),
    "receipt_added",
    `${memberNickname(createdBy)} 님이 영수증을 등록했어요`,
    meetingId,
  );
}

function parseReceipt(id: string, data: Record<string, unknown>): Receipt {
  const createdAt = data.createdAt as { toMillis?: () => number } | undefined;
  return {
    id,
    title: (data.title as string) || "",
    items: (data.items as ReceiptItem[]) ?? [],
    total: data.total as number,
    participantIds: (data.participantIds as string[]) ?? [],
    splitMethod: data.splitMethod as Receipt["splitMethod"],
    splits: (data.splits as Record<string, number>) ?? {},
    payerId: data.payerId as string,
    createdBy: data.createdBy as string,
    createdAt: createdAt?.toMillis?.() ?? Date.now(),
  };
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
    cb(snap.docs.map((d) => parseReceipt(d.id, d.data())));
  });
}

export function subscribeReceipt(
  meetingId: string,
  receiptId: string,
  cb: (r: Receipt | null) => void,
) {
  return onSnapshot(
    doc(db, "meetings", meetingId, "receipts", receiptId),
    (snap) => cb(snap.exists() ? parseReceipt(snap.id, snap.data()) : null),
  );
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
          id: d.id,
          debtorUid: data.debtorUid,
          creditorUid: data.creditorUid,
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
  debtorUid: string,
  creditorUid: string,
) {
  await updateDoc(
    doc(
      db,
      "meetings",
      meetingId,
      "settlements",
      `${debtorUid}__${creditorUid}`,
    ),
    {
      status: "paid",
      updatedAt: serverTimestamp(),
    },
  );
  await addNotification(
    creditorUid,
    "settlement_done",
    "정산이 완료됐어요",
    meetingId,
  );
}

export async function requestSettlementReminder(
  meetingId: string,
  debtorUid: string,
  fromNickname: string,
) {
  await addNotification(
    debtorUid,
    "settlement_request",
    `${fromNickname} 님이 정산을 다시 요청했어요`,
    meetingId,
  );
}
