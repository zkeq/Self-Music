'use client';

import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Music2, Heart, Clock } from 'lucide-react';
import { Song } from './song-card';

interface SearchResultsProps {
  songs: Song[];
  onPlaySong: (songId: string) => void;
  onLikeSong: (songId: string, e: React.MouseEvent) => void;
  formatPlayCount: (count: number) => string;
  formatDuration: (seconds: number) => string;
}

export function SearchResults({ 
  songs, 
  onPlaySong, 
  onLikeSong, 
  formatPlayCount, 
  formatDuration 
}: SearchResultsProps) {
  return (
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
        {songs.map((song) => (
          <div
            key={song.id}
            className="flex items-center px-4 py-3 hover:bg-muted/50 rounded-md cursor-pointer group"
            onClick={() => onPlaySong(song.id)}
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
                onClick={(e) => onLikeSong(song.id, e)}
              >
                <Heart className={`w-4 h-4 ${song.liked ? 'text-red-500 fill-current' : ''}`} />
              </Button>
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}