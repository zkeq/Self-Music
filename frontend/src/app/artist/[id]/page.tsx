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
import { 
  Play, 
  Heart, 
  MoreHorizontal, 
  Music, 
  Clock, 
  Shuffle, 
  ArrowLeft, 
  Check, 
  Share2,
  Bookmark
} from 'lucide-react';

interface Song {
  id: string;
  title: string;
  album: string;
  duration: number;
  playCount?: number;
  liked: boolean;
}

interface ArtistAlbum {
  name: string;
  year: number;
  songs: Song[];
}

interface ArtistDetail {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  followers: number;
  popularSongs: Song[];
  albums: ArtistAlbum[];
  genres: string[];
  verified: boolean;
}

// Mock data for artist details
const mockArtistDetails: { [key: string]: ArtistDetail } = {
  '1': {
    id: '1',
    name: '周杰伦',
    avatar: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    bio: '华语乐坛创作天王，以独特的音乐风格革新了华语流行音乐。融合中西方音乐元素，创造了一个全新时代。',
    followers: 2800000,
    popularSongs: [
      { id: '1', title: '晴天', album: '叶惠美', duration: 269, playCount: 89000000, liked: true },
      { id: '2', title: '告白气球', album: '周杰伦的床边故事', duration: 201, playCount: 234000000, liked: false },
      { id: '3', title: '夜曲', album: '十一月的萧邦', duration: 234, playCount: 145000000, liked: true },
      { id: '4', title: '稻香', album: '魔杰座', duration: 225, playCount: 189000000, liked: true },
      { id: '5', title: '安静', album: '范特西', duration: 275, playCount: 156000000, liked: false }
    ],
    albums: [
      {
        name: '叶惠美',
        year: 2003,
        songs: [
          { id: '1', title: '晴天', album: '叶惠美', duration: 269, liked: true },
          { id: '6', title: '以父之名', album: '叶惠美', duration: 325, liked: false },
          { id: '7', title: '三年二班', album: '叶惠美', duration: 284, liked: true }
        ]
      },
      {
        name: '范特西',
        year: 2001,
        songs: [
          { id: '5', title: '安静', album: '范特西', duration: 275, liked: false },
          { id: '8', title: '简单爱', album: '范特西', duration: 256, liked: true },
          { id: '9', title: '开不了口', album: '范特西', duration: 298, liked: true }
        ]
      },
      {
        name: '八度空间',
        year: 2002,
        songs: [
          { id: '10', title: '半兽人', album: '八度空间', duration: 289, liked: false },
          { id: '11', title: '半岛铁盒', album: '八度空间', duration: 301, liked: true },
          { id: '12', title: '回到过去', album: '八度空间', duration: 246, liked: true }
        ]
      }
    ],
    genres: ['华语流行', 'R&B', '嘻哈', '古典流行'],
    verified: true
  }
};

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
  const [artist, setArtist] = useState<any | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const id = params.id as string;
    if (id && mockArtistDetails[id]) {
      setArtist(mockArtistDetails[id]);
    }
  }, [params.id]);

  const handlePlaySong = (songId: string) => {
    window.location.href = `/play/${songId}`;
  };

  const handleLikeSong = (songId: string) => {
    console.log('Toggle like for song:', songId);
  };

  const handleShuffle = () => {
    if (artist && artist.popularSongs.length > 0) {
      const randomIndex = Math.floor(Math.random() * artist.popularSongs.length);
      handlePlaySong(artist.popularSongs[randomIndex].id);
    }
  };

  const goBack = () => {
    window.history.back();
  };

  if (!artist) {
    return <div>艺术家未找到</div>;
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
                <p className="text-muted-foreground text-lg max-w-2xl">{artist.bio}</p>
                
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span className="font-medium">{formatFollowers(artist.followers)} 粉丝</span>
                  <span>•</span>
                  <span>{artist.popularSongs.length + (artist.albums?.flatMap(a => a.songs).length || 0)} 首歌曲</span>
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
                  <Button variant="outline" onClick={() => handlePlaySong(artist.popularSongs[0]?.id)}>
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
                  {artist.popularSongs.map((song: any, index: number) => (
                    <motion.div
                      key={song.id}
                      className="flex items-center px-4 py-3 hover:bg-muted/50 rounded-md cursor-pointer group transition-colors"
                      onClick={() => handlePlaySong(song.id)}
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
                        <div className="text-sm text-muted-foreground">{song.album}</div>
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

            {/* Albums */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <h2 className="text-2xl font-bold mb-6">专辑</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(artist.albums || []).map((album: any, albumIndex: number) => (
                  <motion.div
                    key={album.name}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 * albumIndex }}
                    className="bg-card rounded-lg p-6 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{album.name}</h3>
                        <p className="text-sm text-muted-foreground">{album.year} • {album.songs.length} 首歌曲</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {album.songs.slice(0, 3).map((song: any, songIndex: number) => (
                        <motion.div
                          key={song.id}
                          className="flex items-center space-x-3 text-sm"
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.1 * songIndex }}
                        >
                          <span className="text-muted-foreground">{songIndex + 1}</span>
                          <span className="flex-1 truncate">{song.title}</span>
                          <span className="text-muted-foreground">{formatDuration(song.duration)}</span>
                        </motion.div>
                      ))}
                      {album.songs.length > 3 && (
                        <div className="text-sm text-muted-foreground text-center pt-2">
                          还有 {album.songs.length - 3} 首歌曲...
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      className="w-full mt-4"
                      onClick={() => handlePlaySong(album.songs[0]?.id)}
                    >
                      播放专辑
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </ScrollArea>
      </motion.div>
    </motion.div>
  );
}

export default function ArtistDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div>Loading...</div>
      </div>
    }>
      <ArtistDetailContent />
    </Suspense>
  );
}