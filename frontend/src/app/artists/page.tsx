'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search, TrendingUp } from 'lucide-react';
import { ArtistCard } from '@/components/artist-card';

interface Artist {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  followers: number;
  songCount: number;
  genres: string[];
  verified: boolean;
}

// Mock artists data
const mockArtists: Artist[] = [
  {
    id: '1',
    name: '周杰伦',
    avatar: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    bio: '华语流行音乐创作天王、制作人、导演',
    followers: 2800000,
    songCount: 42,
    genres: ['华语流行', 'R&B', '嘻哈'],
    verified: true
  },
  {
    id: '2',
    name: 'Ed Sheeran',
    avatar: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
    bio: '英国创作型歌手，流行音乐代表人物',
    followers: 4200000,
    songCount: 52,
    genres: ['流行', '民谣', '流行摇滚'],
    verified: true
  },
  {
    id: '3',
    name: 'Taylor Swift',
    avatar: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    bio: '美国流行音乐天后，词曲创作人',
    followers: 5800000,
    songCount: 78,
    genres: ['流行', '乡村', '流行摇滚'],
    verified: true
  },
  {
    id: '4',
    name: '周深',
    avatar: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    bio: '华语流行歌手，以其独特的嗓音和深厚的唱功著称',
    followers: 3200000,
    songCount: 35,
    genres: ['华语流行', '抒情', '古典流行'],
    verified: true
  },
  {
    id: '5',
    name: '林俊杰',
    avatar: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
    bio: '新加坡华语流行歌手、作曲家、制作人',
    followers: 2600000,
    songCount: 45,
    genres: ['华语流行', 'R&B', '抒情'],
    verified: true
  },
  {
    id: '6',
    name: '邓紫棋 G.E.M.',
    avatar: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    bio: '华语流行歌手，词曲创作人，实力派女歌手',
    followers: 3500000,
    songCount: 40,
    genres: ['华语流行', '摇滚', 'R&B'],
    verified: true
  },
  {
    id: '7',
    name: 'Ludovico Einaudi',
    avatar: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    bio: '意大利当代古典音乐作曲家、钢琴家',
    followers: 1200000,
    songCount: 68,
    genres: ['古典', '电影音乐', '极简主义'],
    verified: true
  },
  {
    id: '8',
    name: 'Adele',
    avatar: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
    bio: '英国灵魂乐歌手，以强大的嗓音和情感表达著称',
    followers: 4900000,
    songCount: 32,
    genres: ['灵魂', '流行', '爵士'],
    verified: true
  },
  {
    id: '9',
    name: '陈奕迅',
    avatar: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    bio: '华语乐坛歌神，以多变的风格和出色的唱功著称',
    followers: 3200000,
    songCount: 58,
    genres: ['华语流行', '爵士', '摇滚'],
    verified: true
  },
  {
    id: '10',
    name: 'Billie Eilish',
    avatar: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    bio: '美国另类流行歌手，格莱美奖大满贯得主',
    followers: 6200000,
    songCount: 28,
    genres: ['另类流行', '电子', '氛围'],
    verified: true
  },
  {
    id: '11',
    name: 'The Weeknd',
    avatar: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
    bio: '加拿大R&B流行歌手，以其独特的音乐风格闻名',
    followers: 3800000,
    songCount: 45,
    genres: ['R&B', '流行', '电子'],
    verified: true
  },
  {
    id: '12',
    name: 'Yiruma',
    avatar: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    bio: '韩国新世纪音乐钢琴家、作曲家',
    followers: 1200000,
    songCount: 35,
    genres: ['新世纪', '古典', '钢琴'],
    verified: true
  }
];

const formatFollowers = (count: number) => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(0)}K`;
  }
  return count.toString();
};

export default function ArtistsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredArtists = useMemo(() => {
    if (!searchQuery) return mockArtists;
    return mockArtists.filter(artist =>
      artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artist.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artist.genres.some(genre => genre.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery]);

  const handleViewArtist = (artistId: string) => {
    window.location.href = `/artist/${artistId}`;
  };

  return (
    <motion.div 
      className="h-full bg-background lg:flex"
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
              <h1 className="text-2xl lg:text-3xl font-bold">热门艺术家</h1>
              <p className="text-muted-foreground">发现你喜爱的音乐创作人</p>
            </div>
            <div className="flex flex-col space-y-2 lg:flex-row lg:space-y-0 lg:space-x-2">
              <Button variant="outline" className="w-full lg:w-auto">
                <TrendingUp className="w-4 h-4 mr-2" />
                本月热门
              </Button>
            </div>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索艺术家..."
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
                {filteredArtists.map((artist, index) => (
                  <motion.div
                    key={artist.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                  >
                    <ArtistCard
                      artist={artist}
                      onView={handleViewArtist}
                      formatFollowers={formatFollowers}
                    />
                  </motion.div>
                ))}
              </motion.div>

              {filteredArtists.length === 0 && (
                <motion.div 
                  className="flex flex-col items-center justify-center h-64 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <Search className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">没有找到艺术家</h3>
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