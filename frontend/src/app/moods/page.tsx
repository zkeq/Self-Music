'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Music2 } from 'lucide-react';
import { useMoodsStore } from '@/lib/data-stores';
import { getIconComponent } from '@/lib/icon-map';

export default function MoodsPage() {
  const router = useRouter();
  
  const { 
    moods, 
    fetchMoods, 
    isLoading 
  } = useMoodsStore();

  useEffect(() => {
    fetchMoods();
  }, [fetchMoods]);

  const handleMoodClick = (moodId: string) => {
    router.push(`/mood/${moodId}`);
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
            <div className="mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">心情音乐</h1>
              <p className="text-muted-foreground text-lg">根据你的心情选择适合的音乐</p>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-card rounded-xl p-4 animate-pulse">
                    <div className="aspect-[16/9] bg-muted rounded-lg mb-3" />
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-3 bg-muted rounded w-3/4" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-6">
                {moods.map((mood, index) => {
                  const IconComponent = getIconComponent(mood.icon, Music2);
                  
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
                        onClick={() => handleMoodClick(mood.id)}
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
        </div>
      </motion.div>
    </motion.div>
  );
}