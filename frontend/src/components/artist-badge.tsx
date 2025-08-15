'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Crown } from 'lucide-react';
import { Artist } from '@/types';
import { cn } from '@/lib/utils';

interface ArtistBadgeProps {
  artist: Artist;
  isPrimary?: boolean;
  onRemove?: () => void;
  onSetPrimary?: () => void;
  showRemove?: boolean;
  showPrimaryOption?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ArtistBadge({ 
  artist, 
  isPrimary = false, 
  onRemove, 
  onSetPrimary,
  showRemove = false,
  showPrimaryOption = false,
  size = 'md'
}: ArtistBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  return (
    <Badge
      variant={isPrimary ? "default" : "secondary"}
      className={cn(
        "flex items-center gap-1.5 font-medium transition-all",
        sizeClasses[size],
        isPrimary && "bg-primary text-primary-foreground ring-2 ring-primary/20",
        !isPrimary && "bg-secondary hover:bg-secondary/80",
        "cursor-default"
      )}
    >
      {isPrimary && <Crown className="h-3 w-3" />}
      <span>{artist.name}</span>
      
      {showPrimaryOption && !isPrimary && onSetPrimary && (
        <Button
          variant="ghost"
          size="sm"
          className="h-4 w-4 p-0 ml-1 hover:bg-primary/20 text-muted-foreground hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onSetPrimary();
          }}
          title="设为主艺术家"
        >
          <Crown className="h-3 w-3" />
        </Button>
      )}
      
      {showRemove && onRemove && (
        <Button
          variant="ghost"
          size="sm"
          className="h-4 w-4 p-0 ml-1 hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          title="移除艺术家"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </Badge>
  );
}