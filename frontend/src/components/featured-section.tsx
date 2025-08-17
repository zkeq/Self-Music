'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SongCard } from './song-card';
import type { Song } from '@/types';

interface FeaturedSectionProps {
  featuredSongs: Song[];  // 推荐歌曲（随机）
  hotSongs: Song[];       // 热门歌曲（按播放量排序）
  newSongs: Song[];       // 最新歌曲（按时间排序）
  onPlaySong: (song: Song, sourceList?: Song[]) => void;
  onLikeSong: (songId: string, e: React.MouseEvent) => void;
  onAddToPlaylist: (song: Song, e: React.MouseEvent) => void;
  formatPlayCount: (count: number) => string;
}

export function FeaturedSection({ 
  featuredSongs,
  hotSongs,
  newSongs,
  onPlaySong, 
  onLikeSong, 
  onAddToPlaylist,
  formatPlayCount 
}: FeaturedSectionProps) {
  const [activeSection, setActiveSection] = useState<'featured' | 'trending' | 'new'>('featured');

  const getCurrentSongs = () => {
    switch (activeSection) {
      case 'trending':
        return hotSongs.slice(0, 6);
      case 'new':
        return newSongs.slice(0, 6);
      default:
        return featuredSongs.slice(0, 6);
    }
  };

  const getCurrentSourceList = () => {
    switch (activeSection) {
      case 'trending':
        return hotSongs;
      case 'new':
        return newSongs;
      default:
        return featuredSongs;
    }
  };

  const handleSectionChange = (value: string) => {
    setActiveSection(value as 'featured' | 'trending' | 'new');
  };

  const handlePlaySong = (song: Song) => {
    onPlaySong(song, getCurrentSourceList());
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">精选推荐</h2>
        <Tabs value={activeSection} onValueChange={handleSectionChange} className="w-auto lg:flex-1 lg:max-w-md">
          <TabsList className="grid grid-cols-3 w-auto lg:w-full">
            <TabsTrigger value="featured" className="text-xs lg:text-sm">推荐</TabsTrigger>
            <TabsTrigger value="trending" className="text-xs lg:text-sm">热门</TabsTrigger>
            <TabsTrigger value="new" className="text-xs lg:text-sm">最新</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {getCurrentSongs().map((song) => (
          <SongCard 
            key={song.id}
            song={song}
            onPlay={handlePlaySong}
            onLike={onLikeSong}
            onAddToPlaylist={onAddToPlaylist}
            formatPlayCount={formatPlayCount}
          />
        ))}
      </div>
    </section>
  );
}