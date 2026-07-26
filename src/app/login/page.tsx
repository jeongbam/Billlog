"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { GoogleIcon } from "@/components/icons";
import { Button, Input } from "@/components/ui";
import { authErrorMessage, signInWithEmail, signInWithGoogle } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = /\S+@\S+\.\S+/.test(email) && password.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      router.push("/home");
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
        <h1 className="text-[22px] font-bold">로그인</h1>
        <p className="text-[13px] text-gray-500 mt-1.5 mb-6">
          다시 만나서 반가워요
        </p>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 border-[1.4px] border-gray-200 rounded-2xl py-3.5 text-[14.5px] font-bold text-gray-800 mb-5 disabled:opacity-50"
        >
          <GoogleIcon size={18} />
          구글로 계속하기
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="h-px bg-gray-100 flex-1" />
          <span className="text-[11.5px] text-gray-400">또는 이메일로 로그인</span>
          <div className="h-px bg-gray-100 flex-1" />
        </div>

        <form onSubmit={handleSubmit}>
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
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <p className="text-[12.5px] text-error-d mb-3 -mt-1">{error}</p>
          )}
          <Button type="submit" loading={loading} disabled={!canSubmit} className="mt-2">
            로그인
          </Button>
        </form>

        <div className="text-center text-[12px] mt-5">
          <span className="text-gray-400">아직 계정이 없나요? </span>
          <Link href="/signup" className="font-bold text-gray-900">
            회원가입
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
