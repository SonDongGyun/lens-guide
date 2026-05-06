import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "내게 맞는 렌즈 찾기 | LensGuide",
  description: "1분 만에 내게 맞는 렌즈를 비교하고 이해하는 인터랙티브 안내 시스템",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F9FAFB",
  // viewport-fit=cover lets the page extend under the iOS notch/home
  // indicator so env(safe-area-inset-*) reports non-zero — without it
  // KioskFrame's safe-area padding silently no-ops on notched iPhones.
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={pretendard.variable} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
