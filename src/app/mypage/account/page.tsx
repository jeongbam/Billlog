"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import RequireAuth from "@/components/RequireAuth";
import { Button, Input, Select } from "@/components/ui";
import { updateUserProfile } from "@/lib/auth";
import { KOREAN_BANKS } from "@/lib/constants";
import { useAuthStore } from "@/store/useAuthStore";

function AccountSettingsContent() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [bankName, setBankName] = useState(user?.bankName ?? "");
  const [accountNumber, setAccountNumber] = useState(user?.accountNumber ?? "");
  const [accountHolder, setAccountHolder] = useState(user?.accountHolder ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setSaved(false);
    try {
      await updateUserProfile(user.uid, {
        bankName,
        accountNumber: accountNumber.trim(),
        accountHolder: accountHolder.trim(),
      });
      setUser({
        ...user,
        bankName,
        accountNumber: accountNumber.trim(),
        accountHolder: accountHolder.trim(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell backHref="/mypage" title="계좌 관리">
      <div className="pt-1">
        <p className="text-[15px] text-gray-500 mb-5">
          등록해두면 정산 화면에서 상대방이 계좌를 바로 복사해서 송금할 수
          있어요.
        </p>

        <Select
          label="은행"
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
        >
          <option value="">은행 선택</option>
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

        {saved && (
          <p className="text-[14px] text-mint-500 font-semibold mb-3">
            저장됐어요.
          </p>
        )}
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pb-7 pt-2 bg-white">
        <Button onClick={handleSave} loading={saving}>
          저장하기
        </Button>
      </div>
    </AppShell>
  );
}

export default function AccountSettingsPage() {
  return (
    <RequireAuth>
      <AccountSettingsContent />
    </RequireAuth>
  );
}
