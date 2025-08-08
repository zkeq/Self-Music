'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Heart, Smile, Coffee, Zap, Sun, CloudRain, Music2 } from 'lucide-react';

// Mock mood data
const moodData = [
  {
    id: 'happy',
    name: '快乐',
    description: '充满活力和正能量的音乐',
    icon: Smile,
    color: 'from-yellow-400 to-orange-500',
    songCount: 124,
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    songs: [
      { id: '1', title: '晴天', artist: '周杰伦', duration: 269, coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop' },
      { id: '2', title: '青花瓷', artist: '周杰伦', duration: 231, coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop' },
      { id: '3', title: '童话', artist: '光良', duration: 243, coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop' },
    ]
  },
  {
    id: 'relaxed',
    name: '放松',
    description: '舒缓心情，释放压力',
    icon: Coffee,
    color: 'from-green-400 to-blue-500',
    songCount: 87,
    coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
    songs: [
      { id: '4', title: '安静', artist: '周杰伦', duration: 275, coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop' },
      { id: '5', title: 'River Flows in You', artist: 'Yiruma', duration: 210, coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop' },
    ]
  },
  {
    id: 'energetic',
    name: '充满活力',
    description: '激发动力，提升能量',
    icon: Zap,
    color: 'from-red-400 to-pink-500',
    songCount: 156,
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
    songs: [
      { id: '6', title: '稻香', artist: '周杰伦', duration: 223, coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop' },
      { id: '7', title: '听妈妈的话', artist: '周杰伦', duration: 255, coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop' },
    ]
  },
  {
    id: 'focus',
    name: '专注',
    description: '适合工作和学习的背景音乐',
    icon: Sun,
    color: 'from-purple-400 to-indigo-500',
    songCount: 93,
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    songs: [
      { id: '8', title: 'Ludovico Einaudi - Nuvole Bianche', artist: 'Ludovico Einaudi', duration: 360, coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop' },
      { id: '9', title: 'Max Richter - On The Nature of Daylight', artist: 'Max Richter', duration: 380, coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop' },
    ]
  },
  {
    id: 'melancholy',
    name: '忧郁',
    description: '情感深沉，触动内心',
    icon: CloudRain,
    color: 'from-gray-400 to-blue-600',
    songCount: 64,
    coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
    songs: [
      { id: '10', title: '夜曲', artist: '周杰伦', duration: 234, coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop' },
      { id: '11', title: '说好不哭', artist: '周杰伦', duration: 267, coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop' },
    ]
  },
  {
    id: 'romantic',
    name: '浪漫',
    description: '温馨浪漫，情意绵绵',
    icon: Heart,
    color: 'from-pink-400 to-red-500',
    songCount: 78,
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
    songs: [
      { id: '12', title: '告白气球', artist: '周杰伦', duration: 201, coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop' },
      { id: '13', title: '简单爱', artist: '周杰伦', duration: 269, coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop' },
    ]
  }
];

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export default function MoodsPage() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const currentMood = selectedMood 
    ? moodData.find(m => m.id === selectedMood)
    : null;

  const handlePlaySong = (songId: string) => {
    window.location.href = `/play/${songId}`;
  };

  const handlePlayMood = (moodId: string) => {
    // Play first song in mood
    const mood = moodData.find(m => m.id === moodId);
    if (mood && mood.songs.length > 0) {
      handlePlaySong(mood.songs[0].id);
    }
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
          <div className="mb-6">
            <h1 className="text-3xl font-bold">心情音乐</h1>
            <p className="text-muted-foreground">根据你的心情选择适合的音乐</p>
          </div>
        </div>

        {selectedMood ? (
          // Mood Detail View
          <div className="flex-1 p-6">
            <Button 
              variant="ghost" 
              className="mb-6"
              onClick={() => setSelectedMood(null)}
            >
              ← 返回心情选择
            </Button>
            
            {currentMood && (
              <>
                {/* Mood Header */}
                <div className="flex items-center space-x-6 mb-8">
                  <div className={`w-48 h-48 rounded-lg bg-gradient-to-br ${currentMood.color} flex items-center justify-center`}>
                    <currentMood.icon className="w-24 h-24 text-white" />
                  </div>
                  <div className="flex-1">
                    <Badge variant="secondary" className="mb-2">心情</Badge>
                    <h2 className="text-4xl font-bold mb-2">{currentMood.name}</h2>
                    <p className="text-muted-foreground mb-4">{currentMood.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-6">
                      <span>{currentMood.songCount} 首歌曲</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Button size="lg" onClick={() => handlePlayMood(currentMood.id)}>
                        <Play className="w-5 h-5 mr-2" />
                        播放
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Songs List */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">推荐歌曲</h3>
                  <ScrollArea className="h-96">
                    <div className="grid gap-4">
                      {currentMood.songs.map((song) => (
                        <Card 
                          key={song.id}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => handlePlaySong(song.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-4">
                              <Avatar className="w-12 h-12 rounded-md">
                                <AvatarImage src={song.coverUrl} alt={song.title} />
                                <AvatarFallback>
                                  <Music2 className="w-6 h-6" />
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h4 className="font-medium">{song.title}</h4>
                                <p className="text-sm text-muted-foreground">{song.artist}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-muted-foreground">
                                  {formatDuration(song.duration)}
                                </span>
                                <Button variant="ghost" size="sm">
                                  <Play className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </>
            )}
          </div>
        ) : (
          // Mood Selection Grid
          <div className="flex-1 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {moodData.map((mood) => (
                <Card 
                  key={mood.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 group overflow-hidden"
                  onClick={() => setSelectedMood(mood.id)}
                >
                  <div className={`h-48 bg-gradient-to-br ${mood.color} relative flex items-center justify-center`}>
                    <mood.icon className="w-16 h-16 text-white group-hover:scale-110 transition-transform" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between">
                      {mood.name}
                      <Badge variant="secondary">{mood.songCount}</Badge>
                    </CardTitle>
                    <CardDescription>
                      {mood.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayMood(mood.id);
                      }}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      立即播放
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}