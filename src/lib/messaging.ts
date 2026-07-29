"use client";

import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import {
  getMessaging,
  getToken,
  isSupported,
  type Messaging,
  onMessage,
} from "firebase/messaging";
import { db, firebaseApp } from "./firebase";

let messagingInstance: Messaging | null = null;
let supportChecked = false;

async function getMessagingIfSupported(): Promise<Messaging | null> {
  if (typeof window === "undefined") return null;
  if (messagingInstance) return messagingInstance;
  if (supportChecked) return null;

  supportChecked = true;
  const supported = await isSupported().catch(() => false);
  if (!supported) return null;

  messagingInstance = getMessaging(firebaseApp);
  return messagingInstance;
}

export type PushPermissionResult =
  | "enabled"
  | "denied"
  | "unsupported"
  | "error";

export async function enablePushNotifications(
  uid: string,
): Promise<PushPermissionResult> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return "unsupported";
  }

  const messaging = await getMessagingIfSupported();
  if (!messaging) return "unsupported";

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    console.error(
      "NEXT_PUBLIC_FIREBASE_VAPID_KEY가 설정되어 있지 않아요. Firebase 콘솔 > 프로젝트 설정 > 클라우드 메시징 > 웹 푸시 인증서에서 발급받아 .env.local에 추가해주세요.",
    );
    return "error";
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return "denied";

    const registration = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });
    if (!token) return "error";

    await updateDoc(doc(db, "users", uid), {
      fcmTokens: arrayUnion(token),
    });

    return "enabled";
  } catch (err) {
    console.error("[push] enable failed", err);
    return "error";
  }
}

export function hasPushPermission(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    Notification.permission === "granted"
  );
}

export async function listenForegroundMessages(
  onReceive: (title: string, body: string) => void,
): Promise<() => void> {
  const messaging = await getMessagingIfSupported();
  if (!messaging) return () => {};

  return onMessage(messaging, (payload) => {
    onReceive(
      payload.notification?.title ?? "Billlog",
      payload.notification?.body ?? "",
    );
  });
}
