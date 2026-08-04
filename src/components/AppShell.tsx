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
import Image from "next/image";

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
    <div className="h-dvh bg-[#E7ECF3] flex justify-center">
      <div className="relative w-full max-w-md h-full bg-white flex flex-col shadow-xl overflow-hidden">
        {(title || logo || bell || backHref !== undefined) && (
          <header className="flex-none flex items-center gap-3 px-4 py-3 min-h-[52px]">
            {backHref !== undefined && (
              <button
                onClick={() =>
                  backHref ? router.push(backHref) : router.back()
                }
                aria-label="뒤로가기"
                className="text-gray-800"
              >
                <ChevronLeftIcon size={24} />
              </button>
            )}
            <div className="flex-1 min-w-0">
              {logo ? (
                <Image
                  src="/logo.svg"
                  alt="Billlog"
                  width={80}
                  height={10}
                  priority
                />
              ) : (
                <>
                  <div className="text-[22px] font-bold truncate">{title}</div>
                  {backLabel && (
                    <div className="text-[16px] text-gray-400 font-semibold">
                      {backLabel}
                    </div>
                  )}
                </>
              )}
            </div>
            {bell && (
              <Link href="/notifications" className="relative text-gray-800">
                <BellIcon size={26} />
                {hasUnread && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-white bg-error" />
                )}
              </Link>
            )}
          </header>
        )}

        <main className="flex-1 overflow-y-auto px-4 pb-28">{children}</main>

        {bottomNav && (
          <nav
            className="
              fixed
              bottom-0
              left-1/2
              -translate-x-1/2
              z-50
              w-full
              max-w-md
              flex
              items-end
              justify-around
              border-t
              border-gray-100
              bg-white
              pt-2
              pb-[calc(env(safe-area-inset-bottom)+20px)]
              shadow-[0_-2px_10px_rgba(0,0,0,0.06)]
            "
          >
            <Link
              href="/home"
              className={`flex flex-col items-center gap-1 text-[14px] font-semibold w-[74px] ${
                pathname?.startsWith("/home")
                  ? "text-mint-500"
                  : "text-gray-400"
              }`}
            >
              <HomeIcon size={24} />홈
            </Link>
            <Link
              href="/meetings/new"
              className="flex items-center justify-center w-[50px] h-[50px] rounded-full bg-gray-900 text-white -mt-6 shadow-lg"
              aria-label="모임 만들기"
            >
              <PlusIcon size={24} />
            </Link>
            <Link
              href="/mypage"
              className={`flex flex-col items-center gap-1 text-[14px] font-semibold w-[74px] ${
                pathname?.startsWith("/mypage")
                  ? "text-mint-500"
                  : "text-gray-400"
              }`}
            >
              <UserIcon size={24} />
              마이페이지
            </Link>
          </nav>
        )}
      </div>
    </div>
  );
}
