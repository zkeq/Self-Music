'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search, Shuffle, PlayCircle, ChevronRight } from 'lucide-react';
import { Song } from '@/components/song-card';
import { Playlist } from '@/components/playlist-card';
import { Artist } from '@/components/artist-card';
import { SearchResults } from '@/components/search-results';
import { FeaturedSection } from '@/components/featured-section';
import { PlaylistCard } from '@/components/playlist-card';
import { ArtistCard } from '@/components/artist-card';
import { usePlayerStore } from '@/lib/store';

// Mock playlists data
const mockPlaylists: Playlist[] = [
  {
    id: '1',
    name: '流行热歌榜',
    description: '最新最热的流行音乐',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    songCount: 25,
    playCount: 125000,
    creator: 'Self Music'
  },
  {
    id: '2',
    name: '轻松咖啡时光',
    description: '适合咖啡时光的轻松音乐',
    coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
    songCount: 18,
    playCount: 87000,
    creator: 'Self Music'
  },
  {
    id: '3',
    name: '古典精选',
    description: '经典古典音乐作品',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    songCount: 32,
    playCount: 56000,
    creator: 'Self Music'
  },
  {
    id: '4',
    name: '华语金曲',
    description: '经典华语歌曲合集',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    songCount: 28,
    playCount: 156000,
    creator: 'Self Music'
  }
];

// Mock artists data
const mockArtists: Artist[] = [
  {
    id: '1',
    name: '周杰伦',
    avatar: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop',
    followers: 2800000,
    songCount: 45,
    verified: true
  },
  {
    id: '2',
    name: 'Yiruma',
    avatar: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=150&fit=crop',
    followers: 1200000,
    songCount: 28,
    verified: true
  },
  {
    id: '3',
    name: 'Ludovico Einaudi',
    avatar: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150&h=150&fit=crop',
    followers: 980000,
    songCount: 35,
    verified: true
  },
  {
    id: '4',
    name: 'Ed Sheeran',
    avatar: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=150&fit=crop',
    followers: 4200000,
    songCount: 52,
    verified: true
  }
];

