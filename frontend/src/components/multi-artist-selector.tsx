'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArtistBadge } from '@/components/artist-badge';
import { Search, Plus, AlertCircle } from 'lucide-react';
import { Artist } from '@/types';
import { cn } from '@/lib/utils';

interface MultiArtistSelectorProps {
  allArtists: Artist[];
  selectedArtists: Artist[];
  primaryArtistId?: string;
  onSelectedArtistsChange: (artists: Artist[]) => void;
  onPrimaryArtistChange: (artistId: string) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
  maxArtists?: number;
  disabled?: boolean;
}

export function MultiArtistSelector({
  allArtists,
  selectedArtists,
  primaryArtistId,
  onSelectedArtistsChange,
  onPrimaryArtistChange,
  label = "艺术家",
  required = false,
  placeholder = "搜索并添加艺术家...",
  maxArtists = 10,
  disabled = false
}: MultiArtistSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 过滤可选择的艺术家（排除已选择的）
  const availableArtists = allArtists.filter(artist => 
    !selectedArtists.find(selected => selected.id === artist.id) &&
    artist.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 点击外部关闭下拉框
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleAddArtist = (artist: Artist) => {
    if (selectedArtists.length >= maxArtists) return;
    
    const newSelectedArtists = [...selectedArtists, artist];
    onSelectedArtistsChange(newSelectedArtists);
    
    // 如果这是第一个艺术家，自动设为主艺术家
    if (newSelectedArtists.length === 1) {
      onPrimaryArtistChange(artist.id);
    }
    
    setSearchTerm('');
    inputRef.current?.focus();
  };

  const handleRemoveArtist = (artistToRemove: Artist) => {
    const newSelectedArtists = selectedArtists.filter(artist => artist.id !== artistToRemove.id);
    onSelectedArtistsChange(newSelectedArtists);
    
    // 如果移除的是主艺术家，重新设置主艺术家
    if (primaryArtistId === artistToRemove.id && newSelectedArtists.length > 0) {
      onPrimaryArtistChange(newSelectedArtists[0].id);
    }
  };

  const handleSetPrimary = (artistId: string) => {
    onPrimaryArtistChange(artistId);
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      <div className="flex items-center justify-between">
        <Label htmlFor="artist-selector" className={cn(required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
          {label}
        </Label>
        {selectedArtists.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {selectedArtists.length}/{maxArtists}
          </span>
        )}
      </div>

      {/* 已选择的艺术家展示 */}
      {selectedArtists.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-muted/30 rounded-md border">
          {selectedArtists.map((artist) => (
            <ArtistBadge
              key={artist.id}
              artist={artist}
              isPrimary={artist.id === primaryArtistId}
              onRemove={() => handleRemoveArtist(artist)}
              onSetPrimary={() => handleSetPrimary(artist.id)}
              showRemove={!disabled}
              showPrimaryOption={!disabled && selectedArtists.length > 1}
              size="sm"
            />
          ))}
        </div>
      )}

      {/* 搜索输入框 */}
      {!disabled && selectedArtists.length < maxArtists && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            id="artist-selector"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="pl-9"
          />

          {/* 搜索结果下拉框 */}
          {isOpen && (
            <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg">
              <CardContent className="p-0">
                <div className="max-h-48 overflow-y-auto">
                  {availableArtists.length > 0 ? (
                    <div className="p-1">
                      {availableArtists.map((artist) => (
                        <Button
                          key={artist.id}
                          variant="ghost"
                          className="w-full justify-start h-auto p-2 text-left font-normal"
                          onClick={() => handleAddArtist(artist)}
                        >
                          <Plus className="h-4 w-4 mr-2 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{artist.name}</div>
                            {artist.bio && (
                              <div className="text-xs text-muted-foreground truncate max-w-xs">
                                {artist.bio}
                              </div>
                            )}
                          </div>
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      {searchTerm ? '没有找到匹配的艺术家' : '开始输入以搜索艺术家'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* 限制提示 */}
      {selectedArtists.length >= maxArtists && (
        <div className="flex items-center gap-2 text-xs text-amber-600">
          <AlertCircle className="h-3 w-3" />
          <span>已达到最大艺术家数量限制</span>
        </div>
      )}

      {/* 主艺术家说明 */}
      {selectedArtists.length > 1 && primaryArtistId && (
        <div className="text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            主艺术家将作为专辑的主要创作者显示
          </span>
        </div>
      )}
    </div>
  );
}