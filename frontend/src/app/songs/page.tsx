'use client';

import { useState, useMemo } from 'react';
import { Sidebar } from '@/components/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Heart, Music2, Search, Grid, List, Clock, Upload, ChevronLeft, ChevronRight } from 'lucide-react';

// Mock songs data - Extended with more songs for pagination
const mockSongs = [
  {
    id: '1',
    title: '晴天',
    artist: '周杰伦',
    album: '叶惠美',
    duration: 269,
    mood: ['快乐', '放松'],
    coverUrl: 'http://p1.music.126.net/CyqwMIOhD_DnBqPF1tGFhw==/109951164276956232.jpg',
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

export default function SongsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'title' | 'artist' | 'playCount' | 'createdAt'>('title');
  const [currentPage, setCurrentPage] = useState(1);
  
  const ITEMS_PER_PAGE = 8; // For song cards layout

  const filteredAndSortedSongs = useMemo(() => {
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
  }, [searchQuery, sortBy]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedSongs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentSongs = filteredAndSortedSongs.slice(startIndex, endIndex);

  const handlePlaySong = (songId: string) => {
    window.location.href = `/play/${songId}`;
  };

  const handleLikeSong = (songId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Toggle like for song:', songId);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background lg:flex">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {/* Theme Toggle - positioned to avoid overlap */}
        <div className="absolute top-4 right-4 z-30 lg:right-6">
          <ThemeToggle />
        </div>

        {/* Header */}
        <div className="p-4 pt-16 lg:p-6 lg:pt-6 lg:pr-20">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">所有歌曲</h1>
              <p className="text-muted-foreground">{mockSongs.length} 首歌曲</p>
            </div>
            <div className="flex flex-col space-y-2 lg:flex-row lg:space-y-0 lg:space-x-2">
              <Button className="w-full lg:w-auto">
                <Upload className="w-4 h-4 mr-2" />
                上传音乐
              </Button>
            </div>
          </div>

          {/* Search and Controls */}
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4 mb-6">
            <div className="relative flex-1 lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索歌曲、艺术家或专辑..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex items-center space-x-2 lg:space-x-4 overflow-x-auto lg:overflow-visible">
              <Tabs value={sortBy} onValueChange={(value) => setSortBy(value as 'title' | 'artist' | 'playCount' | 'createdAt')} className="flex-1 lg:flex-none">
                <TabsList className="grid w-full grid-cols-4 h-8 lg:h-auto lg:w-fit lg:grid-cols-4">
                  <TabsTrigger value="title" className="text-xs lg:text-sm px-1 lg:px-3">标题</TabsTrigger>
                  <TabsTrigger value="artist" className="text-xs lg:text-sm px-1 lg:px-3">艺术家</TabsTrigger>
                  <TabsTrigger value="playCount" className="text-xs lg:text-sm px-1 lg:px-3">播放次数</TabsTrigger>
                  <TabsTrigger value="createdAt" className="text-xs lg:text-sm px-1 lg:px-3">添加时间</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center space-x-1 lg:space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8 p-0 lg:h-auto lg:w-auto lg:p-2"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8 p-0 lg:h-auto lg:w-auto lg:p-2"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Songs Content */}
        <div className="flex-1 p-4 pt-0 lg:p-6">
          {viewMode === 'grid' ? (
            <div>
              {/* Grid View - 1 per row on mobile, 2 per row on desktop */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-8">
                {currentSongs.map((song) => (
                  <Card 
                    key={song.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 group"
                    onClick={() => handlePlaySong(song.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="w-12 h-12 lg:w-14 lg:h-14 rounded-md">
                            <AvatarImage src={song.coverUrl} alt={song.title} className="object-cover" />
                            <AvatarFallback className="rounded-md">
                              <Music2 className="w-6 h-6 lg:w-7 lg:h-7" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                            <Play className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate text-sm mb-0.5">{song.title}</h3>
                          <p className="text-xs lg:text-sm text-muted-foreground truncate mb-1">{song.artist}</p>
                          <div className="flex flex-wrap gap-1">
                            {song.mood.slice(0, 2).map((mood) => (
                              <Badge key={mood} variant="secondary" className="text-xs px-1.5 py-0">
                                {mood}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="text-right text-xs text-muted-foreground hidden lg:block">
                            <div>{formatPlayCount(song.playCount)} 播放</div>
                            <div>{formatDuration(song.duration)}</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleLikeSong(song.id, e)}
                            className="h-8 w-8 p-0"
                          >
                            <Heart className={`w-4 h-4 ${song.liked ? 'text-red-500 fill-current' : ''}`} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* List View */
            <div className="space-y-1">
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
                {currentSongs.map((song) => (
                  <div
                    key={song.id}
                    className="flex items-center px-4 py-2 hover:bg-muted/50 rounded-md cursor-pointer group"
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
                      <div className="font-medium truncate text-sm">{song.title}</div>
                      <div className="flex space-x-1">
                        {song.mood.slice(0, 2).map((mood) => (
                          <Badge key={mood} variant="secondary" className="text-xs px-1.5 py-0">
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
                        className="h-8 w-8 p-0"
                      >
                        <Heart className={`w-4 h-4 ${song.liked ? 'text-red-500 fill-current' : ''}`} />
                      </Button>
                    </div>
                  </div>
                ))}
              </ScrollArea>
              
              {/* Pagination for List View */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}