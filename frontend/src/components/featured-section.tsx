'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { SongCard, Song } from './song-card';

interface FeaturedSectionProps {
  songs: Song[];
  onPlaySong: (songId: string) => void;
  onLikeSong: (songId: string, e: React.MouseEvent) => void;
  formatPlayCount: (count: number) => string;
}

export function FeaturedSection({ 
  songs, 
  onPlaySong, 
  onLikeSong, 
  formatPlayCount 
}: FeaturedSectionProps) {
  const [activeSection, setActiveSection] = useState<'featured' | 'trending' | 'new' | 'all'>('featured');
  const [currentPage, setCurrentPage] = useState(1);
  
  const ITEMS_PER_PAGE = 12;

  const getFeaturedSongs = () => {
    let filteredSongs;
    switch (activeSection) {
      case 'trending':
        filteredSongs = [...songs].sort((a, b) => b.playCount - a.playCount);
        break;
      case 'new':
        filteredSongs = [...songs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'all':
        filteredSongs = songs;
        break;
      default:
        filteredSongs = songs;
    }
    
    if (activeSection === 'all') {
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      return filteredSongs.slice(startIndex, endIndex);
    } else {
      return filteredSongs.slice(0, 6);
    }
  };

  const getTotalPages = () => {
    if (activeSection === 'all') {
      return Math.ceil(songs.length / ITEMS_PER_PAGE);
    }
    return 1;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSectionChange = (value: string) => {
    setActiveSection(value as 'featured' | 'trending' | 'new' | 'all');
    setCurrentPage(1);
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">精选推荐</h2>
        <Tabs value={activeSection} onValueChange={handleSectionChange} className="w-auto lg:flex-1 lg:max-w-md">
          <TabsList className="grid grid-cols-4 w-auto lg:w-full">
            <TabsTrigger value="featured" className="text-xs lg:text-sm">推荐</TabsTrigger>
            <TabsTrigger value="trending" className="text-xs lg:text-sm">热门</TabsTrigger>
            <TabsTrigger value="new" className="text-xs lg:text-sm">最新</TabsTrigger>
            <TabsTrigger value="all" className="text-xs lg:text-sm">所有歌曲</TabsTrigger>
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
            formatPlayCount={formatPlayCount}
          />
        ))}
      </div>

      {/* Pagination for "所有歌曲" */}
      {activeSection === 'all' && getTotalPages() > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          {Array.from({ length: getTotalPages() }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePageChange(page)}
              className="w-8 h-8"
            >
              {page}
            </Button>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === getTotalPages()}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </section>
  );
}