import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/styles/performance.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AudioManager } from "@/components/audio-manager";
import { BottomPlayer } from "@/components/bottom-player";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Self-Music - 音乐流媒体平台",
  description: "现代化的音乐流媒体网站，专注于提供优美的播放体验",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* 全局音频管理器 */}
          <AudioManager />
          
          {/* 页面内容 */}
          <div className="relative pb-20 lg:pb-24">
            {children}
          </div>
          
          {/* 底部播放器 */}
          <BottomPlayer />
        </ThemeProvider>
      </body>
    </html>
  );
}
