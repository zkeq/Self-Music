'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SongCard } from './song-card';
import type { Song } from '@/types';

interface FeaturedSectionProps {
  songs: Song[];
  onPlaySong: (song: Song) => void;
  onLikeSong: (songId: string, e: React.MouseEvent) => void;
  onAddToPlaylist: (song: Song, e: React.MouseEvent) => void;
  formatPlayCount: (count: number) => string;
}

export function FeaturedSection({ 
  songs, 
  onPlaySong, 
  onLikeSong, 
  onAddToPlaylist,
  formatPlayCount 
}: FeaturedSectionProps) {
  const [activeSection, setActiveSection] = useState<'featured' | 'trending' | 'new'>('featured');

  const getFeaturedSongs = () => {
    let filteredSongs;
    switch (activeSection) {
      case 'trending':
        filteredSongs = [...songs].sort((a, b) => b.playCount - a.playCount);
        break;
      case 'new':
        filteredSongs = [...songs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      default:
        filteredSongs = songs;
    }
    
    return filteredSongs.slice(0, 6);
  };

  const handleSectionChange = (value: string) => {
    setActiveSection(value as 'featured' | 'trending' | 'new');
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
        {getFeaturedSongs().map((song) => (
          <SongCard 
            key={song.id}
            song={song}
            onPlay={onPlaySong}
            onLike={onLikeSong}
            onAddToPlaylist={onAddToPlaylist}
            formatPlayCount={formatPlayCount}
          />
        ))}
      </div>
    </section>
  );
}