// Mock songs data - Featured songs for homepage
const mockSongs: Song[] = [
  {
    id: '1',
    title: '鲜花',
    artist: '回春丹',
    album: 'Live演出',
    duration: 240,
    mood: ['民谣', '治愈'],
    coverUrl: 'http://p1.music.126.net/fKJMTONzRMaeVthOmEvd9A==/109951168948248373.jpg',
    liked: true,
    playCount: 1240,
    createdAt: '2023-01-15'
  },
  {
    id: '2',
    title: 'River Flows in You',
    artist: 'Yiruma',
    album: 'First Love',
    duration: 210,
    mood: ['放松', '浪漫'],
    coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
    liked: false,
    playCount: 890,
    createdAt: '2023-02-10'
  },
  {
    id: '3',
    title: 'Ludovico Einaudi - Nuvole Bianche',
    artist: 'Ludovico Einaudi',
    album: 'Una Mattina',
    duration: 360,
    mood: ['专注', '放松'],
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    liked: true,
    playCount: 2150,
    createdAt: '2023-01-08'
  },
  {
    id: '4',
    title: '夜曲',
    artist: '周杰伦',
    album: '十一月的萧邦',
    duration: 234,
    mood: ['忧郁', '浪漫'],
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    liked: true,
    playCount: 1650,
    createdAt: '2023-03-20'
  },
  {
    id: '5',
    title: '千本樱',
    artist: '初音未来',
    album: 'MIKU-Pack',
    duration: 195,
    mood: ['充满活力', '快乐'],
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    liked: false,
    playCount: 980,
    createdAt: '2023-02-28'
  },
  {
    id: '6',
    title: '告白气球',
    artist: '周杰伦',
    album: '周杰伦的床边故事',
    duration: 201,
    mood: ['浪漫', '快乐'],
    coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
    liked: true,
    playCount: 3200,
    createdAt: '2023-01-30'
  },
  {
    id: '7',
    title: '稻香',
    artist: '周杰伦',
    album: '魔杰座',
    duration: 225,
    mood: ['治愈', '快乐'],
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    liked: true,
    playCount: 2840,
    createdAt: '2023-01-22'
  },
  {
    id: '8',
    title: 'Canon in D',
    artist: 'Johann Pachelbel',
    album: 'Classical Collection',
    duration: 320,
    mood: ['古典', '优雅'],
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    liked: false,
    playCount: 1550,
    createdAt: '2023-02-05'
  },
  {
    id: '9',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    album: '÷ (Divide)',
    duration: 233,
    mood: ['流行', '动感'],
    coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
    liked: true,
    playCount: 4200,
    createdAt: '2023-03-01'
  },
  {
    id: '10',
    title: '安静',
    artist: '周杰伦',
    album: '范特西',
    duration: 275,
    mood: ['忧郁', '深情'],
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    liked: true,
    playCount: 1890,
    createdAt: '2023-01-18'
  },
  {
    id: '11',
    title: '月光奏鸣曲',
    artist: 'Ludwig van Beethoven',
    album: 'Classical Masterpieces',
    duration: 455,
    mood: ['古典', '深沉'],
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    liked: false,
    playCount: 1120,
    createdAt: '2023-02-14'
  },
  {
    id: '12',
    title: 'Despacito',
    artist: 'Luis Fonsi ft. Daddy Yankee',
    album: 'Vida',
    duration: 229,
    mood: ['拉丁', '热情'],
    coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
    liked: true,
    playCount: 5800,
    createdAt: '2023-03-10'
  }
];

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const formatPlayCount = (count: number) => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
};

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { setSong, play } = usePlayerStore();
  
  const filteredSongs = useMemo(() => {
    if (!searchQuery) return mockSongs;
    return mockSongs.filter(song =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.album.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handlePlaySong = (songId: string) => {
    const song = mockSongs.find(s => s.id === songId);
    if (song) {
      // 转换歌曲格式并设置为当前播放歌曲
      const audioUrl = songId === '1' 
        ? 'https://media.onmicrosoft.cn/%E5%9B%9E%E6%98%A5%E4%B8%B9%20-%20%E9%B2%9C%E8%8A%B1.flac'
        : `http://localhost:8000/api/songs/${song.id}/stream`;
        
      const playerSong = {
        id: song.id,
        title: song.title,
        artist: song.artist,
        album: song.album,
        duration: song.duration,
        mood: song.mood,
        coverUrl: song.coverUrl,
        audioUrl: audioUrl,
        createdAt: song.createdAt,
        updatedAt: new Date().toISOString(),
      };
      
      console.log('Setting song:', playerSong);
      setSong(playerSong);
      setTimeout(() => {
        console.log('Starting playback...');
        play();
      }, 100);
    }
  };

  const handleLikeSong = (songId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Toggle like for song:', songId);
  };

  const handlePlayPlaylist = (playlistId: string) => {
    console.log('Play playlist:', playlistId);
  };

  const handleViewArtist = (artistId: string) => {
    console.log('View artist:', artistId);
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

  return (
    <motion.div 
      className="h-screen bg-background lg:flex"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >{/* Set fixed height to viewport */}
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <motion.div 
        className="flex-1 flex flex-col relative overflow-hidden"
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >{/* Add overflow-hidden to prevent scrolling */}
        {/* Theme Toggle - positioned to avoid overlap */}
        <div className="absolute top-4 right-4 z-30 lg:right-6">
          <ThemeToggle />
        </div>

        {/* Header */}
        <motion.div 
          className="flex-shrink-0 p-4 pt-16 lg:p-6 lg:pt-6 lg:pr-20"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >{/* Make header fixed size */}
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

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索歌曲、艺术家或歌单..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div 
          className="flex-1 min-h-0"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >{/* min-h-0 is crucial for flex child to shrink */}
          <ScrollArea className="h-full">
            <div className="p-4 pt-0 lg:p-6">
          {searchQuery ? (
            <SearchResults 
              songs={filteredSongs}
              onPlaySong={handlePlaySong}
              onLikeSong={handleLikeSong}
              formatPlayCount={formatPlayCount}
              formatDuration={formatDuration}
            />
          ) : (
            /* Home Sections */
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
                  songs={mockSongs}
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
                  <Button variant="ghost" size="sm">
                    查看全部
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {mockPlaylists.map((playlist) => (
                    <PlaylistCard
                      key={playlist.id}
                      playlist={playlist}
                      onPlay={handlePlayPlaylist}
                      formatPlayCount={formatPlayCount}
                    />
                  ))}
                </div>
              </motion.section>

              {/* Popular Artists */}
              <motion.section
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">热门艺术家</h2>
                  <Button variant="ghost" size="sm">
                    查看全部
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {mockArtists.map((artist) => (
                    <ArtistCard
                      key={artist.id}
                      artist={artist}
                      onView={handleViewArtist}
                      formatFollowers={formatFollowers}
                    />
                  ))}
                </div>
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