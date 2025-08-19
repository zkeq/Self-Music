"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Music, 
  User, 
  Album as AlbumIcon, 
  Clock, 
  Search, 
  ChevronDown, 
  ChevronUp,
  Info,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download,
  Eye,
  Database,
  Edit,
  Save,
  X,
  RotateCcw
} from 'lucide-react';
import { ImportSearchItem, ImportSongResult, ImportDetailedInfo, ImportArtistInfo } from '@/types';
import { neteaseAPI, NeteaseAlbumInfo, NeteaseLyricsResponse } from '@/lib/netease-api';
import { adminAPI } from '@/lib/admin-api';
import { MusicInfoDisplay } from '@/components/music-info-display';

interface ImportSearchCardProps {
  item: ImportSearchItem;
  onUpdate: (updatedItem: ImportSearchItem) => void;
  onResearch?: (item: ImportSearchItem, newSearchTerm: string) => void;
}

export function ImportSearchCard({ item, onUpdate, onResearch }: ImportSearchCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isEditingSearchTerm, setIsEditingSearchTerm] = useState(false);
  const [editedSearchTerm, setEditedSearchTerm] = useState(item.searchTerm);
  const [isResearching, setIsResearching] = useState(false);

  // 获取状态显示信息
  const getStatusInfo = () => {
    switch (item.status) {
      case 'pending':
        return { 
          color: 'bg-gray-100 text-gray-700', 
          icon: Clock, 
          text: '待处理' 
        };
      case 'searching':
        return { 
          color: 'bg-blue-100 text-blue-700', 
          icon: Loader2, 
          text: '搜索中' 
        };
      case 'found':
        return { 
          color: 'bg-green-100 text-green-700', 
          icon: Search, 
          text: '已找到' 
        };
      case 'detailed':
        return { 
          color: 'bg-purple-100 text-purple-700', 
          icon: Info, 
          text: '已获取详情' 
        };
      case 'ready':
        return { 
          color: 'bg-orange-100 text-orange-700', 
          icon: CheckCircle, 
          text: '准备导入' 
        };
      case 'importing':
        return { 
          color: 'bg-blue-100 text-blue-700', 
          icon: Download, 
          text: '导入中' 
        };
      case 'imported':
        return { 
          color: 'bg-green-100 text-green-700', 
          icon: CheckCircle, 
          text: '已导入' 
        };
      case 'error':
        return { 
          color: 'bg-red-100 text-red-700', 
          icon: AlertCircle, 
          text: '错误' 
        };
      default:
        return { 
          color: 'bg-gray-100 text-gray-700', 
          icon: Clock, 
          text: '未知' 
        };
    }
  };

  // 保存编辑的搜索词
  const handleSaveSearchTerm = () => {
    if (editedSearchTerm.trim() && editedSearchTerm !== item.searchTerm) {
      onUpdate({
        ...item,
        searchTerm: editedSearchTerm.trim()
      });
    }
    setIsEditingSearchTerm(false);
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditedSearchTerm(item.searchTerm);
    setIsEditingSearchTerm(false);
  };

  // 重新搜索
  const handleResearch = async () => {
    if (!onResearch) return;
    
    setIsResearching(true);
    try {
      await onResearch(item, editedSearchTerm.trim() || item.searchTerm);
    } finally {
      setIsResearching(false);
    }
  };

  // 重置搜索状态
  const handleResetSearch = () => {
    onUpdate({
      ...item,
      status: 'pending',
      searchResults: undefined,
      selectedResult: undefined,
      detailedInfo: undefined,
      error: undefined,
      existsInDb: undefined
    });
  };

  // 选择搜索结果
  const handleResultSelect = (result: ImportSongResult) => {
    onUpdate({
      ...item,
      selectedResult: result
    });
  };

  // 获取详细信息
  const fetchDetailedInfo = async () => {
    if (!item.selectedResult) return;

    setLoadingDetails(true);
    
    try {
      // 更新状态为获取详情中
      onUpdate({
        ...item,
        status: 'searching'
      });

      const result = item.selectedResult;
      
      console.log('搜索结果:', result);
      console.log('艺术家ID数组:', result.ar);
      console.log('艺术家名称数组:', result.arName);
      
      // 准备所有需要并行执行的请求
      const requests = [
        neteaseAPI.getAlbumInfo(result.albumId),
        neteaseAPI.getLyrics(result.songId),
        // 为每个艺术家创建获取详细信息的请求
        ...result.arName.map(async (artistName, index) => {
          try {
            const artistId = result.ar[index];
            console.log(`正在获取艺术家 ${artistName} (ID: ${artistId}) 的详细信息`);
            
            if (artistId) {
              const artistInfo = await neteaseAPI.getArtistInfo(artistId);
              console.log(`艺术家 ${artistName} 详细信息:`, artistInfo);
              return {
                id: artistInfo.artist_id,
                name: artistInfo.name,
                avatarUrl: artistInfo.avatar_url,
                intro: artistInfo.intro,
                fanCount: String(artistInfo.fan_count || '0')
              };
            } else {
              console.warn(`艺术家 ${artistName} 没有找到ID`);
              return {
                id: `artist-${result.songId}-${index}`,
                name: artistName,
                avatarUrl: undefined,
                intro: undefined,
                fanCount: '0'
              };
            }
          } catch (error) {
            console.warn(`获取艺术家 ${artistName} 详细信息失败:`, error);
            return {
              id: `artist-${result.songId}-${index}`,
              name: artistName,
              avatarUrl: undefined,
              intro: undefined,
              fanCount: '0'
            };
          }
        })
      ];
      
      // 并行执行所有请求
      const results = await Promise.all(requests);
      
      // 解构结果
      const albumInfo = results[0] as NeteaseAlbumInfo;
      const lyrics = results[1] as NeteaseLyricsResponse;
      const artistsInfo = results.slice(2) as ImportArtistInfo[]; // 艺术家信息从第3个元素开始

      const detailedInfo: ImportDetailedInfo = {
        song: result,
        album: {
          id: result.albumId,
          title: albumInfo.title,
          artist: albumInfo.artist,
          coverUrl: albumInfo.cover_url,
          releaseDate: albumInfo.release_time,
          company: albumInfo.company,
          description: albumInfo.description
        },
        artists: artistsInfo,
        lyrics: lyrics.lyric || ''
      };

      // 更新详细信息
      onUpdate({
        ...item,
        status: 'detailed',
        detailedInfo
      });

    } catch (error) {
      onUpdate({
        ...item,
        status: 'error',
        error: error instanceof Error ? error.message : '获取详细信息失败'
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  // 检查数据库中是否已存在
  const checkExists = async () => {
    if (!item.selectedResult) return;

    try {
      const result = item.selectedResult;
      const response = await adminAPI.checkSongExists(
        result.name,
        result.arName[0] || '',
        result.albumName
      );

      if (response.success) {
        onUpdate({
          ...item,
          existsInDb: response.exists || false
        });
      }
    } catch (error) {
      console.error('检查数据库失败:', error);
      onUpdate({
        ...item,
        error: '检查数据库失败'
      });
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center gap-2">
              <StatusIcon 
                className={`h-4 w-4 ${item.status === 'searching' || isResearching ? 'animate-spin' : ''}`} 
              />
              <Badge className={statusInfo.color}>
                {statusInfo.text}
              </Badge>
            </div>
            <div className="flex-1">
              {isEditingSearchTerm ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editedSearchTerm}
                    onChange={(e) => setEditedSearchTerm(e.target.value)}
                    placeholder="输入搜索词"
                    className="h-8 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveSearchTerm();
                      } else if (e.key === 'Escape') {
                        handleCancelEdit();
                      }
                    }}
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleSaveSearchTerm}
                    className="h-8 px-2"
                  >
                    <Save className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelEdit}
                    className="h-8 px-2"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-medium">
                      搜索词: {item.searchTerm}
                    </CardTitle>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditingSearchTerm(true)}
                      className="h-6 px-1 text-muted-foreground hover:text-foreground"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                    {item.url}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* 重新搜索按钮 */}
            {onResearch && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleResearch}
                disabled={isResearching || item.status === 'searching'}
                className="h-8"
              >
                {isResearching ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Search className="h-3 w-3" />
                )}
                <span className="ml-1 hidden sm:inline">搜索</span>
              </Button>
            )}
            
            {/* 重置按钮 */}
            {(item.searchResults || item.error) && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleResetSearch}
                className="h-8"
              >
                <RotateCcw className="h-3 w-3" />
                <span className="ml-1 hidden sm:inline">重置</span>
              </Button>
            )}
            
            {item.searchResults && item.searchResults.length > 0 && (
              <Badge variant="secondary">
                {item.searchResults.length} 个结果
              </Badge>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0">
          {/* 错误信息 */}
          {item.status === 'error' && item.error && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{item.error}</AlertDescription>
            </Alert>
          )}

          {/* 搜索结果选择 */}
          {item.searchResults && item.searchResults.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">选择歌曲</h4>
                {item.selectedResult && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={checkExists}
                      disabled={loadingDetails}
                    >
                      <Database className="h-3 w-3 mr-1" />
                      检查重复
                    </Button>
                    <Button
                      size="sm"
                      onClick={fetchDetailedInfo}
                      disabled={loadingDetails}
                    >
                      {loadingDetails ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <Eye className="h-3 w-3 mr-1" />
                      )}
                      获取详情
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {item.searchResults.map((result, index) => (
                  <div
                    key={result.songId}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      item.selectedResult?.songId === result.songId
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => handleResultSelect(result)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        {result.img ? (
                          <img 
                            src={result.img} 
                            alt={result.name}
                            className="w-full h-full rounded-lg object-cover"
                          />
                        ) : (
                          <Music className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium truncate">{result.name}</h5>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {result.arName.join(', ')}
                          </span>
                          <span className="flex items-center gap-1">
                            <AlbumIcon className="h-3 w-3" />
                            {result.albumName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {result.interval}
                          </span>
                        </div>
                      </div>
                      
                      {item.selectedResult?.songId === result.songId && (
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 详细信息显示 */}
          {item.detailedInfo && (
            <div className="mt-4">
              <MusicInfoDisplay detailedInfo={item.detailedInfo} />
            </div>
          )}

          {/* 数据库状态显示 */}
          {item.existsInDb !== undefined && (
            <div className="mt-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {item.existsInDb 
                    ? '该歌曲已存在于数据库中，导入时将跳过'
                    : '该歌曲不存在于数据库中，可以导入'
                  }
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}