'use client';

import { usePathname } from 'next/navigation';
import { usePlayerStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface PageWrapperProps {
  children: React.ReactNode;
}

export function PageWrapper({ children }: PageWrapperProps) {
  const pathname = usePathname();
  const { currentSong } = usePlayerStore();
  
  // 在播放页面不显示底部播放器，所以不需要底部内边距
  const isPlayPage = pathname === '/play' || pathname?.startsWith('/play/');
  
  // 只有当有当前歌曲且不在播放页面时才需要为底部播放器预留空间
  const needBottomSpace = currentSong && !isPlayPage;
  
  return (
    <div className="h-screen flex flex-col">
      <div className={cn(
        "flex-1",
        needBottomSpace 
          ? "h-[calc(100vh-5.25rem)] lg:h-[calc(100vh-6.25rem)]" // 精确计算：进度条1px + 内容区域高度
          : "h-screen"
      )}>
        {children}
      </div>
    </div>
  );
}