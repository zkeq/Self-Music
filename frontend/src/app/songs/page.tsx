'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search, Shuffle, PlayCircle, ChevronRight } from 'lucide-react';
import { FeaturedSection } from '@/components/featured-section';
import { PlaylistCard } from '@/components/playlist-card';
import { ArtistCard } from '@/components/artist-card';
import { SearchResults } from '@/components/search-results';
import { 
  useSongsStore, 
  usePlaylistsStore, 
  useArtistsStore, 
  useSearchStore 
} from '@/lib/data-stores';
import { usePlayerStore } from '@/lib/store';
import type { Song } from '@/types';

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const formatPlayCount = (count: number) => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

const formatFollowers = (count: number) => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(0)}K`;
  }
  return count.toString();
};

export default function SongsPage() {
  const router = useRouter();
  
  // Store hooks
  const { 
    songs, 
    trending, 
    hot, 
    fetchSongs, 
    fetchTrendingSongs, 
    fetchHotSongs,
    isLoading: songsLoading 
  } = useSongsStore();
  
  const { 
    playlists, 
    fetchPlaylists,
    isLoading: playlistsLoading 
  } = usePlaylistsStore();
  
  const { 
    artists, 
    fetchArtists,
    isLoading: artistsLoading 
  } = useArtistsStore();
  
  const { 
    query, 
    results, 
    search, 
    clearSearch,
    isLoading: searchLoading 
  } = useSearchStore();
  
  const { setSong, play } = usePlayerStore();

  // Load initial data
  useEffect(() => {
    fetchSongs(1, 12);
    fetchPlaylists(1, 8);
    fetchArtists(1, 8);
    fetchTrendingSongs(20);
    fetchHotSongs(20);
  }, [fetchSongs, fetchPlaylists, fetchArtists, fetchTrendingSongs, fetchHotSongs]);

  const handlePlaySong = (song: Song) => {
    setSong(song);
    setTimeout(() => play(), 100);
  };

  const handleLikeSong = (songId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Toggle like for song:', songId);
  };

  const handlePlayPlaylist = (playlistId: string) => {
    router.push(`/playlist/${playlistId}`);
  };

  const handleViewArtist = (artistId: string) => {
    router.push(`/artist/${artistId}`);
  };

  const handleSearch = (value: string) => {
    if (value.trim()) {
      search(value);
    } else {
      clearSearch();
    }
  };

  const displaySongs = hot.length > 0 ? hot : songs;

  return (
    <motion.div 
      className="h-full bg-background lg:flex"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Sidebar />
      
      <motion.div 
        className="flex-1 flex flex-col relative overflow-hidden"
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="absolute top-4 right-4 z-30 lg:right-6">
          <ThemeToggle />
        </div>

        <motion.div 
          className="flex-shrink-0 p-4 pt-16 lg:p-6 lg:pt-6 lg:pr-20"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">发现音乐</h1>
              <p className="text-muted-foreground">探索您喜爱的音乐、艺术家和歌单</p>
            </div>
            <div className="flex flex-col space-y-2 lg:flex-row lg:space-y-0 lg:space-x-2">
              <Button className="w-full lg:w-auto">
                <Shuffle className="w-4 h-4 mr-2" />
                随机播放
              </Button>
              <Button variant="outline" className="w-full lg:w-auto">
                <PlayCircle className="w-4 h-4 mr-2" />
                播放全部
              </Button>
            </div>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索歌曲、艺术家或歌单..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </motion.div>

        <motion.div 
          className="flex-1 min-h-0"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <ScrollArea className="h-full">
            <div className="p-4 pt-0 lg:p-6">
              {query ? (
                <SearchResults 
                  songs={results.songs}
                  onPlaySong={handlePlaySong}
                  onLikeSong={handleLikeSong}
                  formatPlayCount={formatPlayCount}
                  formatDuration={formatDuration}
                />
              ) : (
                <motion.div 
                  className="space-y-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  {/* Featured Songs */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.55 }}
                  >
                    <FeaturedSection 
                      songs={displaySongs}
                      onPlaySong={handlePlaySong}
                      onLikeSong={handleLikeSong}
                      onAddToPlaylist={() => {}}
                      formatPlayCount={formatPlayCount}
                    />
                  </motion.div>

                  {/* Hot Playlists */}
                  <motion.section
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold">热门歌单</h2>
                      <Button variant="ghost" size="sm" onClick={() => router.push('/playlists')}>
                        查看全部
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                    
                    {playlistsLoading ? (
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="bg-card rounded-lg p-4 animate-pulse">
                            <div className="aspect-square bg-muted rounded-lg mb-3" />
                            <div className="h-4 bg-muted rounded mb-2" />
                            <div className="h-3 bg-muted rounded w-3/4" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {playlists.slice(0, 4).map((playlist) => (
                          <PlaylistCard
                            key={playlist.id}
                            playlist={playlist}
                            onPlay={handlePlayPlaylist}
                            formatPlayCount={formatPlayCount}
                          />
                        ))}
                      </div>
                    )}
                  </motion.section>

                  {/* Popular Artists */}
                  <motion.section
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold">热门艺术家</h2>
                      <Button variant="ghost" size="sm" onClick={() => router.push('/artists')}>
                        查看全部
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                    
                    {artistsLoading ? (
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="bg-card rounded-lg p-4 animate-pulse">
                            <div className="aspect-square bg-muted rounded-full mb-3 mx-auto w-20 h-20" />
                            <div className="h-4 bg-muted rounded mb-2" />
                            <div className="h-3 bg-muted rounded w-3/4 mx-auto" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {artists.slice(0, 4).map((artist) => (
                          <ArtistCard
                            key={artist.id}
                            artist={artist}
                            onView={handleViewArtist}
                            formatFollowers={formatFollowers}
                          />
                        ))}
                      </div>
                    )}
                  </motion.section>
                </motion.div>
              )}
            </div>
          </ScrollArea>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}