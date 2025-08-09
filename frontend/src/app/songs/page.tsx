'use client';

import { useState, useMemo } from 'react';
import { Sidebar } from '@/components/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Heart, Music2, Search, TrendingUp, Star, Users, ChevronRight, Shuffle, PlayCircle, ChevronLeft, Clock } from 'lucide-react';

// Mock playlists data
const mockPlaylists = [
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
const mockArtists = [
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

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<'featured' | 'trending' | 'new' | 'all'>('featured');
  const [currentPage, setCurrentPage] = useState(1);
  
  const ITEMS_PER_PAGE = 12; // For "所有歌曲" pagination

  const filteredSongs = useMemo(() => {
    if (!searchQuery) return mockSongs;
    return mockSongs.filter(song =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.album.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const getFeaturedSongs = () => {
    let songs;
    switch (activeSection) {
      case 'trending':
        songs = [...mockSongs].sort((a, b) => b.playCount - a.playCount);
        break;
      case 'new':
        songs = [...mockSongs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'all':
        songs = mockSongs;
        break;
      default:
        songs = mockSongs;
    }
    
    if (activeSection === 'all') {
      // For "所有歌曲", apply pagination
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      return songs.slice(startIndex, endIndex);
    } else {
      // For other sections, show only first 6
      return songs.slice(0, 6);
    }
  };

  const getTotalPages = () => {
    if (activeSection === 'all') {
      return Math.ceil(mockSongs.length / ITEMS_PER_PAGE);
    }
    return 1;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset page when section changes
  const handleSectionChange = (value: string) => {
    setActiveSection(value as 'featured' | 'trending' | 'new' | 'all');
    setCurrentPage(1);
  };

  const handlePlaySong = (songId: string) => {
    window.location.href = `/play/${songId}`;
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
    <div className="h-screen bg-background lg:flex">{/* Set fixed height to viewport */}
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col relative overflow-hidden">{/* Add overflow-hidden to prevent scrolling */}
        {/* Theme Toggle - positioned to avoid overlap */}
        <div className="absolute top-4 right-4 z-30 lg:right-6">
          <ThemeToggle />
        </div>

        {/* Header */}
        <div className="flex-shrink-0 p-4 pt-16 lg:p-6 lg:pt-6 lg:pr-20">{/* Make header fixed size */}
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
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-0">{/* min-h-0 is crucial for flex child to shrink */}
          <ScrollArea className="h-full">
            <div className="p-4 pt-0 lg:p-6">
          {searchQuery ? (
            /* Search Results - List View */
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
                {filteredSongs.map((song) => (
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
          ) : (
            /* Home Sections */
            <div className="space-y-8">
              {/* Featured Songs */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">精选推荐</h2>
                  <Tabs value={activeSection} onValueChange={handleSectionChange} className="flex-1 max-w-md">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="featured" className="text-xs lg:text-sm">推荐</TabsTrigger>
                      <TabsTrigger value="trending" className="text-xs lg:text-sm">热门</TabsTrigger>
                      <TabsTrigger value="new" className="text-xs lg:text-sm">最新</TabsTrigger>
                      <TabsTrigger value="all" className="text-xs lg:text-sm">所有歌曲</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                
                <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                  {getFeaturedSongs().map((song) => (
                    <Card 
                      key={song.id}
                      className="cursor-pointer hover:shadow-lg transition-all duration-300 group"
                      onClick={() => handlePlaySong(song.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Avatar className="w-14 h-14 rounded-md">
                              <AvatarImage src={song.coverUrl} alt={song.title} className="object-cover" />
                              <AvatarFallback className="rounded-md">
                                <Music2 className="w-7 h-7" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                              <Play className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate mb-1">{song.title}</h3>
                            <p className="text-sm text-muted-foreground truncate mb-2">{song.artist}</p>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <TrendingUp className="w-3 h-3" />
                              <span>{formatPlayCount(song.playCount)} 播放</span>
                            </div>
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
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination for "所有歌曲" */}
                {activeSection === 'all' && getTotalPages() > 1 && (
                  <div className="flex items-center justify-center space-x-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    
                    {Array.from({ length: getTotalPages() }, (_, i) => i + 1).map((page) => (
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
                      disabled={currentPage === getTotalPages()}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </section>

              {/* Hot Playlists */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">热门歌单</h2>
                  <Button variant="ghost" size="sm">
                    查看全部
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {mockPlaylists.map((playlist) => (
                    <Card 
                      key={playlist.id}
                      className="cursor-pointer hover:shadow-lg transition-all duration-300 group"
                      onClick={() => handlePlayPlaylist(playlist.id)}
                    >
                      <div className="relative">
                        <Avatar className="w-full h-36 rounded-lg">
                          <AvatarImage src={playlist.coverUrl} alt={playlist.name} className="object-cover" />
                          <AvatarFallback className="rounded-lg">
                            <Music2 className="w-12 h-12" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                          <Play className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-medium truncate mb-1">{playlist.name}</h3>
                        <p className="text-xs text-muted-foreground truncate mb-2">{playlist.description}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{playlist.songCount} 首歌曲</span>
                          <span>{formatPlayCount(playlist.playCount)} 播放</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Popular Artists */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">热门艺术家</h2>
                  <Button variant="ghost" size="sm">
                    查看全部
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {mockArtists.map((artist) => (
                    <Card 
                      key={artist.id}
                      className="cursor-pointer hover:shadow-lg transition-all duration-300 group text-center"
                      onClick={() => handleViewArtist(artist.id)}
                    >
                      <CardContent className="p-4">
                        <div className="relative mb-3">
                          <Avatar className="w-16 h-16 mx-auto">
                            <AvatarImage src={artist.avatar} alt={artist.name} className="object-cover" />
                            <AvatarFallback>
                              <Users className="w-8 h-8" />
                            </AvatarFallback>
                          </Avatar>
                          {artist.verified && (
                            <div className="absolute -top-1 -right-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            </div>
                          )}
                        </div>
                        <h3 className="font-medium truncate mb-1">{artist.name}</h3>
                        <p className="text-xs text-muted-foreground mb-2">{artist.songCount} 首歌曲</p>
                        <div className="flex items-center justify-center text-xs text-muted-foreground">
                          <Users className="w-3 h-3 mr-1" />
                          <span>{formatFollowers(artist.followers)} 关注者</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            </div>
          )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}