'use client';

import { useState, useMemo, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Heart, Music2, Search, Grid, List, Clock, Upload } from 'lucide-react';

// Mock songs data
const mockSongs = [
  {
    id: '1',
    title: '晴天',
    artist: '周杰伦',
    album: '叶惠美',
    duration: 269,
    mood: ['快乐', '放松'],
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
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

export default function SongsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'title' | 'artist' | 'playCount' | 'createdAt'>('title');
  const [isClient, setIsClient] = useState(false);

  // Ensure client-side rendering to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredAndSortedSongs = useMemo(() => {
    if (!isClient) {
      // Return songs in original order during SSR
      return mockSongs;
    }

    const filtered = mockSongs.filter(song =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.album.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'artist':
          return a.artist.localeCompare(b.artist);
        case 'playCount':
          return b.playCount - a.playCount;
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });
  }, [searchQuery, sortBy, isClient]);

  const handlePlaySong = (songId: string) => {
    window.location.href = `/play/${songId}`;
  };

  const handleLikeSong = (songId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Toggle like status
    console.log('Toggle like for song:', songId);
  };

  return (
    <div className="min-h-screen bg-background lg:flex">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {/* Theme Toggle */}
        <div className="absolute top-4 right-4 z-30">
          <ThemeToggle />
        </div>

        {/* Header */}
        <div className="p-6 pt-16 lg:pt-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">所有歌曲</h1>
              <p className="text-muted-foreground">{mockSongs.length} 首歌曲</p>
            </div>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              上传音乐
            </Button>
          </div>

          {/* Search and Controls */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索歌曲、艺术家或专辑..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Tabs value={sortBy} onValueChange={(value) => setSortBy(value as 'title' | 'artist' | 'playCount' | 'createdAt')}>
              <TabsList className="grid w-fit grid-cols-4">
                <TabsTrigger value="title">标题</TabsTrigger>
                <TabsTrigger value="artist">艺术家</TabsTrigger>
                <TabsTrigger value="playCount">播放次数</TabsTrigger>
                <TabsTrigger value="createdAt">添加时间</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Songs Content */}
        <div className="flex-1 p-6 pt-0">
          {viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedSongs.map((song) => (
                <Card 
                  key={song.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 group overflow-hidden"
                  onClick={() => handlePlaySong(song.id)}
                >
                  <div className="relative">
                    <Avatar className="w-full h-48 rounded-t-lg rounded-b-none">
                      <AvatarImage src={song.coverUrl} alt={song.title} className="object-cover" />
                      <AvatarFallback className="rounded-t-lg rounded-b-none h-full">
                        <Music2 className="w-12 h-12" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button size="lg" className="rounded-full">
                        <Play className="w-6 h-6" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium truncate mb-1">{song.title}</h3>
                    <p className="text-sm text-muted-foreground truncate mb-2">{song.artist}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {formatPlayCount(song.playCount)} 播放
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleLikeSong(song.id, e)}
                      >
                        <Heart className={`w-4 h-4 ${song.liked ? 'text-red-500 fill-current' : ''}`} />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {song.mood.slice(0, 2).map((mood) => (
                        <Badge key={mood} variant="secondary" className="text-xs">
                          {mood}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-2">
              <div className="flex items-center px-4 py-2 text-sm text-muted-foreground border-b">
                <div className="w-12"></div>
                <div className="flex-1">标题</div>
                <div className="w-32">艺术家</div>
                <div className="w-32">专辑</div>
                <div className="w-20">播放次数</div>
                <div className="w-16 text-right">
                  <Clock className="w-4 h-4 ml-auto" />
                </div>
                <div className="w-16"></div>
              </div>
              <ScrollArea className="h-[calc(100vh-300px)]">
                {filteredAndSortedSongs.map((song) => (
                  <div
                    key={song.id}
                    className="flex items-center px-4 py-3 hover:bg-muted/50 rounded-md cursor-pointer group"
                    onClick={() => handlePlaySong(song.id)}
                  >
                    <div className="w-12 flex items-center justify-center">
                      <Avatar className="w-10 h-10 rounded-md">
                        <AvatarImage src={song.coverUrl} alt={song.title} />
                        <AvatarFallback>
                          <Music2 className="w-5 h-5" />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium truncate">{song.title}</div>
                      <div className="flex space-x-1">
                        {song.mood.slice(0, 2).map((mood) => (
                          <Badge key={mood} variant="secondary" className="text-xs">
                            {mood}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="w-32 text-sm text-muted-foreground truncate">
                      {song.artist}
                    </div>
                    <div className="w-32 text-sm text-muted-foreground truncate">
                      {song.album}
                    </div>
                    <div className="w-20 text-sm text-muted-foreground">
                      {formatPlayCount(song.playCount)}
                    </div>
                    <div className="w-16 text-right text-sm text-muted-foreground">
                      {formatDuration(song.duration)}
                    </div>
                    <div className="w-16 flex items-center justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleLikeSong(song.id, e)}
                      >
                        <Heart className={`w-4 h-4 ${song.liked ? 'text-red-500 fill-current' : ''}`} />
                      </Button>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}