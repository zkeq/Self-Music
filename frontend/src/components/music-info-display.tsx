"use client";

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Music, 
  User, 
  Album as AlbumIcon, 
  Clock, 
  Calendar,
  Building,
  Users,
  FileText,
  Heart
} from 'lucide-react';
import { ImportDetailedInfo } from '@/types';
import { getOptimizedImageUrl } from '@/lib/image-utils';

interface MusicInfoDisplayProps {
  detailedInfo: ImportDetailedInfo;
}

export function MusicInfoDisplay({ detailedInfo }: MusicInfoDisplayProps) {
  const { song, album, artists, lyrics } = detailedInfo;

  // 格式化日期
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // 解析歌词为行数组
  const parseLyrics = (lyricsText: string) => {
    if (!lyricsText) return [];
    
    const lines = lyricsText.split('\n').filter(line => line.trim());
    return lines.map(line => {
      // 简单的LRC格式解析
      const timeMatch = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\]/);
      if (timeMatch) {
        const text = line.replace(/\[.*?\]/g, '').trim();
        return {
          time: `${timeMatch[1]}:${timeMatch[2]}`,
          text: text || '♪'
        };
      }
      return {
        time: '',
        text: line.replace(/\[.*?\]/g, '').trim() || line
      };
    }).filter(line => line.text);
  };

  const lyricsLines = parseLyrics(lyrics);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Music className="h-5 w-5" />
        <h3 className="text-lg font-semibold">音乐详情</h3>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="album">专辑</TabsTrigger>
          <TabsTrigger value="artists">艺术家</TabsTrigger>
          <TabsTrigger value="lyrics">歌词</TabsTrigger>
        </TabsList>

        {/* 概览标签页 */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                歌曲信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  {song.img ? (
                    <img 
                      src={song.img} 
                      alt={song.name}
                      className="w-full h-full rounded-lg object-cover"
                    />
                  ) : (
                    <Music className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                
                <div className="flex-1 space-y-2">
                  <h4 className="text-xl font-semibold">{song.name}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">艺术家:</span>
                      <span>{song.arName.join(', ')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlbumIcon className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">专辑:</span>
                      <span>{song.albumName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">时长:</span>
                      <span>{song.interval}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">ID:</span>
                      <span className="font-mono text-xs">{song.songId}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 专辑标签页 */}
        <TabsContent value="album" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlbumIcon className="h-4 w-4" />
                专辑信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  {album.coverUrl ? (
                    <img 
                      src={getOptimizedImageUrl(album.coverUrl, 'CARD_MEDIUM')} 
                      alt={album.title}
                      className="w-full h-full rounded-lg object-cover"
                    />
                  ) : (
                    <AlbumIcon className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                
                <div className="flex-1 space-y-3">
                  <h4 className="text-xl font-semibold">{album.title}</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">艺术家:</span>
                        <span>{album.artist}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">发行日期:</span>
                        <span>{formatDate(album.releaseDate)}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {album.company && (
                        <div className="flex items-center gap-2">
                          <Building className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">唱片公司:</span>
                          <span>{album.company}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">ID:</span>
                        <span className="font-mono text-xs">{album.id}</span>
                      </div>
                    </div>
                  </div>
                  
                  {album.description && (
                    <div className="mt-3">
                      <div className="flex items-start gap-2">
                        <FileText className="h-3 w-3 text-muted-foreground mt-0.5" />
                        <div>
                          <span className="text-muted-foreground text-sm">专辑简介:</span>
                          <p className="text-sm mt-1 leading-relaxed">{album.description}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 艺术家标签页 */}
        <TabsContent value="artists" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                艺术家信息
                <Badge variant="secondary">{artists.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {artists.map((artist, index) => (
                  <div key={artist.id}>
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                        {artist.avatarUrl ? (
                          <img 
                            src={artist.avatarUrl} 
                            alt={artist.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h5 className="font-medium">{artist.name}</h5>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>ID: <span className="font-mono">{artist.id}</span></div>
                          {artist.fanCount && (
                            <div className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {artist.fanCount} 粉丝
                            </div>
                          )}
                        </div>
                        
                        {artist.intro && (
                          <p className="text-sm mt-2 text-muted-foreground line-clamp-2">
                            {artist.intro}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {index < artists.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 歌词标签页 */}
        <TabsContent value="lyrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                歌词
                {lyricsLines.length > 0 && (
                  <Badge variant="secondary">{lyricsLines.length} 行</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lyricsLines.length > 0 ? (
                <ScrollArea className="h-80 w-full">
                  <div className="space-y-1">
                    {lyricsLines.map((line, index) => (
                      <div key={index} className="flex items-start gap-3 py-1">
                        {line.time && (
                          <span className="text-xs text-muted-foreground font-mono w-12 flex-shrink-0">
                            {line.time}
                          </span>
                        )}
                        <span className={`text-sm ${!line.time ? 'text-muted-foreground italic' : ''}`}>
                          {line.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2" />
                  <p>暂无歌词</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}