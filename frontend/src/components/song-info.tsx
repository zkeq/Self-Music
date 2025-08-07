'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Music } from 'lucide-react';
import { useEffect, useState } from 'react';
import { extractColorsFromImage, getDefaultColorPalette, createColorCSSVariables, ColorPalette } from '@/lib/color-utils';

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl?: string;
  duration: number;
  mood?: string[];
}

interface AlbumCoverProps {
  song: Song;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AlbumCover({ song, className, size = 'lg' }: AlbumCoverProps) {
  const [colorPalette, setColorPalette] = useState<ColorPalette>(getDefaultColorPalette());
  const [cssVars, setCssVars] = useState<Record<string, string>>({});

  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-32 w-32',
    lg: 'h-64 w-64 lg:h-80 lg:w-80',
  };

  // Extract colors when cover image changes
  useEffect(() => {
    if (song.coverUrl) {
      extractColorsFromImage(song.coverUrl)
        .then(palette => {
          setColorPalette(palette);
          setCssVars(createColorCSSVariables(palette));
        })
        .catch(() => {
          const defaultPalette = getDefaultColorPalette();
          setColorPalette(defaultPalette);
          setCssVars(createColorCSSVariables(defaultPalette));
        });
    } else {
      const defaultPalette = getDefaultColorPalette();
      setColorPalette(defaultPalette);
      setCssVars(createColorCSSVariables(defaultPalette));
    }
  }, [song.coverUrl]);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className={cn("relative group", className)}
      style={cssVars}
    >
      {/* Enhanced Glow Effects */}
      <div className="absolute inset-0 -z-10">
        {/* Main glow */}
        <motion.div
          className="absolute inset-0 rounded-xl blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-700"
          style={{
            background: `radial-gradient(circle, rgba(var(--glow-dominant-rgb), 0.4) 0%, rgba(var(--glow-dominant-rgb), 0.2) 50%, transparent 80%)`
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Accent glow */}
        <motion.div
          className="absolute inset-0 rounded-xl blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-700"
          style={{
            background: `radial-gradient(circle, rgba(var(--glow-accent-rgb), 0.3) 20%, rgba(var(--glow-accent-rgb), 0.1) 60%, transparent 90%)`
          }}
          animate={{
            scale: [1.1, 0.9, 1.1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Outer ambient glow */}
        <motion.div
          className="absolute -inset-8 rounded-3xl blur-[60px] opacity-0 group-hover:opacity-30 transition-opacity duration-1000"
          style={{
            background: `conic-gradient(from 0deg, rgba(var(--glow-dominant-rgb), 0.2), rgba(var(--glow-accent-rgb), 0.2), rgba(var(--glow-muted-rgb), 0.2), rgba(var(--glow-dominant-rgb), 0.2))`
          }}
          animate={{
            rotate: [0, 360]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <Avatar className={cn(
        "rounded-xl shadow-2xl transition-all duration-500 relative z-10",
        "group-hover:shadow-3xl group-hover:scale-105",
        "ring-2 ring-white/10 group-hover:ring-white/20",
        sizeClasses[size]
      )}>
        <AvatarImage 
          src={song.coverUrl} 
          alt={`${song.title} - ${song.artist}`}
          className="object-cover"
        />
        <AvatarFallback className="rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20">
          <Music className={cn(
            "text-muted-foreground",
            size === 'lg' ? 'h-16 w-16' : size === 'md' ? 'h-8 w-8' : 'h-4 w-4'
          )} />
        </AvatarFallback>
      </Avatar>
      
      {/* Floating particles effect */}
      {size === 'lg' && Array.from({ length: 6 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/30 rounded-full opacity-0 group-hover:opacity-60"
          style={{
            left: `${20 + (i % 3) * 30}%`,
            top: `${20 + Math.floor(i / 3) * 40}%`
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, Math.sin(i) * 10, 0],
            opacity: [0, 0.6, 0],
            scale: [0, 1, 0]
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.8
          }}
        />
      ))}
    </motion.div>
  );
}

interface SongInfoProps {
  song: Song;
  className?: string;
  layout?: 'vertical' | 'horizontal';
}

export function SongInfo({ song, className, layout = 'vertical' }: SongInfoProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (layout === 'horizontal') {
    return (
      <div className={cn("flex items-center space-x-4", className)}>
        <AlbumCover song={song} size="sm" />
        <div className="min-w-0 flex-1">
          <motion.h3
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-lg font-semibold truncate"
          >
            {song.title}
          </motion.h3>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-muted-foreground truncate"
          >
            {song.artist}
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className={cn("text-center space-y-4", className)}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      {/* Song Title */}
      <motion.h2 
        className="text-2xl lg:text-3xl font-bold text-foreground leading-tight"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {song.title}
      </motion.h2>
      
      {/* Artist */}
      <motion.p 
        className="text-lg text-muted-foreground"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35 }}
      >
        {song.artist}
      </motion.p>
      
      {/* Album */}
      <motion.p 
        className="text-sm text-muted-foreground/80"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        专辑：{song.album}
      </motion.p>
      
      {/* Duration */}
      <motion.p 
        className="text-sm text-muted-foreground/60"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.45 }}
      >
        时长：{formatDuration(song.duration)}
      </motion.p>
      
      {/* Mood Tags */}
      {song.mood && song.mood.length > 0 && (
        <motion.div 
          className="flex flex-wrap justify-center gap-2"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {song.mood.map((mood) => (
            <Badge
              key={mood}
              variant="secondary"
              className="px-3 py-1 text-xs bg-primary/10 text-primary border-primary/20"
            >
              {mood}
            </Badge>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}