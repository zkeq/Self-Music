'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Play, Heart, Smile, Coffee, Zap, Sun, CloudRain, Music2, ArrowLeft } from 'lucide-react';
import { useMoodsStore } from '@/lib/data-stores';
import { usePlayerStore } from '@/lib/store';
import type { Song } from '@/types';

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const iconMap: Record<string, any> = {
  'Smile': Smile,
  'Coffee': Coffee,
  'Zap': Zap,
  'Sun': Sun,
  'CloudRain': CloudRain,
  'Heart': Heart,
};

export default function MoodsPage() {
  const [selectedMoodId, setSelectedMoodId] = useState<string | null>(null);
  
  const { 
    moods, 
    currentMood, 
    moodSongs, 
    fetchMoods, 
    fetchMood, 
    fetchMoodSongs,
    isLoading 
  } = useMoodsStore();
  
  const { setSong, play } = usePlayerStore();

  useEffect(() => {
    fetchMoods();
  }, [fetchMoods]);

  useEffect(() => {
    if (selectedMoodId) {
      fetchMood(selectedMoodId);
      fetchMoodSongs(selectedMoodId);
    }
  }, [selectedMoodId, fetchMood, fetchMoodSongs]);

  const handlePlaySong = (song: Song) => {
    setSong(song);
    setTimeout(() => play(), 100);
  };

  const handlePlayMood = (moodId: string) => {
    const mood = moods.find(m => m.id === moodId);
    if (mood && moodSongs.length > 0) {
      handlePlaySong(moodSongs[0]);
    }
  };

  const goBack = () => {
    setSelectedMoodId(null);
  };

  if (selectedMoodId && currentMood) {
    const IconComponent = iconMap[currentMood.icon] || Music2;
    
    return (
      <motion.div 
        className="h-full bg-background lg:flex"
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
                  <Button size="lg" onClick={() => handlePlayMood(currentMood.id)}>
                    <Play className="w-5 h-5 mr-2" />
                    播放
                  </Button>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
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
                        <AvatarImage src={song.coverUrl} alt={song.title} />
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
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="h-full bg-background lg:flex"
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

        <motion.div 
          className="p-6 pt-16 lg:pt-6"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">心情音乐</h1>
            <p className="text-muted-foreground text-lg">根据你的心情选择适合的音乐</p>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-card rounded-xl p-4 animate-pulse">
                  <div className="aspect-[16/9] bg-muted rounded-lg mb-3" />
                  <div className="h-4 bg-muted rounded mb-2" />
                  <div className="h-3 bg-muted rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {moods.map((mood, index) => {
                const IconComponent = iconMap[mood.icon] || Music2;
                
                return (
                  <motion.div
                    key={mood.id}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    whileHover={{ y: -2 }}
                    className="group"
                  >
                    <div 
                      className="bg-card rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
                      onClick={() => setSelectedMoodId(mood.id)}
                    >
                      <div className={`aspect-[16/9] bg-gradient-to-br ${mood.color} relative flex items-center justify-center`}>
                        <IconComponent className="w-12 h-12 text-white transition-transform duration-300 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="text-base font-semibold truncate">{mood.name}</h3>
                          <Badge variant="secondary" className="text-xs ml-2">{mood.songCount}</Badge>
                        </div>
                        
                        <p className="text-muted-foreground text-xs truncate">{mood.description}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}