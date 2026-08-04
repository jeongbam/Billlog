"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import RequireAuth from "@/components/RequireAuth";
import {
  NicknameCheckField,
  type NicknameCheckStatus,
} from "@/components/NicknameCheckField";
import { Avatar, Button } from "@/components/ui";
import { updateUserProfile } from "@/lib/auth";
import { uploadImage } from "@/lib/storage";
import { useAuthStore } from "@/store/useAuthStore";

function EditProfileContent() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const fileRef = useRef<HTMLInputElement>(null);

  const [nickname, setNickname] = useState(user?.nickname ?? "");
  const [nicknameStatus, setNicknameStatus] =
    useState<NicknameCheckStatus>("idle");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    user?.photoURL ?? null,
  );
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const nicknameChanged = nickname.trim() !== user.nickname;
  const nicknameReady = !nicknameChanged || nicknameStatus === "available";
  const canSave =
    (photoFile !== null ||
      (nicknameChanged && nicknameStatus === "available")) &&
    nicknameReady;

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    if (!user || !canSave) return;
    setSaving(true);
    try {
      const trimmed = nickname.trim();
      let photoURL = user.photoURL;
      if (photoFile) {
        photoURL = await uploadImage(`users/${user.uid}/avatar`, photoFile);
      }
      await updateUserProfile(user.uid, { nickname: trimmed, photoURL });
      setUser({ ...user, nickname: trimmed, photoURL });
      router.push("/mypage");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell backHref="/mypage" title="프로필 수정">
      <div className="pt-1">
        <div className="flex flex-col items-center mb-6">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
          <button onClick={() => fileRef.current?.click()}>
            <Avatar
              nickname={nickname || "?"}
              photoURL={photoPreview}
              size="lg"
            />
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="text-[16px] font-bold text-mint-500 mt-2.5"
          >
            프로필 사진 바꾸기
          </button>
        </div>

        <NicknameCheckField
          value={nickname}
          onChange={setNickname}
          excludeUid={user.uid}
          status={nicknameStatus}
          onStatusChange={setNicknameStatus}
        />
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pb-7 pt-2 bg-white">
        <Button onClick={handleSave} loading={saving} disabled={!canSave}>
          저장하기
        </Button>
      </div>
    </AppShell>
  );
}

export default function EditProfilePage() {
  return (
    <RequireAuth>
      <EditProfileContent />
    </RequireAuth>
  );
}
