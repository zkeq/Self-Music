'use client';

import { cn } from '@/lib/utils';
import { LyricsDisplay } from './lyrics-display';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

interface LyricLine {
  time: number;
  text: string;
}

interface FullscreenLyricsProps {
  lyrics: LyricLine[];
  currentTime: number;
  onLyricClick: (time: number) => void;
  isOpen: boolean;
  onClose: () => void;
  songTitle?: string;
  artistName?: string;
  className?: string;
}

export function FullscreenLyrics({
  lyrics,
  currentTime,
  onLyricClick,
  isOpen,
  onClose,
  songTitle = "",
  artistName = "",
  className,
}: FullscreenLyricsProps) {
  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-background/95 backdrop-blur-xl z-50"
            onClick={onClose}
          />
          
          {/* Fullscreen Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className={cn(
              "fixed inset-0 z-50 flex flex-col",
              "bg-gradient-to-br from-background/50 to-background/80",
              "backdrop-blur-2xl",
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex-shrink-0 p-4 md:p-6 border-b border-border/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="hover:bg-accent/20"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <div className="flex flex-col">
                    {songTitle && (
                      <h1 className="text-xl md:text-2xl font-semibold text-foreground">
                        {songTitle}
                      </h1>
                    )}
                    {artistName && (
                      <p className="text-sm md:text-base text-muted-foreground">
                        {artistName}
                      </p>
                    )}
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="hover:bg-accent/20 md:hidden"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Lyrics Content */}
            <div className="flex-1 min-h-0 p-4 md:p-8">
              <div className="h-full max-w-3xl mx-auto">
                <LyricsDisplay
                  lyrics={lyrics}
                  currentTime={currentTime}
                  onLyricClick={onLyricClick}
                  className="h-full"
                />
              </div>
            </div>

            {/* Footer Hint */}
            <div className="flex-shrink-0 p-4 text-center">
              <p className="text-xs text-muted-foreground/60">
                点击歌词行可跳转到对应位置 • 点击空白区域或按 ESC 键退出
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}