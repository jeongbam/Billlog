"use client";

import { isNicknameTaken } from "@/lib/auth";

export type NicknameCheckStatus = "idle" | "checking" | "available" | "taken";

export function NicknameCheckField({
  value,
  onChange,
  excludeUid,
  status,
  onStatusChange,
  maxLength = 8,
}: {
  value: string;
  onChange: (v: string) => void;
  excludeUid?: string;
  status: NicknameCheckStatus;
  onStatusChange: (s: NicknameCheckStatus) => void;
  maxLength?: number;
}) {
  async function handleCheck() {
    const trimmed = value.trim();
    if (!trimmed) return;
    onStatusChange("checking");
    try {
      const taken = await isNicknameTaken(trimmed, excludeUid);
      onStatusChange(taken ? "taken" : "available");
    } catch {
      onStatusChange("idle");
    }
  }

  return (
    <div className="mb-3.5">
      <span className="block text-[20px] font-semibold text-gray-600 mb-1.5">
        닉네임
      </span>
      <div className="flex gap-2">
        <input
          className="flex-1 min-w-0 bg-white border-[1.4px] border-gray-200 rounded-xl px-3.5 py-3 text-[18px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-mint-300 focus:ring-4 focus:ring-mint-50"
          value={value}
          maxLength={maxLength}
          placeholder="8자 이내로 입력해주세요"
          onChange={(e) => {
            onChange(e.target.value);
            onStatusChange("idle");
          }}
        />
        <button
          type="button"
          onClick={handleCheck}
          disabled={!value.trim() || status === "checking"}
          className="flex-none px-3.5 rounded-xl text-[16px] font-bold text-mint-500 border-[1.4px] border-mint-300 disabled:opacity-40 whitespace-nowrap"
        >
          {status === "checking" ? "확인 중" : "중복 확인"}
        </button>
      </div>
      <div className="flex justify-between items-center mt-1.5">
        {status === "available" && (
          <p className="text-[13px] text-mint-500 font-semibold">
            사용 가능한 닉네임입니다.
          </p>
        )}
        {status === "taken" && (
          <p className="text-[13px] text-error-d font-semibold">
            사용 불가능한 닉네임입니다.
          </p>
        )}
        {status !== "available" && status !== "taken" && <span />}
        <span className="text-[11px] text-gray-400">
          {value.length}/{maxLength}
        </span>
      </div>
    </div>
  );
}
