'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Play, Music2 } from 'lucide-react';

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  songCount: number;
  playCount: number;
  creator: string;
}

interface PlaylistCardProps {
  playlist: Playlist;
  onPlay: (playlistId: string) => void;
  formatPlayCount: (count: number) => string;
}

export function PlaylistCard({ playlist, onPlay, formatPlayCount }: PlaylistCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-300 group"
      onClick={() => onPlay(playlist.id)}
    >
      <div className="relative">
        <Avatar className="w-full h-36 rounded-lg">
          <AvatarImage src={playlist.coverUrl} alt={playlist.name} className="object-cover" />
          <AvatarFallback className="rounded-lg">
            <Music2 className="w-12 h-12" />
          </AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
          <Play className="w-8 h-8 text-white" />
        </div>
      </div>
      <CardContent className="p-3">
        <h3 className="font-medium truncate mb-1">{playlist.name}</h3>
        <p className="text-xs text-muted-foreground truncate mb-2">{playlist.description}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{playlist.songCount} 首歌曲</span>
          <span>{formatPlayCount(playlist.playCount)} 播放</span>
        </div>
      </CardContent>
    </Card>
  );
}