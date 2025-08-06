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

export function LyricsDisplay({
  lyrics,
  currentTime,
  onLyricClick,
  className,
}: LyricsDisplayProps) {
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  // Find current lyric line
  useEffect(() => {
    const lineIndex = lyrics.findLastIndex(lyric => currentTime >= lyric.time);
    setCurrentLineIndex(lineIndex);
  }, [currentTime, lyrics]);

  // Auto-scroll with smooth animation - translate the entire container
  useEffect(() => {
    if (lyricsContainerRef.current && currentLineIndex >= 0) {
      // Calculate the offset to keep current line in center
      // Each line has approximately 64px height (py-3 + text + spacing)
      const lineHeight = 64;
      const containerHeight = lyricsContainerRef.current.parentElement?.clientHeight || 0;
      const centerOffset = containerHeight / 2;
      const translateY = centerOffset - (currentLineIndex * lineHeight) - (lineHeight / 2);
      
      lyricsContainerRef.current.style.transform = `translateY(${translateY}px)`;
      lyricsContainerRef.current.style.transition = 'transform 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)';
    }
  }, [currentLineIndex]);

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
        className="absolute inset-0 space-y-4 px-4"
      >
        {lyrics.map((lyric, index) => {
          const isActive = index === currentLineIndex;
          const isPassed = index < currentLineIndex;

          return (
            <div
              key={index}
              className={cn(
                "cursor-pointer transition-all duration-300 ease-in-out",
                "hover:bg-accent/20 rounded-lg px-4 py-3",
                "text-center min-h-[64px] flex items-center justify-center"
              )}
              onClick={() => onLyricClick(lyric.time)}
            >
              <p
                className={cn(
                  "text-base leading-relaxed transition-all duration-300",
                  "select-none",
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
}

export function LyricsCard({
  lyrics,
  currentTime,
  onLyricClick,
  className,
  title = "",
}: LyricsCardProps) {
  return (
    <div className={cn("w-full h-full max-w-lg flex flex-col", className)}>
      {/* Simple Header */}
      <div className="mb-4 text-center flex-shrink-0">
        <h3 className="text-lg font-medium text-foreground">{title}</h3>
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