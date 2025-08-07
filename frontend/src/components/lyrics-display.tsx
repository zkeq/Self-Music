'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

interface LyricLine {
  time: number;
  text: string;
}

interface LyricsDisplayProps {
  lyrics: LyricLine[];
  currentTime: number;
  onLyricClick: (time: number) => void;
  className?: string;
}

// 时间格式化函数
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export function LyricsDisplay({
  lyrics,
  currentTime,
  onLyricClick,
  className,
}: LyricsDisplayProps) {
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  // Find current lyric line
  useEffect(() => {
    const lineIndex = lyrics.findLastIndex(lyric => currentTime >= lyric.time);
    setCurrentLineIndex(lineIndex);
  }, [currentTime, lyrics]);

  // Auto-scroll with smooth animation - keep current line centered
  useEffect(() => {
    if (lyricsContainerRef.current && currentLineIndex >= 0 && lyrics.length > 0) {
      const container = lyricsContainerRef.current;
      const parentContainer = container.parentElement;
      
      if (!parentContainer) return;
      
      // Wait for DOM to update, then measure positions
      setTimeout(() => {
        const currentLineElement = container.children[currentLineIndex] as HTMLElement;
        if (!currentLineElement) return;
        
        const parentHeight = parentContainer.clientHeight;
        const parentCenterY = parentHeight / 2;
        
        // Get current line's position relative to its container
        const containerTop = container.offsetTop;
        const lineTop = currentLineElement.offsetTop;
        const lineHeight = currentLineElement.offsetHeight;
        const lineCenterY = lineTop + lineHeight / 2;
        
        // Calculate how much to translate to center the current line
        const translateY = parentCenterY - lineCenterY;
        
        container.style.transform = `translateY(${translateY}px)`;
        container.style.transition = 'transform 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)';
      }, 0);
    }
  }, [currentLineIndex, lyrics]);

  if (!lyrics.length) {
    return (
      <div className={cn(
        "flex items-center justify-center h-64 text-muted-foreground",
        className
      )}>
        <p className="text-center">
          暂无歌词<br />
          <span className="text-sm">享受音乐的旋律吧 ♪</span>
        </p>
      </div>
    );
  }

  return (
    <div className={cn("h-full relative overflow-hidden", className)}>
      <div 
        ref={lyricsContainerRef}
        className="absolute inset-0 space-y-3 md:space-y-4 px-2 md:px-4"
      >
        {lyrics.map((lyric, index) => {
          const isActive = index === currentLineIndex;
          const isPassed = index < currentLineIndex;
          const isHovered = index === hoveredIndex;

          return (
            <div
              key={index}
              className={cn(
                "cursor-pointer transition-all duration-300 ease-in-out relative group",
                "hover:bg-accent/40 rounded-lg px-3 md:px-6 py-3 md:py-4",
                "text-center min-h-[60px] md:min-h-[72px] flex items-center justify-center w-full",
                isHovered && "bg-accent/30"
              )}
              onClick={() => onLyricClick(lyric.time)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(-1)}
            >
              {/* 左侧装饰线 */}
              {isHovered && (
                <div className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="w-6 md:w-12 h-px bg-gradient-to-r from-primary/60 to-primary/20"></div>
                </div>
              )}

              {/* 右侧装饰线和时间 */}
              {isHovered && (
                <div className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2 md:gap-3">
                  <div className="bg-popover/95 backdrop-blur-sm border rounded-md px-2 md:px-3 py-1 md:py-1.5 text-xs text-popover-foreground shadow-lg">
                    {formatTime(lyric.time)}
                  </div>
                  <div className="w-6 md:w-12 h-px bg-gradient-to-l from-primary/60 to-primary/20"></div>
                </div>
              )}
              
              {/* 歌词文本容器 - 确保完全居中 */}
              <div className="flex-1 flex items-center justify-center">
                <p
                  className={cn(
                    "text-base leading-relaxed transition-all duration-300",
                    "select-none relative z-10 text-center",
                    {
                      "text-xl lg:text-2xl font-semibold text-primary": isActive,
                      "text-muted-foreground/60 hover:text-muted-foreground": isPassed,
                      "text-muted-foreground hover:text-foreground": !isActive && !isPassed,
                    }
                  )}
                >
                  {lyric.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface LyricsCardProps {
  lyrics: LyricLine[];
  currentTime: number;
  onLyricClick: (time: number) => void;
  className?: string;
  title?: string;
  onFullscreen?: () => void;
}

export function LyricsCard({
  lyrics,
  currentTime,
  onLyricClick,
  className,
  title = "",
  onFullscreen,
}: LyricsCardProps) {
  return (
    <div className={cn("w-full h-full max-w-lg flex flex-col", className)}>
      {/* Header with fullscreen button */}
      <div className="mb-4 text-center flex-shrink-0 flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-foreground">{title}</h3>
        </div>
        {onFullscreen && (
          <button
            onClick={onFullscreen}
            className="ml-4 p-2 hover:bg-accent/20 rounded-lg transition-colors duration-200 group"
            aria-label="全屏显示歌词"
          >
            <svg 
              className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" 
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
          </button>
        )}
      </div>

      {/* Lyrics content - fill remaining height */}
      <div className="flex-1 min-h-0">
        <LyricsDisplay
          lyrics={lyrics}
          currentTime={currentTime}
          onLyricClick={onLyricClick}
        />
      </div>
    </div>
  );
}

// Utility function to parse LRC format lyrics
export function parseLyrics(lrcContent: string): LyricLine[] {
  const lines = lrcContent.split('\n');
  const lyrics: LyricLine[] = [];

  for (const line of lines) {
    const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const milliseconds = parseInt(match[3].padEnd(3, '0'), 10);
      const text = match[4].trim();

      if (text) {
        lyrics.push({
          time: minutes * 60 + seconds + milliseconds / 1000,
          text,
        });
      }
    }
  }

  return lyrics.sort((a, b) => a.time - b.time);
}