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
import { Play, Heart, MoreHorizontal, Music, Clock, Shuffle, ArrowLeft, TrendingUp } from 'lucide-react';
import { usePlayerStore } from '@/lib/store';
import { api } from '@/lib/api';
import type { Song, Playlist } from '@/types';

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours} 小时 ${minutes} 分钟`;
  }
  return `${minutes} 分钟`;
};

const formatSongDuration = (seconds: number) => {
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

function PlaylistDetailContent() {
  const params = useParams();
  const router = useRouter();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const { replacePlaylistAndPlay } = usePlayerStore();

  useEffect(() => {
    const fetchPlaylist = async () => {
      const id = params.id as string;
      if (!id) {
        setError('Invalid playlist ID');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const result = await api.getPlaylist(id);
        
        if (result.success && result.data) {
          setPlaylist(result.data);
          setError(null);
        } else {
          setError(result.error || 'Failed to load playlist');
          setPlaylist(null);
        }
      } catch (err) {
        console.error('Error fetching playlist:', err);
        setError('Failed to load playlist');
        setPlaylist(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylist();
  }, [params.id]);

  const handlePlaySong = (songIndex: number) => {
    if (playlist && playlist.songs) {
      replacePlaylistAndPlay(playlist.songs, songIndex);
    }
  };

  const handlePlayAll = () => {
    if (playlist && playlist.songs && playlist.songs.length > 0) {
      replacePlaylistAndPlay(playlist.songs, 0);
    }
  };

  const handleShuffle = () => {
    if (playlist && playlist.songs && playlist.songs.length > 0) {
      const randomIndex = Math.floor(Math.random() * playlist.songs.length);
      replacePlaylistAndPlay(playlist.songs, randomIndex);
    }
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
            <h3 className="text-xl font-medium mb-2">正在加载歌单...</h3>
            <p className="text-muted-foreground">请稍候片刻</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error || !playlist) {
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
            <p className="text-muted-foreground mb-6">{error || '抱歉，找不到您要查看的歌单'}</p>
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
            {/* Playlist Header */}
            <div className="flex flex-col lg:flex-row items-start space-y-6 lg:space-y-0 lg:space-x-8 mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Avatar className="w-64 h-64 rounded-2xl shadow-2xl">
                  <AvatarImage src={playlist.coverUrl} alt={playlist.name} />
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
                <Badge variant="secondary" className="text-sm">播放列表</Badge>
                <h1 className="text-3xl lg:text-5xl font-bold">{playlist.name}</h1>
                {playlist.description && (
                  <p className="text-muted-foreground text-lg max-w-2xl">{playlist.description}</p>
                )}
                
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span className="font-medium">{playlist.creator}</span>
                  <span>•</span>
                  <span>{playlist.songCount} 首歌曲</span>
                  <span>•</span>
                  <span>{formatDuration(playlist.duration)}</span>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>{formatPlayCount(playlist.playCount)} 播放</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 pt-4">
                  <Button size="lg" onClick={handlePlayAll}>
                    <Play className="w-5 h-5 mr-2" />
                    播放
                  </Button>
                  <Button variant="outline" size="lg" onClick={handleShuffle}>
                    <Shuffle className="w-5 h-5 mr-2" />
                    随机播放
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="lg"
                    onClick={() => setIsLiked(!isLiked)}
                  >
                    <Heart className={`w-5 h-5 mr-2 ${isLiked ? 'text-red-500 fill-current' : ''}`} />
                    {isLiked ? '已喜欢' : '喜欢'}
                  </Button>
                  <Button variant="ghost" size="lg">
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                </div>
              </motion.div>
            </div>

            {/* Songs List */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div>
                <div className="flex items-center px-4 py-2 text-sm text-muted-foreground border-b border-border">
                  <div className="w-8">#</div>
                  <div className="flex-1">标题</div>
                  <div className="w-20 text-right">
                    <Clock className="w-4 h-4 ml-auto" />
                  </div>
                </div>
                <div>
                  {playlist.songs.map((song, index) => (
                    <div 
                      key={song.id}
                      className="flex items-center px-4 py-3 hover:bg-muted/50 rounded-md cursor-pointer group"
                      onClick={() => handlePlaySong(index)}
                    >
                      <div className="w-8 text-sm text-muted-foreground">
                        <span className="group-hover:hidden">{index + 1}</span>
                        <Play className="w-4 h-4 hidden group-hover:block" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{song.title}</div>
                        <div className="text-sm text-muted-foreground">{song.artist.name}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {song.liked && (
                          <Heart className="w-4 h-4 text-red-500 fill-current" />
                        )}
                        <span className="w-20 text-right text-sm text-muted-foreground">
                          {formatSongDuration(song.duration)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </ScrollArea>
      </motion.div>
    </motion.div>
  );
}

export default function PlaylistDetailPage() {
  return (
    <Suspense fallback={
      <div className="h-full bg-background flex items-center justify-center">
        <div>Loading...</div>
      </div>
    }>
      <PlaylistDetailContent />
    </Suspense>
  );
}