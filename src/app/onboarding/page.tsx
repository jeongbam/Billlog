"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import RequireAuth from "@/components/RequireAuth";
import {
  NicknameCheckField,
  type NicknameCheckStatus,
} from "@/components/NicknameCheckField";
import { Avatar, Button, Input, Select } from "@/components/ui";
import { updateUserProfile } from "@/lib/auth";
import { uploadImage } from "@/lib/storage";
import { KOREAN_BANKS } from "@/lib/constants";
import { useAuthStore } from "@/store/useAuthStore";

function OnboardingContent() {
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
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = nicknameStatus === "available";

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
      await updateUserProfile(user.uid, {
        nickname: nickname.trim(),
        photoURL,
        ...(bankName ? { bankName } : {}),
        ...(accountNumber.trim()
          ? { accountNumber: accountNumber.trim() }
          : {}),
        ...(accountHolder.trim()
          ? { accountHolder: accountHolder.trim() }
          : {}),
      });
      setUser({
        ...user,
        nickname: nickname.trim(),
        photoURL,
      });
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
          excludeUid={user?.uid}
          status={nicknameStatus}
          onStatusChange={setNicknameStatus}
        />

        <div className="mt-6 mb-2">
          <div className="text-[16px] font-bold text-gray-700">
            정산받을 계좌 (선택)
          </div>
          <p className="text-[13px] text-gray-400 mt-0.5">
            등록해두면 정산 화면에서 계좌를 바로 복사해서 보낼 수 있어요. 나중에
            마이페이지에서도 등록할 수 있어요.
          </p>
        </div>
        <Select
          label="은행"
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
        >
          <option value="">은행 선택 안 함</option>
          {KOREAN_BANKS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </Select>
        <Input
          label="계좌번호"
          placeholder="숫자만 입력"
          inputMode="numeric"
          value={accountNumber}
          onChange={(e) =>
            setAccountNumber(e.target.value.replace(/[^0-9-]/g, ""))
          }
        />
        <Input
          label="예금주명"
          placeholder="계좌 실명"
          value={accountHolder}
          onChange={(e) => setAccountHolder(e.target.value)}
        />
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
