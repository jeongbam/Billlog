"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui";
import { useAuthStore } from "@/store/useAuthStore";
import Image from "next/image";

export default function LandingPage() {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace("/home");
  }, [loading, user, router]);

  return (
    <div className="min-h-screen bg-[#E7ECF3] flex justify-center">
      <div className="w-full max-w-md bg-white min-h-screen flex flex-col justify-between px-6 pt-16 pb-9 shadow-xl">
        <div>
          <Image
            src="/logo.svg"
            alt="Billlog"
            width={140}
            height={40}
            className="w-22 h-auto"
          />
          <h1 className="text-[28px] font-bold mt-2">
            모임을 기록하는 가장 쉬운 방법
          </h1>
          <p className="text-[18px] text-gray-600 mt-2">
            계획부터 정산, 추억까지
            <br />
            하나의 모임 카드에 담아보세요
          </p>
        </div>
        <Image
          src="/onboarding.png"
          alt="온보딩"
          width={390}
          height={330}
          priority
          className="w-full h-auto mb-2"
        />

        <div>
          <Link href="/signup">
            <Button>시작하기</Button>
          </Link>
          <div className="text-center text-[16px] mt-3">
            <span className="text-gray-400">이미 계정이 있나요? </span>
            <Link href="/login" className="font-bold text-gray-900">
              로그인
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
