import {
  createUserWithEmailAndPassword,
  getAdditionalUserInfo,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase";
import type { AppUser } from "@/types";

export async function ensureUserDoc(
  user: User,
  extra?: Partial<Pick<AppUser, "nickname">>,
): Promise<AppUser> {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    return snap.data() as AppUser;
  }

  const newUser: AppUser = {
    uid: user.uid,
    email: user.email,
    nickname: extra?.nickname || user.displayName || "새로운 유저",
    photoURL: user.photoURL,
    createdAt: Date.now(),
  };

  await setDoc(ref, { ...newUser, createdAt: serverTimestamp() });
  return newUser;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  nickname: string,
) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: nickname });
  return ensureUserDoc(cred.user, { nickname });
}

export async function signInWithEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return ensureUserDoc(cred.user);
}

export async function signInWithGoogle(): Promise<{
  user: AppUser;
  isNewUser: boolean;
}> {
  const cred = await signInWithPopup(auth, googleProvider);
  const isNewUser = !!getAdditionalUserInfo(cred)?.isNewUser;
  const user = await ensureUserDoc(cred.user);
  return { user, isNewUser };
}

export async function updateUserProfile(
  uid: string,
  data: Partial<Pick<AppUser, "nickname" | "photoURL">>,
) {
  await updateDoc(doc(db, "users", uid), data);

  if (auth.currentUser) {
    await updateProfile(auth.currentUser, {
      displayName: data.nickname ?? auth.currentUser.displayName,
      photoURL: data.photoURL ?? auth.currentUser.photoURL,
    });
  }
}

export async function signOutUser() {
  await signOut(auth);
}

export function authErrorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  switch (code) {
    case "auth/email-already-in-use":
      return "이미 가입된 이메일이에요.";
    case "auth/invalid-email":
      return "이메일 형식을 확인해주세요.";
    case "auth/weak-password":
      return "비밀번호는 6자 이상이어야 해요.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "이메일 또는 비밀번호가 올바르지 않아요.";
    case "auth/popup-closed-by-user":
      return "로그인이 취소됐어요.";
    default:
      return "문제가 발생했어요. 잠시 후 다시 시도해주세요.";
  }
}
