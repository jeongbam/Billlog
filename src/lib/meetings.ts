import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  type DocumentData,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import { notifyMeetingMembers } from "./notifications";
import { randomJoinCode, stripUndefined } from "./utils";
import type { AppUser, Meeting, Photo, PlanItem, Review } from "@/types";

const col = collection(db, "meetings");

export async function createMeeting(
  input: {
    title: string;
    startDate: string;
    endDate: string;
    place: string;
    coverImage: string | null;
  },
  owner: AppUser,
): Promise<string> {
  const ref = await addDoc(col, {
    title: input.title,
    startDate: input.startDate,
    endDate: input.endDate,
    place: input.place,
    coverImage: input.coverImage,
    ownerId: owner.uid,
    memberIds: [owner.uid],
    memberInfo: {
      [owner.uid]: { nickname: owner.nickname, photoURL: owner.photoURL },
    },
    joinCode: randomJoinCode(),
    status: "active",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export function subscribeUserMeetings(
  uid: string,
  cb: (meetings: Meeting[]) => void,
) {
  const q = query(col, where("memberIds", "array-contains", uid));
  return onSnapshot(q, (snap) => {
    const meetings = snap.docs.map((d) => toMeeting(d.id, d.data()));
    meetings.sort((a, b) => b.createdAt - a.createdAt);
    cb(meetings);
  });
}

export function subscribeMeeting(id: string, cb: (m: Meeting | null) => void) {
  return onSnapshot(doc(db, "meetings", id), (snap) => {
    cb(snap.exists() ? toMeeting(snap.id, snap.data()) : null);
  });
}

function toMeeting(id: string, data: DocumentData): Meeting {
  return {
    id,
    title: data.title,
    startDate: data.startDate,
    endDate: data.endDate,
    place: data.place,
    coverImage: data.coverImage ?? null,
    ownerId: data.ownerId,
    memberIds: data.memberIds ?? [],
    memberInfo: data.memberInfo ?? {},
    joinCode: data.joinCode,
    status: data.status ?? "active",
    createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
  };
}

export async function joinMeetingByCode(
  code: string,
  user: AppUser,
): Promise<string | null> {
  const q = query(
    col,
    where("joinCode", "==", code.trim().toUpperCase()),
    limit(1),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const meetingDoc = snap.docs[0];
  const existingMemberIds: string[] = meetingDoc.data().memberIds ?? [];
  await updateDoc(meetingDoc.ref, {
    memberIds: arrayUnion(user.uid),
    [`memberInfo.${user.uid}`]: {
      nickname: user.nickname,
      photoURL: user.photoURL,
    },
  });
  await notifyMeetingMembers(
    existingMemberIds,
    "member_joined",
    `${user.nickname} 님이 모임에 참여했어요`,
    meetingDoc.id,
  );
  return meetingDoc.id;
}

export async function updateMeetingCover(meetingId: string, url: string) {
  await updateDoc(doc(db, "meetings", meetingId), { coverImage: url });
}

export async function endMeeting(meetingId: string) {
  await updateDoc(doc(db, "meetings", meetingId), { status: "done" });
}

export async function deleteMeeting(meetingId: string) {
  await deleteDoc(doc(db, "meetings", meetingId));
}

/* ---------------- Pre-log: plan items ---------------- */

export async function addPlanItem(
  meetingId: string,
  item: Omit<PlanItem, "id" | "createdAt" | "pinned" | "likedBy">,
  memberIds: string[],
  actorNickname: string,
) {
  await addDoc(
    collection(db, "meetings", meetingId, "planItems"),
    stripUndefined({
      ...item,
      pinned: false,
      likedBy: [],
      createdAt: serverTimestamp(),
    }),
  );
  await notifyMeetingMembers(
    memberIds,
    "plan_item_added",
    `${actorNickname} 님이 새로운 계획을 등록했어요`,
    meetingId,
    item.createdBy,
  );
}

export async function deletePlanItem(meetingId: string, itemId: string) {
  await deleteDoc(doc(db, "meetings", meetingId, "planItems", itemId));
}

export async function togglePlanItemPin(
  meetingId: string,
  itemId: string,
  pinned: boolean,
) {
  await updateDoc(doc(db, "meetings", meetingId, "planItems", itemId), {
    pinned,
  });
}

export async function togglePlanItemLike(
  meetingId: string,
  itemId: string,
  uid: string,
  liked: boolean,
) {
  await updateDoc(doc(db, "meetings", meetingId, "planItems", itemId), {
    likedBy: liked ? arrayUnion(uid) : arrayRemove(uid),
  });
}

export function subscribePlanItems(
  meetingId: string,
  cb: (items: PlanItem[]) => void,
) {
  const q = query(
    collection(db, "meetings", meetingId, "planItems"),
    orderBy("createdAt", "asc"),
  );
  return onSnapshot(q, (snap) => {
    cb(
      snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          type: data.type,
          title: data.title,
          url: data.url,
          content: data.content,
          tag: data.tag ?? "etc",
          pinned: data.pinned ?? false,
          likedBy: data.likedBy ?? [],
          createdBy: data.createdBy,
          createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
        } as PlanItem;
      }),
    );
  });
}

/* ---------------- Post-log: photos & reviews ---------------- */

export async function addPhoto(
  meetingId: string,
  url: string,
  uploaderId: string,
  memberIds: string[],
  actorNickname: string,
) {
  await addDoc(collection(db, "meetings", meetingId, "photos"), {
    url,
    uploaderId,
    createdAt: serverTimestamp(),
  });
  await notifyMeetingMembers(
    memberIds,
    "photo_added",
    `${actorNickname} 님이 사진을 등록했어요`,
    meetingId,
    uploaderId,
  );
}

export function subscribePhotos(
  meetingId: string,
  cb: (photos: Photo[]) => void,
) {
  const q = query(
    collection(db, "meetings", meetingId, "photos"),
    orderBy("createdAt", "desc"),
  );
  return onSnapshot(q, (snap) => {
    cb(
      snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          url: data.url,
          uploaderId: data.uploaderId,
          createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
        } as Photo;
      }),
    );
  });
}

export async function addReview(
  meetingId: string,
  text: string,
  uid: string,
  nickname: string,
  memberIds: string[],
) {
  await addDoc(collection(db, "meetings", meetingId, "reviews"), {
    text,
    uid,
    nickname,
    createdAt: serverTimestamp(),
  });
  await notifyMeetingMembers(
    memberIds,
    "review_added",
    `${nickname} 님이 후기를 남겼어요`,
    meetingId,
    uid,
  );
}

export function subscribeReviews(
  meetingId: string,
  cb: (reviews: Review[]) => void,
) {
  const q = query(
    collection(db, "meetings", meetingId, "reviews"),
    orderBy("createdAt", "asc"),
  );
  return onSnapshot(q, (snap) => {
    cb(
      snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          text: data.text,
          uid: data.uid,
          nickname: data.nickname,
          createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
        } as Review;
      }),
    );
  });
}
