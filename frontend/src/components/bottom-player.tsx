'use client';

import { usePathname, useRouter } from 'next/navigation';
import { usePlayerStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { MiniPlayerControls } from '@/components/player-controls';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, Heart, MoreHorizontal } from 'lucide-react';

export function BottomPlayer() {
  const pathname = usePathname();
  const router = useRouter();
  
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    play,
    pause,
    nextSong,
    previousSong,
    setCurrentTime,
    seekTo,
  } = usePlayerStore();

  // 在播放页面不显示底部播放器
  const isPlayPage = pathname === '/play' || pathname?.startsWith('/play/');
  
  // 没有当前歌曲时不显示
  if (!currentSong || isPlayPage) return null;

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const handleExpandToFullPlayer = () => {
    router.push('/play');
  };

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    seekTo(newTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-[100]",
          "bg-background/95 backdrop-blur-md border-t border-border",
          "shadow-lg"
        )}
      >
        {/* 进度条 */}
        <div className="w-full h-1 bg-muted relative overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            style={{ width: `${progress}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
          {/* 隐藏的可交互slider */}
          <Slider
            value={[currentTime]}
            max={duration}
            step={1}
            onValueChange={handleSeek}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>

        <div className="p-3 lg:p-4">
          <div className="flex items-center justify-between">
            {/* 左侧：歌曲信息 */}
            <div 
              className="flex items-center space-x-3 flex-1 min-w-0 cursor-pointer"
              onClick={handleExpandToFullPlayer}
            >
              {/* 封面 */}
              <div className="relative w-12 h-12 lg:w-14 lg:h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                {currentSong.coverUrl ? (
                  <img
                    src={currentSong.coverUrl}
                    alt={currentSong.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">♪</span>
                  </div>
                )}
              </div>

              {/* 歌曲信息 */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-foreground truncate">
                  {currentSong.title}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  {currentSong.artist}
                </p>
                {/* Mobile: 显示时间信息 */}
                <p className="text-xs text-muted-foreground lg:hidden">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </p>
              </div>
            </div>

            {/* 中间：播放控制按钮 */}
            <div className="flex items-center space-x-2 mx-4">
              <MiniPlayerControls
                isPlaying={isPlaying}
                onPlayPause={handlePlayPause}
                onPrevious={previousSong}
                onNext={nextSong}
              />
            </div>

            {/* 右侧：其他操作 */}
            <div className="flex items-center space-x-2 shrink-0">
              {/* Desktop: 显示时间 */}
              <div className="hidden lg:block text-xs text-muted-foreground whitespace-nowrap">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
              
              {/* 喜欢按钮 */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hidden sm:flex"
              >
                <Heart className="h-4 w-4" />
              </Button>

              {/* 更多选项 */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hidden sm:flex"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>

              {/* 展开按钮 */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleExpandToFullPlayer}
                className="h-8 w-8"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}