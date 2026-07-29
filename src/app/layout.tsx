import type { Metadata, Viewport } from "next";
import AuthProvider from "@/components/AuthProvider";
import PwaRegister from "@/components/PwaRegister";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://billlog.vercel.app"),

  title: "Billlog | 모임을 기록하는 가장 쉬운 방법",
  description: "모임 생성부터 계획, 정산, 기록까지 한 번에.",

  manifest: "/manifest.webmanifest",

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/icon-192.png",
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Billlog",
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

export const viewport: Viewport = {
  themeColor: "#1068c1",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
        <PwaRegister />
      </body>
    </html>
  );
}
