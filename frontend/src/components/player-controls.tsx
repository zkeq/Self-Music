'use client';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  Heart,
} from 'lucide-react';

interface PlayerControlsProps {
  isPlaying: boolean;
  isShuffle: boolean;
  repeatMode: 'none' | 'all' | 'one';
  isMuted: boolean;
  isLiked: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onShuffle: () => void;
  onRepeat: () => void;
  onMute: () => void;
  onLike: () => void;
  onVolumeChange: (value: number[]) => void;
  onSeek: (value: number[]) => void;
  // Mobile-only fullscreen lyrics toggle
  onFullscreen?: () => void;
  className?: string;
}

export function PlayerControls({
  isPlaying,
  isShuffle,
  repeatMode,
  isMuted,
  isLiked,
  volume,
  currentTime,
  duration,
  onPlayPause,
  onPrevious,
  onNext,
  onShuffle,
  onRepeat,
  onMute,
  onLike,
  onVolumeChange,
  onSeek,
  onFullscreen,
  className,
}: PlayerControlsProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className={cn("space-y-6", className)}
    >
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Slider
            value={[currentTime]}
            max={duration}
            step={1}
            onValueChange={onSeek}
            className="w-full cursor-pointer"
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-center space-x-4">
        {/* Shuffle */}
        <Button
          variant={isShuffle ? "default" : "ghost"}
          size="icon"
          onClick={onShuffle}
          className={cn(
            "transition-all duration-200 hover:scale-110",
            isShuffle && "bg-primary text-primary-foreground"
          )}
        >
          <Shuffle className="h-4 w-4" />
        </Button>

        {/* Previous */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrevious}
          className="transition-all duration-200 hover:scale-110 hover:bg-accent"
        >
          <SkipBack className="h-5 w-5" />
        </Button>

        {/* Play/Pause */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="default"
            size="icon"
            onClick={onPlayPause}
            className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg transition-all duration-200"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-1" />
            )}
          </Button>
        </motion.div>

        {/* Next */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onNext}
          className="transition-all duration-200 hover:scale-110 hover:bg-accent"
        >
          <SkipForward className="h-5 w-5" />
        </Button>

        {/* Repeat */}
        <Button
          variant={repeatMode !== 'none' ? "default" : "ghost"}
          size="icon"
          onClick={onRepeat}
          className={cn(
            "transition-all duration-200 hover:scale-110",
            "min-w-10", // 设置最小宽度确保显示"1"时不会太挤
            repeatMode !== 'none' && "bg-primary text-primary-foreground"
          )}
          title={
            repeatMode === 'none' ? "开启循环播放" :
            repeatMode === 'all' ? "列表循环" :
            "单曲循环"
          }
        >
          <div className="flex items-center">
            <Repeat className="h-4 w-4" />
            {repeatMode === 'one' && (
              <span className="ml-1 text-xs font-medium">1</span>
            )}
          </div>
        </Button>
      </div>

      {/* Secondary Controls */}
      <div className="flex items-center justify-between">
        {/* Like Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onLike}
          className={cn(
            "transition-all duration-200 hover:scale-110",
            isLiked && "text-red-500 hover:text-red-600"
          )}
        >
          <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
        </Button>

        {/* Volume Control */}
        <div className="flex items-center space-x-2 flex-1 max-w-32 ml-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMute}
            className="h-8 w-8"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <Slider
            value={[volume]}
            max={100}
            step={1}
            onValueChange={onVolumeChange}
            className="flex-1"
          />
        </div>

        {/* Fullscreen Lyrics (mobile-only, placed to the right of volume) */}
        {onFullscreen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onFullscreen}
            className="h-8 w-8 ml-2 md:hidden"
            aria-label="全屏显示歌词"
            title="全屏显示歌词"
          >
            {/* Use same style as lyrics header icon for consistency */}
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          </Button>
        )}
      </div>
    </motion.div>
  );
}

interface MiniPlayerControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  className?: string;
}

export function MiniPlayerControls({
  isPlaying,
  onPlayPause,
  onPrevious,
  onNext,
  className,
}: MiniPlayerControlsProps) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrevious}
        className="h-8 w-8"
      >
        <SkipBack className="h-4 w-4" />
      </Button>
      
      <Button
        variant="default"
        size="icon"
        onClick={onPlayPause}
        className="h-10 w-10 rounded-full"
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4 ml-0.5" />
        )}
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onNext}
        className="h-8 w-8"
      >
        <SkipForward className="h-4 w-4" />
      </Button>
    </div>
  );
}
