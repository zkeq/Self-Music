'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Music } from 'lucide-react';

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
  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-32 w-32',
    lg: 'h-64 w-64 lg:h-80 lg:w-80',
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className={cn("relative group", className)}
    >
      <Avatar className={cn(
        "rounded-xl shadow-2xl transition-all duration-500",
        "group-hover:shadow-3xl group-hover:scale-105",
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
      
      {/* Glowing effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/30 to-secondary/30 blur-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 -z-10" />
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