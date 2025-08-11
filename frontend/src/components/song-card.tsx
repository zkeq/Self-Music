'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Play, Heart, Music2, TrendingUp, ListPlus } from 'lucide-react';

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  mood: string[];
  coverUrl: string;
  liked: boolean;
  playCount: number;
  createdAt: string;
}

interface SongCardProps {
  song: Song;
  onPlay: (songId: string) => void;
  onLike: (songId: string, e: React.MouseEvent) => void;
  onAddToPlaylist: (song: Song, e: React.MouseEvent) => void;
  formatPlayCount: (count: number) => string;
}

export function SongCard({ song, onPlay, onLike, onAddToPlaylist, formatPlayCount }: SongCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-300 group"
      onClick={() => onPlay(song.id)}
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
          
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => onAddToPlaylist(song, e)}
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              title="添加到播放列表"
            >
              <ListPlus className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => onLike(song.id, e)}
              className="h-8 w-8 p-0"
            >
              <Heart className={`w-4 h-4 ${song.liked ? 'text-red-500 fill-current' : ''}`} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}