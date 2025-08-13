'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Star } from 'lucide-react';
import type { Artist } from '@/types';

interface ArtistCardProps {
  artist: Artist;
  onView: (artistId: string) => void;
  formatFollowers: (count: number) => string;
}

export function ArtistCard({ artist, onView, formatFollowers }: ArtistCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-300 group text-center"
      onClick={() => onView(artist.id)}
    >
      <CardContent className="p-4">
        <div className="relative mb-3">
          <Avatar className="w-16 h-16 mx-auto">
            <AvatarImage src={artist.avatar || ''} alt={artist.name} className="object-cover" />
            <AvatarFallback>
              <Users className="w-8 h-8" />
            </AvatarFallback>
          </Avatar>
          {artist.verified && (
            <div className="absolute -top-1 -right-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
            </div>
          )}
        </div>
        <h3 className="font-medium truncate mb-1">{artist.name}</h3>
        <p className="text-xs text-muted-foreground mb-2">{artist.songCount} 首歌曲</p>
        <div className="flex items-center justify-center text-xs text-muted-foreground">
          <Users className="w-3 h-3 mr-1" />
          <span>{formatFollowers(artist.followers)} 关注者</span>
        </div>
      </CardContent>
    </Card>
  );
}