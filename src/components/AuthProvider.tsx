"use client";

import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { ensureUserDoc } from "@/lib/auth";
import { useAuthStore } from "@/store/useAuthStore";
import type { AppUser } from "@/types";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    let unsubUserDoc: (() => void) | undefined;

    const unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (unsubUserDoc) unsubUserDoc();

      if (!fbUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      await ensureUserDoc(fbUser).catch(() => null);
      unsubUserDoc = onSnapshot(doc(db, "users", fbUser.uid), (snap) => {
        if (snap.exists()) {
          setUser(snap.data() as AppUser);
        }
        setLoading(false);
      });
    });

    return () => {
      unsubAuth();
      if (unsubUserDoc) unsubUserDoc();
    };
  }, [setUser, setLoading]);

  return <>{children}</>;
}
