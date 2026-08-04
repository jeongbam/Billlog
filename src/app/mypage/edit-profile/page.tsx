"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import RequireAuth from "@/components/RequireAuth";
import { Avatar, Button, Input } from "@/components/ui";
import { isNicknameTaken, updateUserProfile } from "@/lib/auth";
import { uploadImage } from "@/lib/storage";
import { useAuthStore } from "@/store/useAuthStore";

function EditProfileContent() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const fileRef = useRef<HTMLInputElement>(null);

  const [nickname, setNickname] = useState(user?.nickname ?? "");
  const [nicknameError, setNicknameError] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    user?.photoURL ?? null,
  );
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const canSubmit = nickname.trim().length > 0 && nickname.trim().length <= 8;

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    if (!user || !canSubmit) return;
    setNicknameError("");
    setSaving(true);
    try {
      const trimmed = nickname.trim();
      if (trimmed !== user.nickname) {
        const taken = await isNicknameTaken(trimmed, user.uid);
        if (taken) {
          setNicknameError("이미 사용 중인 닉네임이에요.");
          return;
        }
      }

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

        <Input
          label="닉네임"
          value={nickname}
          onChange={(e) => {
            setNickname(e.target.value);
            setNicknameError("");
          }}
          maxLength={8}
          placeholder="8자 이내로 입력해주세요"
        />
        {nicknameError ? (
          <p className="text-[13px] text-error-d text-right -mt-2 mb-3.5">
            {nicknameError}
          </p>
        ) : (
          <p className="text-[11px] text-gray-400 text-right -mt-2">
            {nickname.length}/8
          </p>
        )}
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pb-7 pt-2 bg-white">
        <Button onClick={handleSave} loading={saving} disabled={!canSubmit}>
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
