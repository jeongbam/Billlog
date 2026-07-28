import type { Metadata } from "next";
import AuthProvider from "@/components/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://YOUR-DOMAIN.vercel.app"), // 실제 도메인으로 변경

  title: "Billlog | 모임을 기록하는 가장 쉬운 방법",
  description: "모임 생성부터 계획, 정산, 기록까지 한 번에.",

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },

  openGraph: {
    title: "Billlog | 모임을 기록하는 가장 쉬운 방법",
    description: "모임 생성부터 계획, 정산, 기록까지 한 번에.",
    url: "https://billlog.vercel.app",
    siteName: "Billlog",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Billlog",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
