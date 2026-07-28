import {
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import type { NotificationItem, NotificationType } from "@/types";

export async function addNotification(
  uid: string,
  type: NotificationType,
  title: string,
  meetingId?: string,
) {
  await addDoc(collection(db, "users", uid, "notifications"), {
    type,
    title,
    meetingId: meetingId ?? null,
    read: false,
    createdAt: serverTimestamp(),
  });
}

/**
 * Broadcasts a notification to every member of a meeting.
 * Pass `excludeUid` (usually the actor who triggered the event) to skip notifying them.
 */
export async function notifyMeetingMembers(
  memberIds: string[],
  type: NotificationType,
  title: string,
  meetingId: string,
  excludeUid?: string,
) {
  const targets = memberIds.filter((uid) => uid !== excludeUid);
  await Promise.all(
    targets.map((uid) => addNotification(uid, type, title, meetingId)),
  );
}

export async function markAllNotificationsRead(uid: string) {
  const q = query(
    collection(db, "users", uid, "notifications"),
    where("read", "==", false),
  );
  const snap = await getDocs(q);
  if (snap.empty) return;
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.update(d.ref, { read: true }));
  await batch.commit();
}
export function subscribeNotifications(
  uid: string,
  cb: (items: NotificationItem[]) => void,
) {
  const q = query(
    collection(db, "users", uid, "notifications"),
    orderBy("createdAt", "desc"),
  );
  return onSnapshot(q, (snap) => {
    cb(
      snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          type: data.type,
          title: data.title,
          meetingId: data.meetingId ?? undefined,
          read: !!data.read,
          createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
        } as NotificationItem;
      }),
    );
  });
}
