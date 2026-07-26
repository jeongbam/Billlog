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
            priority
          />
          <h1 className="text-[32px] font-bold leading-[1.35] mt-4">
            모임을 기록하는 가장 쉬운 방법
          </h1>
          <p className="text-[18px] text-gray-600 mt-2.5 leading-relaxed">
            계획부터 정산, 추억까지
            <br />
            하나의 모임 카드에 담아보세요
          </p>

          <div className="mt-10 flex justify-center">
            <div className="w-56 h-56 rounded-[28px] bg-mint-50 flex items-center justify-center">
              <div className="w-40 h-28 bg-white rounded-xl shadow-[0_10px_30px_rgba(16,104,193,0.14)] flex flex-col p-3.5 gap-1.5">
                <div className="w-3/5 h-2 bg-mint-200 rounded" />
                <div className="w-2/5 h-2 bg-gray-100 rounded" />
                <div className="mt-auto flex justify-between items-center">
                  <div className="w-6 h-6 rounded-full bg-mint-300" />
                  <div className="text-[16px] text-mint-500">158,000원</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <Link href="/signup">
            <Button>시작하기</Button>
          </Link>
          <div className="text-center text-[16px] mt-3.5">
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
