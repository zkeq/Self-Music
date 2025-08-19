'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Play, Music2, ArrowLeft } from 'lucide-react';
import { useMoodsStore } from '@/lib/data-stores';
import { usePlayerStore } from '@/lib/store';
import type { Song } from '@/types';
import { getIconComponent } from '@/lib/icon-map';
import { getOptimizedImageUrl } from '@/lib/image-utils';

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export default function MoodDetailPage() {
  const params = useParams();
  const router = useRouter();
  const moodId = params.id as string;
  
  const { 
    currentMood, 
    moodSongs, 
    fetchMood, 
    fetchMoodSongs,
    isLoading 
  } = useMoodsStore();
  
  const { setSong, play, setPlaylist } = usePlayerStore();

  useEffect(() => {
    if (moodId) {
      fetchMood(moodId);
      fetchMoodSongs(moodId);
    }
  }, [moodId, fetchMood, fetchMoodSongs]);

  const handlePlaySong = (song: Song) => {
    setSong(song);
    setTimeout(() => play(), 100);
  };

  const handlePlayMood = () => {
    if (currentMood && moodSongs.length > 0) {
      // 设置整个心情的歌曲列表为播放列表
      setPlaylist(moodSongs, 0);
      play();
    }
  };

  const goBack = () => {
    router.push('/moods');
  };

  if (isLoading) {
    return (
      <motion.div 
        className="h-full bg-background lg:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Sidebar />
        
        <div className="flex-1 flex flex-col relative min-h-0">
          <div className="absolute top-4 right-4 z-30 lg:right-6">
            <ThemeToggle />
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!currentMood) {
    return (
      <motion.div 
        className="h-full bg-background lg:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Sidebar />
        
        <div className="flex-1 flex flex-col relative min-h-0">
          <div className="absolute top-4 right-4 z-30 lg:right-6">
            <ThemeToggle />
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">心情不存在</h2>
              <Button onClick={goBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回心情选择
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  const IconComponent = getIconComponent(currentMood.icon, Music2);
  
  return (
    <motion.div 
      className="h-full bg-background lg:flex"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Sidebar />
      
      <motion.div 
        className="flex-1 flex flex-col relative min-h-0"
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="absolute top-4 right-4 z-30 lg:right-6">
          <ThemeToggle />
        </div>

        <div className="flex-1 overflow-y-auto">
          <motion.div 
            className="p-6 pt-16 lg:pt-6"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button 
              variant="ghost" 
              size="sm"
              onClick={goBack}
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回心情选择
            </Button>
            
            <motion.div 
              className="flex flex-col lg:flex-row items-start space-y-6 lg:space-y-0 lg:space-x-8 mb-8"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <div className={`w-64 h-64 rounded-2xl shadow-2xl bg-gradient-to-br ${currentMood.color} flex items-center justify-center`}>
                  <IconComponent className="w-32 h-32 text-white" />
                </div>
              </motion.div>
              
              <motion.div 
                className="flex-1 space-y-4"
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Badge variant="secondary" className="text-sm">心情音乐</Badge>
                <h1 className="text-3xl lg:text-5xl font-bold">{currentMood.name}</h1>
                <p className="text-muted-foreground text-lg max-w-2xl">{currentMood.description}</p>
                
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>{currentMood.songCount} 首歌曲</span>
                </div>
                
                <div className="flex items-center space-x-4 pt-4">
                  <Button size="lg" onClick={handlePlayMood}>
                    <Play className="w-5 h-5 mr-2" />
                    播放全部
                  </Button>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="pb-6"
            >
              <h2 className="text-2xl font-bold mb-6">推荐歌曲</h2>
              <div className="bg-card rounded-lg shadow-sm">
                <div className="flex items-center px-4 py-3 text-sm text-muted-foreground border-b border-border">
                  <div className="w-8">#</div>
                  <div className="flex-1">标题</div>
                  <div className="w-20 text-right">时长</div>
                </div>
                
                <div>
                  {moodSongs.map((song, index) => (
                    <motion.div 
                      key={song.id}
                      className="flex items-center px-4 py-3 hover:bg-muted/50 rounded-md cursor-pointer group transition-colors"
                      onClick={() => handlePlaySong(song)}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                      whileHover={{ x: 4 }}
                    >
                      <div className="w-8 text-sm text-muted-foreground">
                        <span className="group-hover:hidden">{index + 1}</span>
                        <Play className="w-4 h-4 hidden group-hover:block text-primary" />
                      </div>
                      
                      <Avatar className="w-12 h-12 rounded-md mr-4">
                        <AvatarImage src={getOptimizedImageUrl(song.coverUrl, 'ICON_MEDIUM')} alt={song.title} />
                        <AvatarFallback>
                          <Music2 className="w-6 h-6" />
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="font-medium">{song.title}</div>
                        <div className="text-sm text-muted-foreground">{song.artist.name}</div>
                      </div>
                      
                      <div className="w-20 text-right text-sm text-muted-foreground">
                        {formatDuration(song.duration)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}