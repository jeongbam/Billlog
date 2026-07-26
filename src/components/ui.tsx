"use client";

import { cx, initial } from "@/lib/utils";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";

/* ---------------- Button ---------------- */

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
        "w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-[16px] font-bold transition-colors disabled:opacity-50",
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

/* ---------------- Input ---------------- */

export function Input({
  label,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="block mb-3.5">
      {label && (
        <span className="block text-[12px] font-semibold text-gray-600 mb-1.5">
          {label}
        </span>
      )}
      <input
        className={cx(
          "w-full bg-white border-[1.4px] border-gray-200 rounded-xl px-3.5 py-3 text-[14.5px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-mint-300 focus:ring-4 focus:ring-mint-50",
          className,
        )}
        {...rest}
      />
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
        <span className="block text-[12px] font-semibold text-gray-600 mb-1.5">
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

/* ---------------- Chip ---------------- */

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
        "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-semibold border-[1.4px] whitespace-nowrap",
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

/* ---------------- Badge ---------------- */

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
        "inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold",
        styles[variant],
      )}
    >
      {children}
    </span>
  );
}

/* ---------------- Avatar ---------------- */

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

/* ---------------- Card ---------------- */

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
        "bg-white border border-gray-100 rounded-2xl p-3.5 shadow-[0_2px_10px_rgba(33,37,44,0.04)]",
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
