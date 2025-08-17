'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search, Shuffle, PlayCircle, ChevronRight, ChevronLeft, ArrowUpDown, Share2, Check } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(24);
  const [sortBy, setSortBy] = useState('created_desc');
  
  // Store hooks
  const { 
    songs, 
    trending, 
    hot, 
    new: newSongs,
    featured,  // 新增featured数据
    fetchSongs, 
    fetchTrendingSongs, 
    fetchHotSongs,
    fetchNewSongs,
    fetchFeaturedSongs,  // 新增fetchFeaturedSongs
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
  
  const { setSong, play, replacePlaylistAndPlay, currentSong } = usePlayerStore();
  const [copiedSongId, setCopiedSongId] = useState<string | null>(null);

  // Load songs data when page, pageSize or sortBy changes
  useEffect(() => {
    fetchSongs(currentPage, pageSize, sortBy);
  }, [currentPage, pageSize, sortBy, fetchSongs]);

  // Load static data only on component mount
  useEffect(() => {
    fetchPlaylists(1, 8);
    fetchArtists(1, 8);
    fetchTrendingSongs(20);
    fetchHotSongs(20);
    fetchNewSongs(20);
    fetchFeaturedSongs(20);
  }, [fetchPlaylists, fetchArtists, fetchTrendingSongs, fetchHotSongs, fetchNewSongs, fetchFeaturedSongs]);

  const handlePlaySong = (song: Song, sourceList?: Song[]) => {
    // 使用提供的列表或根据当前上下文选择合适的歌曲列表
    let currentSongList: Song[] = [];
    
    if (sourceList) {
      // 如果明确提供了来源列表，使用它
      currentSongList = sourceList;
    } else if (query && results.songs.length > 0) {
      // 如果在搜索状态，使用搜索结果
      currentSongList = results.songs;
    } else {
      // 否则使用当前页面的歌曲列表
      currentSongList = songs;
    }
    
    // 找到歌曲在列表中的索引
    const songIndex = currentSongList.findIndex(s => s.id === song.id);
    
    if (songIndex !== -1 && currentSongList.length > 0) {
      // 替换播放列表并开始播放
      replacePlaylistAndPlay(currentSongList, songIndex);
    } else {
      // 如果找不到歌曲或列表为空，则单独播放这首歌
      setSong(song);
      setTimeout(() => play(), 100);
    }
  };

  const handleLikeSong = (songId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Toggle like for song:', songId);
  };

  const handleShareSong = async (song: Song, e: React.MouseEvent) => {
    e.stopPropagation();
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/play?music=${encodeURIComponent(song.id)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedSongId(song.id);
      setTimeout(() => setCopiedSongId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
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

  const displaySongs = songs; // 直接使用分页的歌曲数据
  const { pagination } = useSongsStore();
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    setCurrentPage(1); // Reset to first page when sorting changes
  };
  
  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;
    
    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <div className="flex items-center space-x-1">
          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
            const page = Math.max(1, Math.min(pagination.totalPages - 4, currentPage - 2)) + i;
            if (page > pagination.totalPages) return null;
            
            return (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            );
          })}
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= pagination.totalPages}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        
        <span className="text-sm text-muted-foreground ml-4">
          第 {pagination.page} 页，共 {pagination.totalPages} 页
        </span>
      </div>
    );
  };

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
            <div className="p-4 pt-0 lg:p-6 pb-24 lg:pb-28">
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
                      featuredSongs={featured}
                      hotSongs={hot}
                      newSongs={newSongs}
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
                        {(artists || []).slice(0, 4).map((artist) => (
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
                  
                  {/* Songs List with Pagination */}
                  <motion.section
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold">所有歌曲</h2>
                      <div className="flex items-center space-x-2">
                        <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                        <Select value={sortBy} onValueChange={handleSortChange}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="created_desc">最新添加</SelectItem>
                            <SelectItem value="created_asc">最早添加</SelectItem>
                            <SelectItem value="title_asc">标题 A-Z</SelectItem>
                            <SelectItem value="title_desc">标题 Z-A</SelectItem>
                            <SelectItem value="play_count_desc">播放量高</SelectItem>
                            <SelectItem value="play_count_asc">播放量低</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {songsLoading ? (
                      <div className="space-y-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="bg-card rounded-lg p-4 animate-pulse">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-muted rounded" />
                              <div className="flex-1">
                                <div className="h-4 bg-muted rounded mb-2" />
                                <div className="h-3 bg-muted rounded w-1/2" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={`grid gap-6 lg:grid-cols-2 ${currentSong ? 'pb-24 lg:pb-28' : 'pb-6'}`}>
                        {/* 第一个表格 - 前12首歌曲 */}
                        <div className="bg-card rounded-lg shadow-sm">
                          <div className="flex items-center px-4 py-3 text-sm text-muted-foreground border-b">
                            <div className="w-8">#</div>
                            <div className="flex-1">标题</div>
                            <div className="w-20 text-right hidden lg:block">播放次数</div>
                            <div className="w-20 text-right">时长</div>
                          </div>
                          
                          {songs.slice(0, 12).map((song, index) => (
                            <div 
                              key={song.id}
                              className="flex items-center px-4 py-3 hover:bg-muted/50 cursor-pointer group transition-colors"
                              onClick={() => handlePlaySong(song)}
                            >
                              <div className="w-8 text-sm text-muted-foreground">
                                <span className="group-hover:hidden">{(currentPage - 1) * pageSize + index + 1}</span>
                                <PlayCircle className="w-4 h-4 hidden group-hover:block text-primary" />
                              </div>
                              
                              <div className="flex items-center flex-1 min-w-0">
                                <img 
                                  src={song.coverUrl || '/placeholder-cover.jpg'} 
                                  alt={song.title}
                                  className="w-10 h-10 rounded mr-3 object-cover"
                                />
                                <div className="min-w-0">
                                  <div className="font-medium truncate">{song.title}</div>
                                  <div className="text-sm text-muted-foreground truncate">{song.artist?.name}</div>
                                </div>
                              </div>
                              
                              <div className="w-20 text-right text-sm text-muted-foreground hidden lg:block">
                                {formatPlayCount(song.playCount)}
                              </div>
                              
                              <div className="w-24 flex items-center justify-end text-sm text-muted-foreground space-x-2">
                                <button
                                  onClick={(e) => handleShareSong(song, e)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="分享歌曲"
                                  aria-label="分享歌曲"
                                >
                                  {copiedSongId === song.id ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <Share2 className="w-4 h-4" />
                                  )}
                                </button>
                                <span className="w-12 text-right">{formatDuration(song.duration)}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* 第二个表格 - 后12首歌曲 (仅在电脑端显示且有足够歌曲时) */}
                        {songs.length > 12 && (
                          <div className="bg-card rounded-lg shadow-sm hidden lg:block">
                            <div className="flex items-center px-4 py-3 text-sm text-muted-foreground border-b">
                              <div className="w-8">#</div>
                              <div className="flex-1">标题</div>
                              <div className="w-20 text-right">播放次数</div>
                              <div className="w-20 text-right">时长</div>
                            </div>
                            
                            {songs.slice(12, 24).map((song, index) => (
                              <div 
                                key={song.id}
                                className="flex items-center px-4 py-3 hover:bg-muted/50 cursor-pointer group transition-colors"
                                onClick={() => handlePlaySong(song)}
                              >
                                <div className="w-8 text-sm text-muted-foreground">
                                  <span className="group-hover:hidden">{(currentPage - 1) * pageSize + index + 13}</span>
                                  <PlayCircle className="w-4 h-4 hidden group-hover:block text-primary" />
                                </div>
                                
                                <div className="flex items-center flex-1 min-w-0">
                                  <img 
                                    src={song.coverUrl || '/placeholder-cover.jpg'} 
                                    alt={song.title}
                                    className="w-10 h-10 rounded mr-3 object-cover"
                                  />
                                  <div className="min-w-0">
                                    <div className="font-medium truncate">{song.title}</div>
                                    <div className="text-sm text-muted-foreground truncate">{song.artist?.name}</div>
                                  </div>
                                </div>
                                
                                <div className="w-20 text-right text-sm text-muted-foreground">
                                  {formatPlayCount(song.playCount)}
                                </div>
                                
                                <div className="w-24 flex items-center justify-end text-sm text-muted-foreground space-x-2">
                                  <button
                                    onClick={(e) => handleShareSong(song, e)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="分享歌曲"
                                    aria-label="分享歌曲"
                                  >
                                    {copiedSongId === song.id ? (
                                      <Check className="w-4 h-4 text-green-500" />
                                    ) : (
                                      <Share2 className="w-4 h-4" />
                                    )}
                                  </button>
                                  <span className="w-12 text-right">{formatDuration(song.duration)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {renderPagination()}
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
