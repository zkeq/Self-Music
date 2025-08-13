'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search, Plus, PlayCircle } from 'lucide-react';
import { PlaylistCard } from '@/components/playlist-card';
import { usePlaylistsStore, useSearchStore } from '@/lib/data-stores';

const formatPlayCount = (count: number) => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

export default function PlaylistsPage() {
  const { 
    playlists, 
    fetchPlaylists,
    createPlaylist,
    isLoading 
  } = usePlaylistsStore();
  
  const { 
    query, 
    results, 
    search, 
    clearSearch 
  } = useSearchStore();

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  const handlePlayPlaylist = (playlistId: string) => {
    window.location.href = `/playlist/${playlistId}`;
  };

  const handleCreatePlaylist = async () => {
    await createPlaylist({
      name: '新建歌单',
      description: '我的新歌单',
      isPublic: false,
    });
  };

  const handleSearch = (value: string) => {
    if (value.trim()) {
      search(value);
    } else {
      clearSearch();
    }
  };

  const displayPlaylists = query ? results.playlists : playlists;

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
              <h1 className="text-2xl lg:text-3xl font-bold">热门歌单</h1>
              <p className="text-muted-foreground">发现精心策划的音乐合集</p>
            </div>
            <div className="flex flex-col space-y-2 lg:flex-row lg:space-y-0 lg:space-x-2">
              <Button onClick={handleCreatePlaylist} className="w-full lg:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                创建歌单
              </Button>
              <Button variant="outline" className="w-full lg:w-auto">
                <PlayCircle className="w-4 h-4 mr-2" />
                随机播放
              </Button>
            </div>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索歌单..."
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
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="bg-card rounded-lg p-4 animate-pulse">
                      <div className="aspect-square bg-muted rounded-lg mb-3" />
                      <div className="h-4 bg-muted rounded mb-2" />
                      <div className="h-3 bg-muted rounded w-3/4" />
                    </div>
                  ))}
                </div>
              ) : (
                <motion.div 
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  {displayPlaylists.map((playlist, index) => (
                    <motion.div
                      key={playlist.id}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                    >
                      <PlaylistCard
                        playlist={playlist}
                        onPlay={handlePlayPlaylist}
                        formatPlayCount={formatPlayCount}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {!isLoading && displayPlaylists.length === 0 && (
                <motion.div 
                  className="flex flex-col items-center justify-center h-64 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <PlayCircle className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">没有找到歌单</h3>
                  <p className="text-muted-foreground">
                    {query ? '尝试使用不同的关键词搜索' : '暂无歌单数据'}
                  </p>
                </motion.div>
              )}
            </div>
          </ScrollArea>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}