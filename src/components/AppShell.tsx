"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { subscribeNotifications } from "@/lib/notifications";
import { useAuthStore } from "@/store/useAuthStore";
import {
  BellIcon,
  ChevronLeftIcon,
  HomeIcon,
  PlusIcon,
  UserIcon,
} from "./icons";

export function AppShell({
  title,
  logo,
  backHref,
  backLabel,
  bell,
  bottomNav,
  children,
}: {
  title?: string;
  logo?: boolean;
  backHref?: string;
  backLabel?: string;
  bell?: boolean;
  bottomNav?: boolean;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (!bell || !user) return;
    return subscribeNotifications(user.uid, (items) => {
      setHasUnread(items.some((n) => !n.read));
    });
  }, [bell, user]);

  return (
    <div className="min-h-screen bg-[#E7ECF3] flex justify-center">
      <div className="w-full max-w-md bg-white min-h-screen flex flex-col relative shadow-xl">
        {(title || logo || bell || backHref !== undefined) && (
          <header className="flex-none flex items-center gap-3 px-4 py-3 min-h-[52px]">
            {backHref !== undefined && (
              <button
                onClick={() => (backHref ? router.push(backHref) : router.back())}
                aria-label="뒤로가기"
                className="text-gray-800"
              >
                <ChevronLeftIcon size={22} />
              </button>
            )}
            <div className="flex-1 min-w-0">
              {logo ? (
                <span className="text-[20px] font-extrabold text-mint-500 tracking-tight">
                  Billlog
                </span>
              ) : (
                <>
                  <div className="text-[17px] font-bold truncate">{title}</div>
                  {backLabel && (
                    <div className="text-[12px] text-gray-400 font-semibold">
                      {backLabel}
                    </div>
                  )}
                </>
              )}
            </div>
            {bell && (
              <Link href="/notifications" className="text-gray-800 relative">
                <BellIcon size={22} />
                {hasUnread && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-error rounded-full border border-white" />
                )}
              </Link>
            )}
          </header>
        )}

        <main className="flex-1 overflow-y-auto px-4 pb-6">{children}</main>

        {bottomNav && (
          <nav className="flex-none flex items-end justify-around border-t border-gray-100 bg-white pt-2 pb-6 relative">
            <Link
              href="/home"
              className={`flex flex-col items-center gap-1 text-[10.5px] font-semibold w-[74px] ${
                pathname?.startsWith("/home") ? "text-mint-500" : "text-gray-400"
              }`}
            >
              <HomeIcon size={21} />홈
            </Link>
            <Link
              href="/meetings/new"
              className="w-[50px] h-[50px] rounded-full bg-gray-900 text-white flex items-center justify-center -mt-6 shadow-lg"
              aria-label="모임 만들기"
            >
              <PlusIcon size={20} />
            </Link>
            <Link
              href="/mypage"
              className={`flex flex-col items-center gap-1 text-[10.5px] font-semibold w-[74px] ${
                pathname?.startsWith("/mypage") ? "text-mint-500" : "text-gray-400"
              }`}
            >
              <UserIcon size={21} />마이페이지
            </Link>
          </nav>
        )}
      </div>
    </div>
  );
}
