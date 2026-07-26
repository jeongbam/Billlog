"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import RequireAuth from "@/components/RequireAuth";
import { Avatar, Button, Input } from "@/components/ui";
import { updateUserProfile } from "@/lib/auth";
import { uploadImage } from "@/lib/storage";
import { useAuthStore } from "@/store/useAuthStore";

function OnboardingContent() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const fileRef = useRef<HTMLInputElement>(null);

  const [nickname, setNickname] = useState(user?.nickname ?? "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    user?.photoURL ?? null
  );
  const [loading, setLoading] = useState(false);

  const canSubmit = nickname.trim().length > 0 && nickname.trim().length <= 8;

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit() {
    if (!user || !canSubmit) return;
    setLoading(true);
    try {
      let photoURL = user.photoURL;
      if (photoFile) {
        photoURL = await uploadImage(`users/${user.uid}/avatar`, photoFile);
      }
      await updateUserProfile(user.uid, { nickname: nickname.trim(), photoURL });
      router.push("/home");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="pt-3">
        <div className="h-1 bg-gray-100 rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-mint-300 w-full rounded-full" />
        </div>
        <h1 className="text-[20px] font-bold">닉네임을 알려주세요</h1>
        <p className="text-[14px] text-gray-500 mt-1.5 mb-6">
          모임 멤버들에게 보여질 이름이에요
        </p>

        <div className="flex flex-col items-center mb-6">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
          <button onClick={() => fileRef.current?.click()}>
            <Avatar nickname={nickname || "?"} photoURL={photoPreview} size="lg" />
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="text-[12px] font-bold text-mint-500 mt-2.5"
          >
            프로필 사진 바꾸기
          </button>
        </div>

        <Input
          label="닉네임"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={8}
          placeholder="8자 이내로 입력해주세요"
        />
        <p className="text-[11px] text-gray-400 text-right -mt-2">
          {nickname.length}/8
        </p>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pb-7 pt-2 bg-white">
        <Button onClick={handleSubmit} loading={loading} disabled={!canSubmit}>
          시작하기
        </Button>
      </div>
    </AppShell>
  );
}

export default function OnboardingPage() {
  return (
    <RequireAuth>
      <OnboardingContent />
    </RequireAuth>
  );
}
