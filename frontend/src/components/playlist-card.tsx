'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Play, Music2, Check, Link2 } from 'lucide-react';
import type { Playlist } from '@/types';
import { getOptimizedImageUrl } from '@/lib/image-utils';
import { getPlaylistShareUrl, copyShareLink } from '@/lib/share-utils';
import { useState } from 'react';

interface PlaylistCardProps {
  playlist: Playlist;
  onPlay: (playlistId: string) => void;
  formatPlayCount: (count: number) => string;
}

export function PlaylistCard({ playlist, onPlay, formatPlayCount }: PlaylistCardProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = getPlaylistShareUrl(playlist.id);
    const success = await copyShareLink(url);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-300 group"
      onClick={() => onPlay(playlist.id)}
    >
      <div className="relative">
        <Avatar className="w-full h-36 rounded-lg">
          <AvatarImage src={getOptimizedImageUrl(playlist.coverUrl, 'CARD_LARGE')} alt={playlist.name} className="object-cover" />
          <AvatarFallback className="rounded-lg">
            <Music2 className="w-12 h-12" />
          </AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
          <Play className="w-8 h-8 text-white" />
        </div>
      </div>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium truncate mb-1">{playlist.name}</h3>
          <button
            onClick={handleShare}
            className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2"
            title={copied ? '已复制链接' : '复制歌单链接'}
            aria-label="复制歌单链接"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Link2 className="w-4 h-4 text-muted-foreground hover:text-primary" />
            )}
          </button>
        </div>
        <p className="text-xs text-muted-foreground truncate mb-2">{playlist.description || '暂无描述'}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{playlist.songCount} 首歌曲</span>
          <span>{formatPlayCount(playlist.playCount)} 播放</span>
        </div>
      </CardContent>
    </Card>
  );
}