"use client";

import { useState } from 'react';
import AdminLayout from '@/components/admin-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  Search, 
  Music,
  AlertCircle,
  CheckCircle,
  Loader2,
  Upload,
  Info,
  Settings
} from 'lucide-react';
import { ImportSearchItem } from '@/types';
import { neteaseAPI } from '@/lib/netease-api';
import { adminAPI } from '@/lib/admin-api';
import { ImportSearchCard } from '@/components/import-search-card';
import { ThreadPool, ThreadPoolTask } from '@/lib/thread-pool';

export default function ImportPage() {
  const [urls, setUrls] = useState('');
  const [searchItems, setSearchItems] = useState<ImportSearchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [threadCount, setThreadCount] = useState(3);
  const [showSettings, setShowSettings] = useState(false);

  // 解析URL并创建搜索项目
  const parseUrls = () => {
    const urlList = urls.split('\n').filter(url => url.trim());
    if (urlList.length === 0) {
      alert('请输入至少一个URL');
      return;
    }

      const items: ImportSearchItem[] = urlList.map((url, index) => {
      const searchTerm = neteaseAPI.extractSearchTermFromUrl(url.trim());
      return {
        id: `search-${Date.now()}-${index}`,
        url: url.trim(),
        searchTerm,
        status: 'pending',
        originalUrl: url.trim()  // 保存原始URL
      };
    });

    setSearchItems(items);
  };

  // 开始搜索所有项目 - 使用线程池并发搜索
  const startSearch = async () => {
    if (searchItems.length === 0) {
      parseUrls();
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    const totalItems = searchItems.length;
    
    // 创建线程池
    const threadPool = new ThreadPool({
      maxThreads: threadCount,
      retryCount: 2,
      retryDelay: 1000,
      onProgress: (completed, total) => {
        setProgress((completed / total) * 100);
      }
    });

    // 创建搜索任务
    const searchTasks: ThreadPoolTask<ImportSearchItem>[] = searchItems.map((item, index) => ({
      id: item.id,
      name: `搜索: ${item.searchTerm}`,
      execute: async () => {
        return await searchSingleItemConcurrent(item);
      }
    }));

    threadPool.addTasks(searchTasks);
    
    try {
      const results = await threadPool.executeAll<ImportSearchItem>();
      
      // 处理搜索结果
      const detailedTasks: ThreadPoolTask<ImportSearchItem>[] = [];
      
      for (const result of results) {
        if (result.success && result.data?.selectedResult) {
          const item = result.data; // 直接从结果中获取完整的item
          detailedTasks.push({
            id: `${item.id}-detailed`,
            name: `获取详情: ${item.selectedResult?.name || '未知歌曲'}`,
            execute: async () => {
              return await fetchDetailedInfoConcurrent(item);
            }
          });
        }
      }

      // 如果发现有搜索结果，并发获取详细信息
      if (detailedTasks.length > 0) {
        const detailedThreadPool = new ThreadPool({
          maxThreads: Math.min(threadCount, 2), // 获取详情时使用较少线程避免API限制
          retryCount: 1,
          retryDelay: 2000,
          onProgress: (completed, total) => {
            setProgress(50 + (completed / total) * 50); // 第二部分进度
          }
        });

        detailedThreadPool.addTasks(detailedTasks);
        await detailedThreadPool.executeAll<ImportSearchItem>();
      }

    } catch (error) {
      console.error('搜索过程出错:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // 搜索单个项目（用于并发执行）
  const searchSingleItemConcurrent = async (item: ImportSearchItem): Promise<ImportSearchItem> => {
    // 更新当前项目状态为搜索中
    setSearchItems(prev => prev.map(prevItem => 
      prevItem.id === item.id 
        ? { ...prevItem, status: 'searching' }
        : prevItem
    ));

    try {
      // 搜索歌曲
      const searchResponse = await neteaseAPI.searchSongs(item.searchTerm);
      
      if (searchResponse.list && searchResponse.list.length > 0) {
        // 转换搜索结果
        const searchResults = searchResponse.list.map(result => ({
          songId: result.songId,
          name: result.name,
          ar: result.ar,
          arName: result.arName,
          albumName: result.albumName,
          albumId: result.albumId,
          interval: result.interval,
          img: result.img,
          duration: neteaseAPI.parseDuration(result.interval)
        }));

        // 更新搜索结果
        setSearchItems(prev => prev.map(prevItem => 
          prevItem.id === item.id 
            ? { 
                ...prevItem, 
                status: 'found',
                searchResults,
                selectedResult: searchResults[0], // 默认选择第一个结果
                error: undefined,
                detailedInfo: undefined,
                existsInDb: undefined
              }
            : prevItem
        ));

        return { 
          ...item, 
          searchResults, 
          selectedResult: searchResults[0],
          status: 'found' as const
        };
      } else {
        // 没有找到结果
        setSearchItems(prev => prev.map(prevItem => 
          prevItem.id === item.id 
            ? { 
                ...prevItem, 
                status: 'error',
                error: '未找到匹配的歌曲',
                searchResults: undefined,
                selectedResult: undefined,
                detailedInfo: undefined,
                existsInDb: undefined
              }
            : prevItem
        ));

        return { ...item, status: 'error' as const, error: '未找到匹配的歌曲' };
      }
    } catch (error) {
      // 搜索出错
      const errorMessage = error instanceof Error ? error.message : '搜索失败';
      setSearchItems(prev => prev.map(prevItem => 
        prevItem.id === item.id 
          ? { 
              ...prevItem, 
              status: 'error',
              error: errorMessage,
              searchResults: undefined,
              selectedResult: undefined,
              detailedInfo: undefined,
              existsInDb: undefined
            }
          : prevItem
      ));

      return { ...item, status: 'error' as const, error: errorMessage };
    }
  };

  // 获取详细信息（用于并发执行）
  const fetchDetailedInfoConcurrent = async (item: ImportSearchItem): Promise<ImportSearchItem> => {
    if (!item.selectedResult) return item;

    try {
      const result = item.selectedResult;
      
      // 获取专辑信息、歌词和艺术家信息
      const [albumInfo, lyrics, ...artistsInfo] = await Promise.all([
        neteaseAPI.getAlbumInfo(result.albumId),
        neteaseAPI.getLyrics(result.songId),
        ...result.ar.map(async (artistId, index) => {
          try {
            const artistInfo = await neteaseAPI.getArtistInfo(artistId);
            return {
              id: artistInfo.artist_id,
              name: artistInfo.name,
              avatarUrl: artistInfo.avatar_url,
              intro: artistInfo.intro,
              fanCount: String(artistInfo.fan_count || '0')
            };
          } catch (error) {
            return {
              id: `artist-${result.songId}-${index}`,
              name: result.arName[index] || 'Unknown',
              avatarUrl: undefined,
              intro: undefined,
              fanCount: '0'
            };
          }
        })
      ]);

      const detailedInfo = {
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
      setSearchItems(prev => prev.map(prevItem => 
        prevItem.id === item.id 
          ? { 
              ...prevItem, 
              status: 'detailed' as const,
              detailedInfo
            }
          : prevItem
      ));

      return { ...item, detailedInfo, status: 'detailed' as const };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取详细信息失败';
      setSearchItems(prev => prev.map(prevItem => 
        prevItem.id === item.id 
          ? { 
              ...prevItem, 
              status: 'error' as const,
              error: errorMessage
            }
          : prevItem
      ));

      return { ...item, status: 'error' as const, error: errorMessage };
    }
  };

  // 保持旧的搜索函数用于单个项目重新搜索
  const searchSingleItem = async (item: ImportSearchItem, index?: number, total?: number) => {
    // 更新当前项目状态为搜索中
    setSearchItems(prev => prev.map(prevItem => 
      prevItem.id === item.id 
        ? { ...prevItem, status: 'searching' }
        : prevItem
    ));

    try {
      const searchResponse = await neteaseAPI.searchSongs(item.searchTerm);
      
      if (searchResponse.list && searchResponse.list.length > 0) {
        const searchResults = searchResponse.list.map(result => ({
          songId: result.songId,
          name: result.name,
          ar: result.ar,
          arName: result.arName,
          albumName: result.albumName,
          albumId: result.albumId,
          interval: result.interval,
          img: result.img,
          duration: neteaseAPI.parseDuration(result.interval)
        }));

        setSearchItems(prev => prev.map(prevItem => 
          prevItem.id === item.id 
            ? { 
                ...prevItem, 
                status: 'found',
                searchResults,
                selectedResult: searchResults[0],
                error: undefined,
                detailedInfo: undefined,
                existsInDb: undefined
              }
            : prevItem
        ));
      } else {
        setSearchItems(prev => prev.map(prevItem => 
          prevItem.id === item.id 
            ? { 
                ...prevItem, 
                status: 'error',
                error: '未找到匹配的歌曲',
                searchResults: undefined,
                selectedResult: undefined,
                detailedInfo: undefined,
                existsInDb: undefined
              }
            : prevItem
        ));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '搜索失败';
      setSearchItems(prev => prev.map(prevItem => 
        prevItem.id === item.id 
          ? { 
              ...prevItem, 
              status: 'error',
              error: errorMessage,
              searchResults: undefined,
              selectedResult: undefined,
              detailedInfo: undefined,
              existsInDb: undefined
            }
          : prevItem
      ));
    }

    if (typeof index === 'number' && typeof total === 'number') {
      setProgress(((index + 1) / total) * 100);
      
      if (index < total - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  };

  // 处理单个项目的重新搜索
  const handleResearchItem = async (item: ImportSearchItem, newSearchTerm: string) => {
    const updatedItem = {
      ...item,
      searchTerm: newSearchTerm,
      status: 'pending' as const
    };
    
    // 先更新搜索词
    setSearchItems(prev => prev.map(prevItem => 
      prevItem.id === item.id ? updatedItem : prevItem
    ));
    
    // 然后搜索
    await searchSingleItem(updatedItem);
  };

  // 重置所有数据
  const resetAll = () => {
    setUrls('');
    setSearchItems([]);
    setProgress(0);
    setIsProcessing(false);
    setIsImporting(false);
    setImportProgress(0);
  };

  // 批量导入准备好的歌曲
  const batchImport = async () => {
    const readyItems = searchItems.filter(item => 
      item.status === 'detailed' && 
      item.detailedInfo && 
      item.selectedResult
    );

    if (readyItems.length === 0) {
      alert('没有准备好的歌曲可以导入');
      return;
    }

    if (!confirm(`确定要导入 ${readyItems.length} 首歌曲吗？`)) {
      return;
    }

    setIsImporting(true);
    setImportProgress(0);

    try {
      // 构建导入请求
      const importItems = readyItems.map(item => ({
        songInfo: {
          songId: item.selectedResult!.songId,
          name: item.selectedResult!.name,
          ar: item.selectedResult!.ar,  // 添加艺术家ID数组
          arName: item.selectedResult!.arName,
          albumName: item.selectedResult!.albumName,
          albumId: item.selectedResult!.albumId,
          interval: item.selectedResult!.interval,
          img: item.selectedResult!.img,
          duration: item.selectedResult!.duration
        },
        albumInfo: {
          id: item.detailedInfo!.album.id,
          title: item.detailedInfo!.album.title,
          artist: item.detailedInfo!.album.artist,
          coverUrl: item.detailedInfo!.album.coverUrl,
          releaseDate: item.detailedInfo!.album.releaseDate,
          company: item.detailedInfo!.album.company,
          description: item.detailedInfo!.album.description
        },
        artistsInfo: item.detailedInfo!.artists.map(artist => ({
          id: artist.id,
          name: artist.name,
          avatarUrl: artist.avatarUrl,
          intro: artist.intro,
          fanCount: artist.fanCount
        })),
        lyrics: item.detailedInfo!.lyrics,
        audioUrl: item.originalUrl || item.url,  // 使用原始URL作为音频URL
        skipIfExists: true
      }));

      // 调用批量导入API
      const response = await adminAPI.batchImport({ items: importItems });

      if (response.success) {
        // 更新导入状态
        const updatedItems = searchItems.map(item => {
          const result = response.details?.find(detail => 
            detail.songId === item.selectedResult?.songId
          );
          
          if (result) {
            return {
              ...item,
              status: result.status === 'imported' ? 'imported' as const : 
                      result.status === 'skipped' ? 'imported' as const : 'error' as const,
              error: result.reason
            };
          }
          return item;
        });

        setSearchItems(updatedItems);

        // 显示导入结果
        alert(`导入完成！
导入成功: ${response.imported} 首
跳过重复: ${response.skipped} 首
错误: ${response.errors?.length || 0} 个
${response.errors?.length ? '\n错误详情:\n' + response.errors.join('\n') : ''}`);
      }

    } catch (error) {
      console.error('批量导入失败:', error);
      alert('批量导入失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  // 计算统计信息
  const stats = {
    total: searchItems.length,
    pending: searchItems.filter(item => item.status === 'pending').length,
    searching: searchItems.filter(item => item.status === 'searching').length,
    found: searchItems.filter(item => item.status === 'found').length,
    detailed: searchItems.filter(item => item.status === 'detailed').length,
    ready: searchItems.filter(item => item.status === 'ready').length,
    imported: searchItems.filter(item => item.status === 'imported').length,
    errors: searchItems.filter(item => item.status === 'error').length
  };

  const readyToImport = searchItems.filter(item => 
    item.status === 'detailed' && 
    item.detailedInfo && 
    item.selectedResult
  ).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">一键导入</h1>
            <p className="text-muted-foreground">从网易云音乐批量导入歌曲信息</p>
          </div>
          
          <div className="flex gap-2">
            {readyToImport > 0 && (
              <Button 
                onClick={batchImport}
                disabled={isImporting || isProcessing}
                className="flex items-center gap-2"
              >
                {isImporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                批量导入 ({readyToImport})
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => setShowSettings(!showSettings)}
              disabled={isProcessing || isImporting}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              设置
            </Button>
            <Button 
              variant="outline" 
              onClick={resetAll}
              disabled={isProcessing || isImporting}
            >
              重置
            </Button>
          </div>
        </div>

        {/* URL输入区域 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              URL输入
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Textarea
                  placeholder="请输入URL地址，每行一个&#10;例如：&#10;https://example.com/song/唯一&#10;https://example.com/song/告白气球"
                  value={urls}
                  onChange={(e) => setUrls(e.target.value)}
                  rows={6}
                  disabled={isProcessing || isImporting}
                />
              </div>
              
              {/* 设置面板 */}
              {showSettings && (
                <div className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-medium">搜索设置</h4>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">并发线程数</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={threadCount}
                        onChange={(e) => setThreadCount(parseInt(e.target.value))}
                        className="flex-1"
                        disabled={isProcessing || isImporting}
                      />
                      <span className="text-sm font-medium w-8 text-center">{threadCount}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      较高的线程数可以加快搜索速度，但可能触发API限制
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {urls.split('\n').filter(url => url.trim()).length} 个URL
                </div>
                
                <Button
                  onClick={startSearch}
                  disabled={isProcessing || isImporting || !urls.trim()}
                  className="flex items-center gap-2"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  {searchItems.length > 0 ? '重新搜索' : '开始搜索'}
                </Button>
              </div>

              {/* 进度条 */}
              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>搜索进度</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 统计信息 */}
        {searchItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                搜索统计
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-sm text-muted-foreground">总计</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-500">{stats.pending}</div>
                  <div className="text-sm text-muted-foreground">待处理</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">{stats.searching}</div>
                  <div className="text-sm text-muted-foreground">搜索中</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">{stats.found}</div>
                  <div className="text-sm text-muted-foreground">已找到</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-500">{stats.detailed}</div>
                  <div className="text-sm text-muted-foreground">已详情</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500">{stats.ready}</div>
                  <div className="text-sm text-muted-foreground">待导入</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-500">{stats.imported}</div>
                  <div className="text-sm text-muted-foreground">已导入</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">{stats.errors}</div>
                  <div className="text-sm text-muted-foreground">错误</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 搜索结果列表 */}
        {searchItems.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">搜索结果</h2>
              <Badge variant="secondary">{searchItems.length} 项</Badge>
            </div>
            
            <div className="space-y-4">
              {searchItems.map((item) => (
                <ImportSearchCard
                  key={item.id}
                  item={item}
                  onUpdate={(updatedItem) => {
                    setSearchItems(prev => prev.map(prevItem => 
                      prevItem.id === updatedItem.id ? updatedItem : prevItem
                    ));
                  }}
                  onResearch={handleResearchItem}
                />
              ))}
            </div>
          </div>
        )}

        {/* 空状态 */}
        {searchItems.length === 0 && !isProcessing && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Music className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">开始导入音乐</h3>
              <p className="text-muted-foreground text-center mb-4">
                在上方输入框中粘贴URL地址，系统将自动搜索并导入音乐信息
              </p>
              <div className="text-sm text-muted-foreground">
                <p>• 支持批量导入，每行一个URL</p>
                <p>• 自动提取搜索关键词</p>
                <p>• 智能匹配歌曲信息</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}