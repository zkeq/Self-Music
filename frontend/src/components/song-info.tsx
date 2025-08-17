'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Music } from 'lucide-react';
import { useEffect, useState } from 'react';
import { extractColorsFromImage, getDefaultColorPalette, createColorCSSVariables, ColorPalette } from '@/lib/color-utils';

import { Song, getAllArtistNames, getPrimaryArtist } from '@/types/index';
import { getIconComponent } from '@/lib/icon-map';

interface AlbumCoverProps {
  song: Song;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AlbumCover({ song, className, size = 'lg' }: AlbumCoverProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [colorPalette, setColorPalette] = useState<ColorPalette>(getDefaultColorPalette());
  const [cssVars, setCssVars] = useState<Record<string, string>>({});

  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-32 w-32',
    lg: 'h-48 w-48 lg:h-64 lg:w-64 xl:h-80 xl:w-80',
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
          alt={`${song.title} - ${getAllArtistNames(song)}`}
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
            title={getAllArtistNames(song)}
          >
            {getAllArtistNames(song)}
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className={cn("text-center space-y-2 lg:space-y-4", className)}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      {/* Song Title */}
      <motion.h2 
        className="text-xl lg:text-2xl xl:text-3xl font-bold text-foreground leading-tight"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {song.title}
      </motion.h2>
      
      {/* Artist */}
      <motion.p 
        className="text-base lg:text-lg text-muted-foreground"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35 }}
        title={getAllArtistNames(song)}
      >
        {getAllArtistNames(song)}
      </motion.p>
      
      {/* Album */}
      <motion.p 
        className="text-xs lg:text-sm text-muted-foreground/80"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        专辑：{song.album?.title || '未知专辑'}
        {song.album && song.album.artists && song.album.artists.length > 1 && (
          <span className="text-xs opacity-70">
            {' '}(与 {getAllArtistNames(song.album)} 合作)
          </span>
        )}
      </motion.p>
      
      {/* Duration */}
      <motion.p 
        className="text-xs lg:text-sm text-muted-foreground/60"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.45 }}
      >
        时长：{formatDuration(song.duration)}
      </motion.p>
      
      {/* Mood Tags */}
      {song.moods && song.moods.length > 0 && (
        <motion.div 
          className="flex flex-wrap justify-center gap-1 lg:gap-2"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {song.moods.map((mood) => {
            const getMoodVariant = (moodName: string) => {
              const moodStyles: Record<string, { 
                className: string; 
                style?: React.CSSProperties;
              }> = {
                '快乐': {
                  className: 'border-amber-200/40 bg-gradient-to-br from-amber-50/80 to-yellow-50/50 text-amber-800 dark:border-amber-800/30 dark:from-amber-950/50 dark:to-yellow-950/30 dark:text-amber-200 shadow-amber-500/10',
                },
                '放松': {
                  className: 'border-emerald-200/40 bg-gradient-to-br from-emerald-50/80 to-teal-50/50 text-emerald-800 dark:border-emerald-800/30 dark:from-emerald-950/50 dark:to-teal-950/30 dark:text-emerald-200 shadow-emerald-500/10',
                },
                '专注': {
                  className: 'border-blue-200/40 bg-gradient-to-br from-blue-50/80 to-indigo-50/50 text-blue-800 dark:border-blue-800/30 dark:from-blue-950/50 dark:to-indigo-950/30 dark:text-blue-200 shadow-blue-500/10',
                },
                '浪漫': {
                  className: 'border-rose-200/40 bg-gradient-to-br from-rose-50/80 to-pink-50/50 text-rose-800 dark:border-rose-800/30 dark:from-rose-950/50 dark:to-pink-950/30 dark:text-rose-200 shadow-rose-500/10',
                },
                '活力': {
                  className: 'border-red-200/40 bg-gradient-to-br from-red-50/80 to-orange-50/50 text-red-800 dark:border-red-800/30 dark:from-red-950/50 dark:to-orange-950/30 dark:text-red-200 shadow-red-500/10',
                },
                '怀旧': {
                  className: 'border-orange-200/40 bg-gradient-to-br from-orange-50/80 to-amber-50/50 text-orange-800 dark:border-orange-800/30 dark:from-orange-950/50 dark:to-amber-950/30 dark:text-orange-200 shadow-orange-500/10',
                },
                '忧郁': {
                  className: 'border-slate-200/40 bg-gradient-to-br from-slate-50/80 to-gray-50/50 text-slate-700 dark:border-slate-700/30 dark:from-slate-900/50 dark:to-gray-900/30 dark:text-slate-300 shadow-slate-500/10',
                },
                '动感': {
                  className: 'border-cyan-200/40 bg-gradient-to-br from-cyan-50/80 to-sky-50/50 text-cyan-800 dark:border-cyan-800/30 dark:from-cyan-950/50 dark:to-sky-950/30 dark:text-cyan-200 shadow-cyan-500/10',
                },
                '温暖': {
                  className: 'border-orange-200/40 bg-gradient-to-br from-orange-50/80 to-red-50/50 text-orange-800 dark:border-orange-800/30 dark:from-orange-950/50 dark:to-red-950/30 dark:text-orange-200 shadow-orange-500/10',
                },
                '清新': {
                  className: 'border-green-200/40 bg-gradient-to-br from-green-50/80 to-emerald-50/50 text-green-800 dark:border-green-800/30 dark:from-green-950/50 dark:to-emerald-950/30 dark:text-green-200 shadow-green-500/10',
                }
              };
              
              return moodStyles[moodName] || {
                className: 'border-gray-200/40 bg-gradient-to-br from-gray-50/80 to-slate-50/50 text-gray-700 dark:border-gray-700/30 dark:from-gray-900/50 dark:to-slate-900/30 dark:text-gray-300 shadow-gray-500/10',
              };
            };

            const moodStyle = getMoodVariant(mood.name);
            const IconComponent = getIconComponent(mood.icon, Music);
            
            return (
              <motion.div
                key={mood.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  delay: 0.6 + (song.moods?.indexOf(mood) ?? 0) * 0.08,
                  duration: 0.4,
                  ease: [0.4, 0, 0.2, 1]
                }}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <Badge
                  variant="outline"
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium transition-all duration-300 cursor-default",
                    "hover:shadow-lg backdrop-blur-sm border-2",
                    "ring-0 focus-visible:ring-2 focus-visible:ring-offset-2",
                    "flex items-center gap-1.5",
                    moodStyle.className
                  )}
                  style={moodStyle.style}
                >
                  <IconComponent className="h-3 w-3" />
                  {mood.name}
                </Badge>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}