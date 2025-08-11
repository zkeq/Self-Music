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
    <div className="h-[100dvh] flex flex-col relative">
      <div className="flex-1 overflow-hidden">
        <div className={cn(
          "h-full overflow-auto",
          needBottomSpace && "pb-[76px] lg:pb-[92px]"
        )}>
          {children}
        </div>
      </div>
    </div>
  );
}