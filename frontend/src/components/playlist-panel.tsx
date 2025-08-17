'use client';

import { useState } from 'react';
import { usePlayerStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ListMusic, 
  Trash2, 
  Play, 
  Pause, 
  X, 
  MoreVertical,
  Shuffle,
  Repeat,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { getIconComponent } from '@/lib/icon-map';

interface PlaylistPanelProps {
  className?: string;
}

export function PlaylistPanel({ className }: PlaylistPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    playlist,
    currentIndex,
    isPlaying,
    shuffleMode,
    repeatMode,
    setSong,
    setPlaylist,
    play,
    pause,
    removeFromPlaylist,
    clearPlaylist,
    moveSongInPlaylist,
    shufflePlaylist,
    toggleShuffle,
    toggleRepeat,
  } = usePlayerStore();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };


  const playFromIndex = (index: number) => {
    if (playlist[index]) {
      setSong(playlist[index]);
      setPlaylist(playlist, index);
      play();
    }
  };

  const handleRemove = (index: number) => {
    const song = playlist[index];
    if (song) {
      removeFromPlaylist(song.id);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      moveSongInPlaylist(index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < playlist.length - 1) {
      moveSongInPlaylist(index, index + 1);
    }
  };

  return (
    <>
      {/* Toggle Button - 放在主题切换按钮左边，弹窗时在面板下方 */}
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={cn(
          "fixed top-4 right-16 bg-background/80 backdrop-blur-sm border transition-all duration-200 z-30",
          isOpen && "bg-primary text-primary-foreground"
        )}
      >
        <ListMusic className="h-5 w-5" />
        {playlist.length > 0 && (
          <Badge 
            variant={isOpen ? "secondary" : "default"}
            className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {playlist.length}
          </Badge>
        )}
      </Button>

      {/* Playlist Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "fixed top-0 right-0 h-full w-80 md:w-96 bg-background/95 backdrop-blur-md border-l shadow-xl z-50",
              className
            )}
          >
            {/* Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">播放列表</h2>
                  <p className="text-sm text-muted-foreground">
                    {playlist.length} 首歌曲
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  {/* 随机播放模式切换 */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleShuffle}
                    className={cn(
                      "h-8",
                      shuffleMode && "bg-primary/10 text-primary"
                    )}
                    title={shuffleMode ? "关闭随机播放" : "开启随机播放"}
                  >
                    <Shuffle className="h-4 w-4" />
                  </Button>
                  
                  {/* 循环播放模式切换 */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleRepeat}
                    className={cn(
                      "h-8 min-w-8",
                      repeatMode !== 'none' && "bg-primary/10 text-primary"
                    )}
                    title={
                      repeatMode === 'none' ? "开启循环播放" :
                      repeatMode === 'all' ? "列表循环" :
                      "单曲循环"
                    }
                  >
                    <div className="flex items-center">
                      <Repeat className="h-4 w-4" />
                      {repeatMode === 'one' && (
                        <span className="ml-1 text-xs font-medium">1</span>
                      )}
                    </div>
                  </Button>

                  {/* 重排播放列表 */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={shufflePlaylist}
                    className="h-8"
                    disabled={playlist.length <= 1}
                    title="重新排列播放列表"
                  >
                    <Shuffle className="h-4 w-4" />
                    <span className="ml-1 text-xs">排</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearPlaylist}
                    className="h-8 text-destructive hover:text-destructive"
                    disabled={playlist.length === 0}
                    title="清空播放列表"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Song List */}
            <ScrollArea className="flex-1 h-[calc(100%-120px)]">
              <div className="p-4">
                {playlist.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <ListMusic className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">播放列表为空</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      添加歌曲开始播放
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {playlist.map((song, index) => (
                      <motion.div
                        key={`${song.id}-${index}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          "group flex items-center p-3 rounded-lg transition-all duration-200",
                          index === currentIndex && "bg-primary/10 border border-primary/20",
                          "hover:bg-accent hover:shadow-sm"
                        )}
                      >
                        {/* Cover */}
                        <div className="relative h-12 w-12 flex-shrink-0 mr-3">
                          {song.coverUrl ? (
                            <img
                              src={song.coverUrl}
                              alt={song.title}
                              className="h-full w-full object-cover rounded-md"
                            />
                          ) : (
                            <div className="h-full w-full bg-muted rounded-md flex items-center justify-center">
                              <ListMusic className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          
                          {/* Play/Pause Overlay */}
                          {index === currentIndex && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="absolute inset-0 bg-black/50 rounded-md flex items-center justify-center"
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-white hover:text-white"
                                onClick={() => isPlaying ? pause() : play()}
                              >
                                {isPlaying ? (
                                  <Pause className="h-4 w-4" />
                                ) : (
                                  <Play className="h-4 w-4 ml-0.5" />
                                )}
                              </Button>
                            </motion.div>
                          )}
                        </div>

                        {/* Song Info - 使用固定宽度避免挤压 */}
                        <div className="flex-1 min-w-0 mr-3 overflow-hidden">
                          <p className={cn(
                            "text-sm font-medium truncate max-w-[140px]",
                            index === currentIndex && "text-primary"
                          )}>
                            {song.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {song.artist.name}
                          </p>
                          {song.moods && song.moods.length > 0 && (
                            <div className="flex gap-1 mt-1 overflow-hidden">
                              {song.moods.slice(0, 2).map((mood) => {
                                const IconComponent = getIconComponent(mood.icon);
                                return (
                                  <Badge key={mood.id} variant="outline" className="h-4 text-xs px-1 flex items-center gap-1 flex-shrink-0">
                                    <IconComponent className="h-2.5 w-2.5" />
                                    {mood.name}
                                  </Badge>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Duration & Actions - 固定右侧区域 */}
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDuration(song.duration)}
                          </span>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => playFromIndex(index)}>
                                <Play className="h-4 w-4 mr-2" />
                                播放此歌曲
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleMoveUp(index)}
                                disabled={index === 0}
                              >
                                <ChevronUp className="h-4 w-4 mr-2" />
                                上移
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleMoveDown(index)}
                                disabled={index === playlist.length - 1}
                              >
                                <ChevronDown className="h-4 w-4 mr-2" />
                                下移
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleRemove(index)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                从播放列表移除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            {playlist.length > 0 && (
              <div className="p-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    总时长: {formatDuration(
                      playlist.reduce((total, song) => total + song.duration, 0)
                    )}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    关闭
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}