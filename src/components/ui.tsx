"use client";

import { cx, initial } from "@/lib/utils";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";

// 버튼

type ButtonVariant = "primary" | "secondary" | "dark" | "ghost";

export function Button({
  variant = "primary",
  className,
  loading,
  children,
  disabled,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
}) {
  const styles: Record<ButtonVariant, string> = {
    primary: "bg-mint-300 text-white active:bg-mint-400",
    secondary: "bg-white text-gray-800 border border-gray-200",
    dark: "bg-gray-900 text-white",
    ghost: "bg-transparent text-gray-500 border border-dashed border-gray-300",
  };
  return (
    <button
      className={cx(
        "w-full flex items-center justify-center gap-2 rounded-xl py-2 text-[20px] transition-colors disabled:opacity-50",
        styles[variant],
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? "처리 중..." : children}
    </button>
  );
}

// 인풋

export function Input({
  label,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="block mb-3.5">
      {label && (
        <span className="block text-[18px] font-semibold text-gray-600 mb-1.5">
          {label}
        </span>
      )}
      <input
        className={cx(
          "w-full bg-white border-[1.4px] border-gray-200 rounded-xl px-3.5 py-3 text-[18px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-mint-300 focus:ring-4 focus:ring-mint-50",
          className,
        )}
        {...rest}
      />
    </label>
  );
}

export function Select({
  label,
  className,
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <label className="block mb-3.5">
      {label && (
        <span className="block text-[18px] font-semibold text-gray-600 mb-1.5">
          {label}
        </span>
      )}
      <select
        className={cx(
          "w-full bg-white border-[1.4px] border-gray-200 rounded-xl px-3.5 py-3 text-[18px] text-gray-900 focus:outline-none focus:border-mint-300 focus:ring-4 focus:ring-mint-50",
          className,
        )}
        {...rest}
      >
        {children}
      </select>
    </label>
  );
}

export function Textarea({
  label,
  className,
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <label className="block mb-3.5">
      {label && (
        <span className="block text-[16px] font-semibold text-gray-600 mb-1.5">
          {label}
        </span>
      )}
      <textarea
        className={cx(
          "w-full bg-white border-[1.4px] border-gray-200 rounded-xl px-3.5 py-3 text-[14.5px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-mint-300 focus:ring-4 focus:ring-mint-50",
          className,
        )}
        {...rest}
      />
    </label>
  );
}

// 칩

export function Chip({
  active,
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cx(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[16px] font-semibold border-[1.4px] whitespace-nowrap",
        active
          ? "bg-mint-50 text-mint-500 border-mint-300"
          : "bg-white text-gray-600 border-gray-200",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

// 뱃지

type BadgeVariant =
  | "dark"
  | "mint"
  | "outline"
  | "success"
  | "error"
  | "mintSoft";

export function Badge({
  variant = "outline",
  children,
}: {
  variant?: BadgeVariant;
  children: ReactNode;
}) {
  const styles: Record<BadgeVariant, string> = {
    dark: "bg-gray-900 text-white",
    mint: "bg-mint-300 text-white",
    outline: "border border-gray-200 text-gray-600 bg-white",
    success: "bg-success-bg text-success-d",
    error: "bg-error-bg text-error-d",
    mintSoft: "bg-mint-50 text-mint-500",
  };
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 px-2 py-0.7 rounded-md text-[14px] font-bold",
        styles[variant],
      )}
    >
      {children}
    </span>
  );
}

// 아바타

export function Avatar({
  nickname,
  photoURL,
  size = "md",
  className,
}: {
  nickname: string;
  photoURL?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "w-[26px] h-[26px] text-[10.5px]",
    md: "w-[34px] h-[34px] text-[12.5px]",
    lg: "w-16 h-16 text-[20px]",
  } as const;
  if (photoURL) {
    return (
      <img
        src={photoURL}
        alt={nickname}
        className={cx(
          "rounded-full object-cover border-2 border-white",
          sizes[size],
          className,
        )}
      />
    );
  }
  return (
    <div
      className={cx(
        "rounded-full bg-mint-500 text-white flex items-center justify-center font-bold border-2 border-white flex-none",
        sizes[size],
        className,
      )}
    >
      {initial(nickname)}
    </div>
  );
}

export function AvatarStack({
  members,
}: {
  members: { nickname: string; photoURL?: string | null }[];
}) {
  const shown = members.slice(0, 4);
  const rest = members.length - shown.length;
  return (
    <div className="flex">
      {shown.map((m, i) => (
        <div key={i} className={i > 0 ? "-ml-2" : ""}>
          <Avatar nickname={m.nickname} photoURL={m.photoURL} size="sm" />
        </div>
      ))}
      {rest > 0 && (
        <div className="-ml-2 w-[26px] h-[26px] rounded-full bg-gray-300 text-white text-[10.5px] font-bold flex items-center justify-center border-2 border-white">
          +{rest}
        </div>
      )}
    </div>
  );
}

// 카드

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cx(
        "bg-white border border-gray-100 rounded-xl p-3.5 shadow-[0_2px_10px_rgba(33,37,44,0.04)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-mint-300 rounded-full transition-all"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cx(
        "w-5 h-5 border-2 border-gray-200 border-t-mint-400 rounded-full animate-spin",
        className,
      )}
    />
  );
}

// 확인 모달

export function ConfirmModal({
  open,
  title = "삭제하시겠습니까?",
  description,
  confirmLabel = "삭제",
  cancelLabel = "취소",
  danger = true,
  loading = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={loading ? undefined : onCancel}
      />
      <div className="relative w-[85%] max-w-sm bg-white rounded-2xl p-5 shadow-xl">
        <div className="text-[20px] font-bold text-gray-900 mb-1.5 text-center">
          {title}
        </div>
        {description && (
          <div className="text-[15px] text-gray-500 text-center mb-4">
            {description}
          </div>
        )}
        {!description && <div className="mb-4" />}
        <div className="flex gap-2 mt-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-[17px] font-semibold bg-gray-50 text-gray-600 border border-gray-200 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cx(
              "flex-1 py-2.5 rounded-xl text-[17px] font-semibold text-white disabled:opacity-50",
              danger ? "bg-error" : "bg-mint-300",
            )}
          >
            {loading ? "처리 중..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
