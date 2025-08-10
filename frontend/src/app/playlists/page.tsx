'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search, Plus, PlayCircle, ChevronRight } from 'lucide-react';
import { PlaylistCard } from '@/components/playlist-card';
import { Playlist } from '@/components/playlist-card';

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
  },
  {
    id: '5',
    name: '深夜电台',
    description: '适合夜晚聆听的音乐',
    coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
    songCount: 22,
    playCount: 98000,
    creator: 'Self Music'
  },
  {
    id: '6',
    name: '运动节拍',
    description: '充满活力的运动音乐',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    songCount: 35,
    playCount: 234000,
    creator: 'Self Music'
  },
  {
    id: '7',
    name: '民谣时光',
    description: '温暖治愈的民谣音乐',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    songCount: 20,
    playCount: 76000,
    creator: 'Self Music'
  },
  {
    id: '8',
    name: '电子世界',
    description: '前卫的电子音乐集合',
    coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
    songCount: 40,
    playCount: 189000,
    creator: 'Self Music'
  },
  {
    id: '9',
    name: '爵士之夜',
    description: '经典爵士乐精选',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    songCount: 26,
    playCount: 65000,
    creator: 'Self Music'
  },
  {
    id: '10',
    name: '摇滚传奇',
    description: '摇滚乐经典作品',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    songCount: 38,
    playCount: 145000,
    creator: 'Self Music'
  },
  {
    id: '11',
    name: '学习专注',
    description: '适合学习和工作的背景音乐',
    coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
    songCount: 30,
    playCount: 112000,
    creator: 'Self Music'
  },
  {
    id: '12',
    name: '治愈心灵',
    description: '温暖治愈的音乐集合',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    songCount: 24,
    playCount: 89000,
    creator: 'Self Music'
  }
];

const formatPlayCount = (count: number) => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

export default function PlaylistsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredPlaylists = useMemo(() => {
    if (!searchQuery) return mockPlaylists;
    return mockPlaylists.filter(playlist =>
      playlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      playlist.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      playlist.creator.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handlePlayPlaylist = (playlistId: string) => {
    window.location.href = `/playlist/${playlistId}`;
  };

  const handleCreatePlaylist = () => {
    console.log('Create new playlist');
  };

  return (
    <motion.div 
      className="h-screen bg-background lg:flex"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Sidebar />
      
      <motion.div 
        className="flex-1 flex flex-col relative overflow-hidden"
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="absolute top-4 right-4 z-30 lg:right-6">
          <ThemeToggle />
        </div>

        <motion.div 
          className="flex-shrink-0 p-4 pt-16 lg:p-6 lg:pt-6 lg:pr-20"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">热门歌单</h1>
              <p className="text-muted-foreground">发现精心策划的音乐合集</p>
            </div>
            <div className="flex flex-col space-y-2 lg:flex-row lg:space-y-0 lg:space-x-2">
              <Button onClick={handleCreatePlaylist} className="w-full lg:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                创建歌单
              </Button>
              <Button variant="outline" className="w-full lg:w-auto">
                <PlayCircle className="w-4 h-4 mr-2" />
                随机播放
              </Button>
            </div>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索歌单..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </motion.div>

        <motion.div 
          className="flex-1 min-h-0"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <ScrollArea className="h-full">
            <div className="p-4 pt-0 lg:p-6">
              <motion.div 
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                {filteredPlaylists.map((playlist, index) => (
                  <motion.div
                    key={playlist.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                  >
                    <PlaylistCard
                      playlist={playlist}
                      onPlay={handlePlayPlaylist}
                      formatPlayCount={formatPlayCount}
                    />
                  </motion.div>
                ))}
              </motion.div>

              {filteredPlaylists.length === 0 && (
                <motion.div 
                  className="flex flex-col items-center justify-center h-64 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <PlayCircle className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">没有找到歌单</h3>
                  <p className="text-muted-foreground">
                    尝试使用不同的关键词搜索
                  </p>
                </motion.div>
              )}
            </div>
          </ScrollArea>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}