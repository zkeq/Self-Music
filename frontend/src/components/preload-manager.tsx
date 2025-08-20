'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Music, Image, Loader2 } from 'lucide-react';
import { cacheManager } from '@/lib/cache-manager';

interface PreloadManagerProps {
  songs?: Array<{
    id: string;
    title: string;
    audioUrl?: string;
    coverUrl?: string;
  }>;
  onPreloadComplete?: () => void;
}

export function PreloadManager({ songs = [], onPreloadComplete }: PreloadManagerProps) {
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadedCount, setPreloadedCount] = useState(0);

  const handlePreloadAll = async () => {
    if (songs.length === 0) return;
    
    setIsPreloading(true);
    setPreloadedCount(0);
    
    try {
      for (let i = 0; i < songs.length; i++) {
        const song = songs[i];
        await cacheManager.preloadSong(song);
        setPreloadedCount(i + 1);
        
        // Add a small delay to prevent overwhelming the network
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      onPreloadComplete?.();
    } catch (error) {
      console.error('Failed to preload songs:', error);
    } finally {
      setIsPreloading(false);
    }
  };

  const handlePreloadCurrent = async (song: { id: string; title: string; audioUrl?: string; coverUrl?: string }) => {
    try {
      await cacheManager.preloadSong(song);
    } catch (error) {
      console.error('Failed to preload song:', error);
    }
  };

  if (songs.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          离线缓存
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">批量缓存歌曲</p>
            <p className="text-sm text-muted-foreground">
              缓存 {songs.length} 首歌曲用于离线播放
            </p>
          </div>
          <Button
            onClick={handlePreloadAll}
            disabled={isPreloading}
            className="flex items-center gap-2"
          >
            {isPreloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                缓存中... {preloadedCount}/{songs.length}
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                全部缓存
              </>
            )}
          </Button>
        </div>

        {isPreloading && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(preloadedCount / songs.length) * 100}%` }}
            />
          </div>
        )}

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {songs.slice(0, 5).map((song) => (
            <div key={song.id} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4" />
                <span className="text-sm truncate flex-1">{song.title}</span>
              </div>
              <Button
                onClick={() => handlePreloadCurrent(song)}
                variant="outline"
                size="sm"
              >
                <Download className="w-3 h-3" />
              </Button>
            </div>
          ))}
          {songs.length > 5 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              还有 {songs.length - 5} 首歌曲...
            </p>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          <p>💡 缓存后的歌曲可在离线状态下播放</p>
          <p>📱 音频文件缓存 2 个月，封面图片同样缓存 2 个月</p>
        </div>
      </CardContent>
    </Card>
  );
}