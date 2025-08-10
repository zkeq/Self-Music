'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Heart, MoreHorizontal, Music, Clock, Shuffle, ArrowLeft, TrendingUp } from 'lucide-react';

interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  liked: boolean;
  playCount?: number;
}

interface PlaylistDetail {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  songCount: number;
  duration: number;
  playCount: number;
  creator: string;
  songs: Song[];
}

// Mock data for playlist details
const mockPlaylistDetails: { [key: string]: PlaylistDetail } = {
  '1': {
    id: '1',
    name: '流行热歌榜',
    description: '最新最热的流行音乐，汇集全球最受欢迎的流行歌曲',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    songCount: 25,
    duration: 5400,
    playCount: 125000,
    creator: 'Self Music',
    songs: [
      { id: '1', title: '晴天', artist: '周杰伦', album: '叶惠美', duration: 269, liked: true, playCount: 89000 },
      { id: '2', title: 'Shape of You', artist: 'Ed Sheeran', album: '÷ (Divide)', duration: 233, liked: false, playCount: 156000 },
      { id: '3', title: '告白气球', artist: '周杰伦', album: '周杰伦的床边故事', duration: 201, liked: true, playCount: 234000 },
      { id: '4', title: 'Perfect', artist: 'Ed Sheeran', album: '÷ (Divide)', duration: 263, liked: false, playCount: 178000 },
      { id: '5', title: '夜曲', artist: '周杰伦', album: '十一月的萧邦', duration: 234, liked: true, playCount: 145000 },
      { id: '6', title: 'Thinking Out Loud', artist: 'Ed Sheeran', album: 'x', duration: 281, liked: true, playCount: 198000 }
    ]
  },
  '2': {
    id: '2',
    name: '轻松咖啡时光',
    description: '适合咖啡时光的轻松音乐，营造温馨舒适的氛围',
    coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
    songCount: 18,
    duration: 3240,
    playCount: 87000,
    creator: 'Self Music',
    songs: [
      { id: '7', title: 'River Flows in You', artist: 'Yiruma', album: 'First Love', duration: 210, liked: true, playCount: 67000 },
      { id: '8', title: 'Kiss The Rain', artist: 'Yiruma', album: 'Love Scene', duration: 195, liked: false, playCount: 45000 },
      { id: '9', title: 'Nuvole Bianche', artist: 'Ludovico Einaudi', album: 'Una Mattina', duration: 360, liked: true, playCount: 78000 }
    ]
  }
};

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
  const [playlist, setPlaylist] = useState<PlaylistDetail | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const id = params.id as string;
    if (id && mockPlaylistDetails[id]) {
      setPlaylist(mockPlaylistDetails[id]);
    }
  }, [params.id]);

  const handlePlaySong = (songId: string) => {
    window.location.href = `/play/${songId}`;
  };

  const handleLikeSong = (songId: string) => {
    console.log('Toggle like for song:', songId);
  };

  const handlePlayAll = () => {
    if (playlist && playlist.songs.length > 0) {
      handlePlaySong(playlist.songs[0].id);
    }
  };

  const handleShuffle = () => {
    if (playlist && playlist.songs.length > 0) {
      const randomIndex = Math.floor(Math.random() * playlist.songs.length);
      handlePlaySong(playlist.songs[randomIndex].id);
    }
  };

  const goBack = () => {
    window.history.back();
  };

  if (!playlist) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
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

  return (
    <motion.div 
      className="min-h-screen bg-background lg:flex"
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

        <ScrollArea className="h-screen">
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
                <p className="text-muted-foreground text-lg max-w-2xl">{playlist.description}</p>
                
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
                      onClick={() => handlePlaySong(song.id)}
                    >
                      <div className="w-8 text-sm text-muted-foreground">
                        <span className="group-hover:hidden">{index + 1}</span>
                        <Play className="w-4 h-4 hidden group-hover:block" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{song.title}</div>
                        <div className="text-sm text-muted-foreground">{song.artist}</div>
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div>Loading...</div>
      </div>
    }>
      <PlaylistDetailContent />
    </Suspense>
  );
}