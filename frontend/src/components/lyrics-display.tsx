'use client';

import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSafariOptimizedAnimation, getIOSScrollFix } from '@/lib/safari-fixes';

interface LyricLine {
  time: number;
  text: string;
}

interface LyricsDisplayProps {
  lyrics: LyricLine[];
  currentTime: number;
  onLyricClick: (time: number) => void;
  className?: string;
  // 在窄屏模式下启用精简显示（长行省略号）
  compact?: boolean;
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
  compact = false,
}: LyricsDisplayProps) {
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [manualScrollOffset, setManualScrollOffset] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [touchStartOffset, setTouchStartOffset] = useState(0);
  const [isTouchScrolling, setIsTouchScrolling] = useState(false);
  const touchRafRef = useRef<number | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  
  // Get Safari and iOS optimizations
  const safariAnimationStyles = getSafariOptimizedAnimation();
  const iosScrollStyles = getIOSScrollFix();

  // Initialize component after mount to prevent hydration mismatch
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (touchRafRef.current !== null) {
        cancelAnimationFrame(touchRafRef.current);
      }
    };
  }, []);

  // Find current lyric line
  useEffect(() => {
    if (isInitialized) {
      const lineIndex = lyrics.findLastIndex(lyric => currentTime >= lyric.time);
      setCurrentLineIndex(lineIndex);
    }
  }, [currentTime, lyrics, isInitialized]);

  // Handle scroll state management with cleanup
  const handleScrollStart = () => {
    setIsUserScrolling(true);
    
    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
  };

  const handleScrollEnd = () => {
    // Resume auto-scroll after 3 seconds of no scrolling
    scrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
      setManualScrollOffset(0);
      setIsTouchScrolling(false);
    }, 3000);
  };

  const updateScrollOffset = (delta: number) => {
    setManualScrollOffset(delta);
  };

  // Optimized touch scroll handler
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isTouchScrolling) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const touch = e.touches[0];
    const touchDelta = touchStartY - touch.clientY;
    const newOffset = touchStartOffset + touchDelta;
    
    // Cancel previous RAF if pending
    if (touchRafRef.current !== null) {
      cancelAnimationFrame(touchRafRef.current);
    }
    
    // Schedule update for next frame
    touchRafRef.current = requestAnimationFrame(() => {
      updateScrollOffset(newOffset);
      touchRafRef.current = null;
    });
  };

  // Auto-scroll with smooth animation - keep current line centered
  useEffect(() => {
    if (lyricsContainerRef.current && currentLineIndex >= 0 && lyrics.length > 0) {
      const container = lyricsContainerRef.current;
      const parentContainer = container.parentElement;
      
      if (!parentContainer) return;
      
      // Use requestAnimationFrame for better performance and avoid layout thrashing
      const updateTransform = () => {
        const currentLineElement = container.children[currentLineIndex] as HTMLElement;
        if (!currentLineElement) return;
        
        const parentHeight = parentContainer.clientHeight;
        const parentCenterY = parentHeight / 2;
        
        // Get current line's position relative to its container
        const lineTop = currentLineElement.offsetTop;
        const lineHeight = currentLineElement.offsetHeight;
        const lineCenterY = lineTop + lineHeight / 2;
        
        // Calculate how much to translate to center the current line
        const baseTranslateY = parentCenterY - lineCenterY;
        
        if (!isUserScrolling) {
          // Normal auto-scroll mode - use CSS custom property for better performance
          container.style.setProperty('--translate-y', `${baseTranslateY}px`);
          container.style.transform = 'translateY(var(--translate-y)) translateZ(0)'; // Force GPU acceleration
          container.style.transition = 'transform 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)';
        } else if (isTouchScrolling) {
          // Touch scrolling - no transition for immediate response
          const finalTranslateY = baseTranslateY - manualScrollOffset;
          container.style.setProperty('--translate-y', `${finalTranslateY}px`);
          container.style.transform = 'translateY(var(--translate-y)) translateZ(0)';
          container.style.transition = 'none';
        } else {
          // Mouse wheel scrolling - slight transition for smoothness
          const finalTranslateY = baseTranslateY - manualScrollOffset;
          container.style.setProperty('--translate-y', `${finalTranslateY}px`);
          container.style.transform = 'translateY(var(--translate-y)) translateZ(0)';
          container.style.transition = 'transform 0.1s ease-out';
        }
      };

      requestAnimationFrame(updateTransform);
    }
  }, [currentLineIndex, lyrics, isUserScrolling, manualScrollOffset, isTouchScrolling]);

  if (!isInitialized) {
    return (
      <div className={cn(
        "flex items-center justify-center h-64 text-muted-foreground",
        className
      )}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-2"
        >
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">加载歌词中...</p>
        </motion.div>
      </div>
    );
  }

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
    <div 
      className={cn("h-full relative overflow-hidden", className)}
      onWheel={(e) => {
        e.preventDefault();
        e.stopPropagation();
        
        handleScrollStart();
        // Reduce scroll sensitivity for better control - from 1.5 to 0.8
        updateScrollOffset(manualScrollOffset + e.deltaY * 0.8);
        handleScrollEnd();
      }}
      onTouchStart={(e) => {
        const touch = e.touches[0];
        setTouchStartY(touch.clientY);
        setTouchStartOffset(manualScrollOffset);
        setIsTouchScrolling(true);
        handleScrollStart();
      }}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => {
        setIsTouchScrolling(false);
        // Cancel any pending RAF
        if (touchRafRef.current !== null) {
          cancelAnimationFrame(touchRafRef.current);
          touchRafRef.current = null;
        }
        handleScrollEnd();
      }}
        style={{
          ...safariAnimationStyles,
          ...iosScrollStyles,
          touchAction: 'none', // 阻止默认的触摸滚动行为
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none'
        }}
    >
      {/* Manual scroll indicator */}
      {/* <AnimatePresence>
        {isUserScrolling && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
          >
            {isTouchScrolling ? '触摸滚动中...' : '手动滚动中...'}
          </motion.div>
        )}
      </AnimatePresence> */}
      
      <div 
        ref={lyricsContainerRef}
        className={cn(
          "absolute inset-0 space-y-3 md:space-y-4 px-2 md:px-4 min-h-full",
          "will-change-transform", // Optimize for transform animations
          isTouchScrolling ? "cursor-grabbing" : "cursor-grab",
          "select-none"
        )}
        style={{
          ...safariAnimationStyles,
          backfaceVisibility: 'hidden', // Reduce flickering
          perspective: '1000px', // Enable 3D acceleration
        }}
      >
        {lyrics.map((lyric, index) => {
          const isActive = index === currentLineIndex;
          const isPassed = index < currentLineIndex;
          const isHovered = index === hoveredIndex;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                duration: 0.6, 
                delay: isInitialized ? index * 0.05 : 0,
                ease: [0.4, 0, 0.2, 1] 
              }}
              className={cn(
                "cursor-pointer transition-all duration-300 ease-in-out relative group",
                "hover:bg-transparent rounded-lg px-3 md:px-6 py-3 md:py-4", // 移除灰色背景
                "text-center min-h-[60px] md:min-h-[72px] flex items-center justify-center w-full"
              )}
              onClick={() => {
                // 重置手动滚动状态
                if (scrollTimeoutRef.current) {
                  clearTimeout(scrollTimeoutRef.current);
                }
                setIsUserScrolling(false);
                setManualScrollOffset(0);
                setIsTouchScrolling(false); // 同时重置触摸滚动状态
                
                // 调用原来的点击处理
                onLyricClick(lyric.time);
                
                // 强制重新计算位置
                setTimeout(() => {
                  if (lyricsContainerRef.current) {
                    const container = lyricsContainerRef.current;
                    const parentContainer = container.parentElement;
                    
                    if (parentContainer) {
                      const clickedElement = container.children[index] as HTMLElement;
                      if (clickedElement) {
                        const parentHeight = parentContainer.clientHeight;
                        const parentCenterY = parentHeight / 2;
                        
                        const lineTop = clickedElement.offsetTop;
                        const lineHeight = clickedElement.offsetHeight;
                        const lineCenterY = lineTop + lineHeight / 2;
                        
                        const translateY = parentCenterY - lineCenterY;
                        
                        container.style.transform = `translateY(${translateY}px)`;
                        container.style.transition = 'transform 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)';
                      }
                    }
                  }
                }, 100);
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(-1)}
            >
              {/* 左侧装饰线 */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20"
                  >
                    <div className="w-6 md:w-12 h-px bg-gradient-to-r from-primary/60 to-primary/20"></div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 右侧装饰线和时间 */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 flex items-center gap-2 md:gap-3"
                  >
                    <div className="bg-popover/95 backdrop-blur-sm border rounded-md px-2 md:px-3 py-1 md:py-1.5 text-xs text-popover-foreground shadow-lg">
                      {formatTime(lyric.time)}
                    </div>
                    <div className="w-6 md:w-12 h-px bg-gradient-to-l from-primary/60 to-primary/20"></div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* 歌词文本容器 - 确保完全居中 */}
              <div className="flex-1 flex items-center justify-center">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: 1,
                    scale: isActive ? 1.05 : 1
                  }}
                  transition={{ 
                    opacity: { duration: 0.4, delay: index * 0.03 },
                    scale: { duration: 0.3 }
                  }}
                  className={cn(
                    "text-base leading-relaxed transition-all duration-300",
                    "select-none relative z-10 text-center",
                    // 窄屏精简显示：长行省略号；中等及以上屏幕不截断
                    compact && "w-full line-clamp-1 md:line-clamp-none",
                    {
                      "text-xl lg:text-2xl font-semibold text-primary": isActive,
                      "text-muted-foreground/60 hover:text-muted-foreground": isPassed,
                      "text-muted-foreground hover:text-foreground": !isActive && !isPassed,
                    }
                  )}
                >
                  {lyric.text}
                </motion.p>
              </div>
            </motion.div>
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
  // 窄屏精简显示（默认启用，桌面端不受影响）
  compact?: boolean;
}

export function LyricsCard({
  lyrics,
  currentTime,
  onLyricClick,
  className,
  title = "",
  onFullscreen,
  compact = true,
}: LyricsCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      className={cn("w-full h-full max-w-lg flex flex-col", className)}
    >
      {/* Header with fullscreen button */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-4 text-center flex-shrink-0 flex items-center justify-between"
      >
        <div className="flex-1">
          <h3 className="text-lg font-medium text-foreground">{title}</h3>
        </div>
        {onFullscreen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onFullscreen}
            className="ml-4 p-2 hover:bg-accent/20 rounded-lg transition-colors duration-200 group hidden md:inline-flex"
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
          </motion.button>
        )}
      </motion.div>

      {/* Lyrics content - fill remaining height */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex-1 min-h-0"
      >
        <LyricsDisplay
          lyrics={lyrics}
          currentTime={currentTime}
          onLyricClick={onLyricClick}
          compact={compact}
        />
      </motion.div>
    </motion.div>
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
