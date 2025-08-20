import type { Metadata } from "next";
import "./globals.css";
import "@/styles/performance.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AudioManager } from "@/components/audio-manager";
import { BottomPlayer } from "@/components/bottom-player";
import { PageWrapper } from "@/components/page-wrapper";
import { PWAProvider } from "@/components/pwa-provider";
import { InstallPrompt } from "@/components/install-prompt";

export const metadata: Metadata = {
  title: "Self-Music - 音乐流媒体平台",
  description: "现代化的音乐流媒体网站，专注于提供优美的播放体验",
  manifest: "/manifest.json",
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Self-Music",
  },
  openGraph: {
    title: "Self-Music - 音乐流媒体平台",
    description: "现代化的音乐流媒体网站，专注于提供优美的播放体验",
    type: "website",
  },
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Self-Music" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body
        className="antialiased font-sans"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* PWA Service Worker Registration */}
          <PWAProvider />
          
          {/* 全局音频管理器 */}
          <AudioManager />
          
          {/* 页面内容 - 智能底部内边距管理 */}
          <PageWrapper>
            {children}
          </PageWrapper>
          
          {/* 底部播放器 */}
          <BottomPlayer />
          
          {/* PWA 安装提示 */}
          <InstallPrompt />
        </ThemeProvider>
      </body>
    </html>
  );
}
