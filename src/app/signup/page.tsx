"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { GoogleIcon } from "@/components/icons";
import { Button, Input } from "@/components/ui";
import {
  authErrorMessage,
  signInWithGoogle,
  signUpWithEmail,
} from "@/lib/auth";

export default function SignupPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit =
    nickname.trim().length > 0 &&
    /\S+@\S+\.\S+/.test(email) &&
    password.length >= 6;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setLoading(true);
    try {
      await signUpWithEmail(email, password, nickname.trim());
      router.push("/onboarding");
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setLoading(true);
    try {
      const { isNewUser } = await signInWithGoogle();
      router.push(isNewUser ? "/onboarding" : "/home");
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell backHref="/">
      <div className="pt-2">
        <h1 className="text-[22px] font-bold">회원가입</h1>
        <p className="text-[17px] text-gray-500 mt-1.5 mb-6">
          이메일로 가입하거나 구글 계정으로 빠르게 시작하세요
        </p>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 border-[1.4px] border-gray-200 rounded-xl py-3.5 text-[14.5px] font-bold text-gray-800 mb-5 disabled:opacity-50"
        >
          <GoogleIcon size={18} />
          구글로 계속하기
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="h-px bg-gray-100 flex-1" />
          <span className="text-[11.5px] text-gray-400">
            또는 이메일로 가입
          </span>
          <div className="h-px bg-gray-100 flex-1" />
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            label="닉네임"
            placeholder="모임에서 보여질 이름"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={8}
          />
          <Input
            label="이메일"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="비밀번호"
            type="password"
            placeholder="6자 이상"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <p className="text-[16px] text-error-d mb-3 -mt-1">{error}</p>
          )}
          <Button
            type="submit"
            loading={loading}
            disabled={!canSubmit}
            className="mt-2"
          >
            시작하기
          </Button>
        </form>

        <div className="text-center text-[16px] mt-5">
          <span className="text-gray-400">이미 계정이 있나요? </span>
          <Link href="/login" className="font-bold text-gray-900">
            로그인
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
