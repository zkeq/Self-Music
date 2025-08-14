'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  Heart, 
  MoreHorizontal, 
  Music, 
  Clock, 
  ArrowLeft, 
  Check, 
  Share2
} from 'lucide-react';
import { usePlayerStore } from '@/lib/store';
import { api } from '@/lib/api';
import type { Artist, Song, Album } from '@/types';

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
    return `${(count / 1000).toFixed(0)}K`;
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

function ArtistDetailContent() {
  const params = useParams();
  const router = useRouter();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [artistSongs, setArtistSongs] = useState<Song[]>([]);
  const [artistAlbums, setArtistAlbums] = useState<Album[]>([]);
  const [albumSongs, setAlbumSongs] = useState<Record<string, Song[]>>({});
  const [loadingAlbums, setLoadingAlbums] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const { replacePlaylistAndPlay } = usePlayerStore();

  useEffect(() => {
    const fetchArtistData = async () => {
      const id = params.id as string;
      if (!id) {
        setError('Invalid artist ID');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // 并行获取艺术家信息、歌曲和专辑
        const [artistResult, songsResult, albumsResult] = await Promise.all([
          api.getArtist(id),
          api.getArtistSongs(id),
          api.getArtistAlbums(id)
        ]);
        
        if (artistResult.success && artistResult.data) {
          setArtist(artistResult.data);
        } else {
          setError(artistResult.error || 'Failed to load artist');
          setIsLoading(false);
          return;
        }

        if (songsResult.success && songsResult.data) {
          setArtistSongs(songsResult.data);
        }

        if (albumsResult.success && albumsResult.data) {
          setArtistAlbums(albumsResult.data);
          // 自动加载所有专辑的歌曲
          albumsResult.data.forEach(album => {
            loadAlbumSongs(album.id);
          });
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching artist data:', err);
        setError('Failed to load artist');
        setArtist(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtistData();
  }, [params.id]);

  const handlePlaySong = (songIndex: number) => {
    if (artistSongs.length > 0) {
      replacePlaylistAndPlay(artistSongs, songIndex);
    }
  };

  const handlePlayPopular = () => {
    if (artistSongs.length > 0) {
      // 按播放数排序，播放最受欢迎的歌曲
      const sortedSongs = [...artistSongs].sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
      replacePlaylistAndPlay(sortedSongs, 0);
    }
  };

  const handlePlayAlbum = async (album: Album) => {
    try {
      // 获取专辑歌曲
      let songs = albumSongs[album.id];
      
      if (!songs) {
        // 如果还没有加载过这个专辑的歌曲，则获取
        const result = await api.getAlbumSongs(album.id);
        if (result.success && result.data) {
          songs = result.data;
          setAlbumSongs(prev => ({ ...prev, [album.id]: songs }));
        } else {
          console.error('Failed to load album songs:', result.error);
          return;
        }
      }
      
      if (songs && songs.length > 0) {
        replacePlaylistAndPlay(songs, 0);
      }
    } catch (error) {
      console.error('Error playing album:', error);
    }
  };

  const loadAlbumSongs = async (albumId: string) => {
    if (albumSongs[albumId] || loadingAlbums.has(albumId)) {
      return; // 已经加载过或正在加载中
    }

    setLoadingAlbums(prev => new Set(prev).add(albumId));
    
    try {
      const result = await api.getAlbumSongs(albumId);
      if (result.success && result.data) {
        setAlbumSongs(prev => ({ ...prev, [albumId]: result.data! }));
      }
    } catch (error) {
      console.error('Error loading album songs:', error);
    } finally {
      setLoadingAlbums(prev => {
        const newSet = new Set(prev);
        newSet.delete(albumId);
        return newSet;
      });
    }
  };

  const handlePlayAlbumSong = (albumId: string, songIndex: number) => {
    const songs = albumSongs[albumId];
    if (songs && songs.length > 0) {
      replacePlaylistAndPlay(songs, songIndex);
    }
  };

  const handleLikeSong = (songId: string) => {
    console.log('Toggle like for song:', songId);
  };

  const goBack = () => {
    window.history.back();
  };

  if (isLoading) {
    return (
      <div className="h-full bg-background flex items-center justify-center">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
            <h3 className="text-xl font-medium mb-2">正在加载艺术家...</h3>
            <p className="text-muted-foreground">请稍候片刻</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="h-full bg-background flex items-center justify-center">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">加载失败</h3>
            <p className="text-muted-foreground mb-6">{error || '抱歉，找不到您要查看的艺术家'}</p>
            <Button onClick={() => window.history.back()}>
              返回上一页
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="h-full bg-background lg:flex"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Sidebar />
      
      <motion.div 
        className="flex-1 flex flex-col relative"
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="absolute top-4 right-4 z-30 lg:right-6">
          <ThemeToggle />
        </div>

        <div className="absolute top-4 left-4 z-30 lg:left-6">
          <Button variant="ghost" size="sm" onClick={goBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
        </div>

        <ScrollArea className="h-full">
          <motion.div 
            className="p-6 pt-20 lg:pt-16 lg:pr-20 lg:pl-20"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Artist Header */}
            <div className="flex flex-col lg:flex-row items-start space-y-6 lg:space-y-0 lg:space-x-8 mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Avatar className="w-64 h-64 rounded-2xl shadow-2xl">
                  <AvatarImage src={artist.avatar} alt={artist.name} />
                  <AvatarFallback className="text-6xl">
                    <Music className="w-32 h-32" />
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              
              <motion.div 
                className="flex-1 space-y-4"
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-sm">艺术家</Badge>
                  {artist.verified && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <h1 className="text-3xl lg:text-5xl font-bold">{artist.name}</h1>
                
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span className="font-medium">{formatFollowers(artist.followers)} 粉丝</span>
                  <span>•</span>
                  <span>{artist.songCount} 首歌曲</span>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  {artist.genres.slice(0, 3).map((genre: string) => (
                    <Badge key={genre} variant="outline" className="text-xs">
                      {genre}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center space-x-4 pt-4">
                  <Button 
                    size="lg"
                    onClick={() => setIsFollowing(!isFollowing)}
                    variant={isFollowing ? "outline" : "default"}
                  >
                    {isFollowing ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        已关注
                      </>
                    ) : (
                      '关注艺术家'
                    )}
                  </Button>
                  <Button variant="outline" onClick={handlePlayPopular}>
                    <Play className="w-4 h-4 mr-2" />
                    播放热门
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Music className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            </div>

            {/* Popular Songs */}
            {artistSongs.length > 0 && (
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mb-12"
              >
                <h2 className="text-2xl font-bold mb-6">热门歌曲</h2>
                <div className="bg-card rounded-lg p-6 shadow-sm">
                  <div className="flex items-center px-4 py-3 text-sm text-muted-foreground border-b">
                    <div className="w-8">#</div>
                    <div className="flex-1">标题</div>
                    <div className="w-20 text-center hidden sm:block">播放量</div>
                    <div className="w-20 text-center">
                      <Clock className="w-4 h-4 mx-auto" />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    {artistSongs.slice(0, 10).map((song: Song, index: number) => (
                      <motion.div
                        key={song.id}
                        className="flex items-center px-4 py-3 hover:bg-muted/50 rounded-md cursor-pointer group transition-colors"
                        onClick={() => handlePlaySong(index)}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                        whileHover={{ x: 4 }}
                      >
                        <div className="w-8 text-sm text-muted-foreground">
                          <span className="group-hover:hidden">{index + 1}</span>
                          <Play className="w-4 h-4 hidden group-hover:block text-primary" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="font-medium">{song.title}</div>
                          <div className="text-sm text-muted-foreground">{song.album?.title || '单曲'}</div>
                        </div>
                        
                        <div className="w-20 text-center text-sm text-muted-foreground hidden sm:block">
                          {song.playCount && formatPlayCount(song.playCount)}
                        </div>
                        
                        <div className="flex items-center space-x-2 w-20">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLikeSong(song.id);
                            }}
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Heart className={`w-3 h-3 ${song.liked ? 'text-red-500 fill-current' : ''}`} />
                          </Button>
                          <span className="text-sm text-muted-foreground text-center w-12">
                            {formatDuration(song.duration)}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Albums */}
            {artistAlbums.length > 0 && (
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <h2 className="text-2xl font-bold mb-6">专辑</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {artistAlbums.map((album: Album, albumIndex: number) => {
                    const songs = albumSongs[album.id] || [];
                    const isLoading = loadingAlbums.has(album.id);
                    
                    return (
                      <motion.div
                        key={album.id}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.1 * albumIndex }}
                        className="bg-card rounded-lg p-6 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{album.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {album.releaseDate && new Date(album.releaseDate).getFullYear()} • {songs.length || album.songCount || 0} 首歌曲
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        {album.coverUrl && (
                          <Avatar className="w-full h-32 rounded-lg mb-4">
                            <AvatarImage src={album.coverUrl} alt={album.title} />
                            <AvatarFallback>
                              <Music className="w-8 h-8" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        {/* 专辑歌曲列表 */}
                        {isLoading ? (
                          <div className="flex items-center justify-center py-4 mb-4">
                            <div className="w-5 h-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent mr-2" />
                            <span className="text-sm text-muted-foreground">加载歌曲中...</span>
                          </div>
                        ) : songs.length > 0 ? (
                          <div className="mb-4">
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                              {songs.map((song: Song, songIndex: number) => (
                                <motion.div
                                  key={song.id}
                                  className="flex items-center px-2 py-1 hover:bg-muted/50 rounded-md cursor-pointer group transition-colors text-sm"
                                  onClick={() => handlePlayAlbumSong(album.id, songIndex)}
                                  initial={{ x: -10, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ duration: 0.2, delay: 0.03 * songIndex }}
                                >
                                  <div className="w-6 text-xs text-muted-foreground">
                                    <span className="group-hover:hidden">{songIndex + 1}</span>
                                    <Play className="w-3 h-3 hidden group-hover:block text-primary" />
                                  </div>
                                  
                                  <div className="flex-1 ml-2 min-w-0">
                                    <div className="font-medium text-xs truncate">{song.title}</div>
                                  </div>
                                  
                                  <span className="text-xs text-muted-foreground">
                                    {formatDuration(song.duration)}
                                  </span>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-muted-foreground text-sm mb-4 py-2">
                            暂无歌曲
                          </div>
                        )}
                        
                        <Button 
                          variant="ghost" 
                          className="w-full"
                          onClick={() => handlePlayAlbum(album)}
                          disabled={songs.length === 0}
                        >
                          播放专辑
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </motion.div>
        </ScrollArea>
      </motion.div>
    </motion.div>
  );
}

export default function ArtistDetailPage() {
  return (
    <Suspense fallback={
      <div className="h-full bg-background flex items-center justify-center">
        <div>Loading...</div>
      </div>
    }>
      <ArtistDetailContent />
    </Suspense>
  );
}