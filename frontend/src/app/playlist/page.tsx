'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Play, Plus, Heart, MoreHorizontal, Music, Clock } from 'lucide-react';

// Mock data for playlists and songs
const mockPlaylists = [
  {
    id: '1',
    name: '我喜欢的音乐',
    description: '收藏的经典歌曲',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    songCount: 42,
    duration: 2580, // in seconds
    songs: [
      { id: '1', title: '夜的钢琴曲', artist: '石进', duration: 240, liked: true },
      { id: '2', title: '千本樱', artist: '初音未来', duration: 195, liked: false },
      { id: '3', title: 'River Flows in You', artist: 'Yiruma', duration: 210, liked: true },
    ]
  },
  {
    id: '2', 
    name: '专注工作',
    description: '适合工作时听的音乐',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    songCount: 28,
    duration: 1680,
    songs: [
      { id: '4', title: 'Ludovico Einaudi - Nuvole Bianche', artist: 'Ludovico Einaudi', duration: 360, liked: false },
      { id: '5', title: 'Max Richter - On The Nature of Daylight', artist: 'Max Richter', duration: 380, liked: true },
    ]
  },
  {
    id: '3',
    name: '放松心情', 
    description: '缓解压力的轻松音乐',
    coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
    songCount: 35,
    duration: 2100,
    songs: [
      { id: '6', title: '安静', artist: '周杰伦', duration: 275, liked: true },
      { id: '7', title: '月亮代表我的心', artist: '邓丽君', duration: 195, liked: false },
    ]
  }
];

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours} 小时 ${minutes % 60} 分钟`;
  }
  return `${minutes} 分钟`;
};

const formatSongDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export default function PlaylistPage() {
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);

  const currentPlaylist = selectedPlaylist 
    ? mockPlaylists.find(p => p.id === selectedPlaylist)
    : null;

  const handlePlaySong = (songId: string) => {
    // Navigate to specific song
    window.location.href = `/play/${songId}`;
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
              <h1 className="text-3xl font-bold">播放列表</h1>
              <p className="text-muted-foreground">管理你的音乐收藏</p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              创建播放列表
            </Button>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Playlist List */}
          <div className="w-80 border-r p-6">
            <ScrollArea className="h-full">
              <div className="space-y-4">
                {mockPlaylists.map((playlist) => (
                  <Card 
                    key={playlist.id}
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedPlaylist === playlist.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedPlaylist(playlist.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12 rounded-md">
                          <AvatarImage src={playlist.coverUrl} alt={playlist.name} />
                          <AvatarFallback>
                            <Music className="w-6 h-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{playlist.name}</h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {playlist.songCount} 首歌曲 • {formatDuration(playlist.duration)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Playlist Detail */}
          <div className="flex-1 p-6">
            {currentPlaylist ? (
              <div>
                {/* Playlist Header */}
                <div className="flex items-start space-x-6 mb-8">
                  <Avatar className="w-48 h-48 rounded-lg">
                    <AvatarImage src={currentPlaylist.coverUrl} alt={currentPlaylist.name} />
                    <AvatarFallback>
                      <Music className="w-24 h-24" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Badge variant="secondary" className="mb-2">播放列表</Badge>
                    <h2 className="text-4xl font-bold mb-2">{currentPlaylist.name}</h2>
                    <p className="text-muted-foreground mb-4">{currentPlaylist.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-6">
                      <span>{currentPlaylist.songCount} 首歌曲</span>
                      <span>•</span>
                      <span>{formatDuration(currentPlaylist.duration)}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Button size="lg">
                        <Play className="w-5 h-5 mr-2" />
                        播放
                      </Button>
                      <Button variant="ghost" size="lg">
                        <Heart className="w-5 h-5 mr-2" />
                        喜欢
                      </Button>
                      <Button variant="ghost" size="lg">
                        <MoreHorizontal className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Songs List */}
                <div>
                  <div className="flex items-center px-4 py-2 text-sm text-muted-foreground border-b">
                    <div className="w-8">#</div>
                    <div className="flex-1">标题</div>
                    <div className="w-20 text-right">
                      <Clock className="w-4 h-4 ml-auto" />
                    </div>
                  </div>
                  <ScrollArea className="h-96">
                    {currentPlaylist.songs.map((song, index) => (
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
                  </ScrollArea>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Music className="w-24 h-24 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">选择一个播放列表</h3>
                <p className="text-muted-foreground">
                  从左侧选择一个播放列表来查看其内容
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}