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
  Info
} from 'lucide-react';
import { ImportSearchItem } from '@/types';
import { neteaseAPI } from '@/lib/netease-api';
import { adminAPI } from '@/lib/admin-api';
import { ImportSearchCard } from '@/components/import-search-card';

export default function ImportPage() {
  const [urls, setUrls] = useState('');
  const [searchItems, setSearchItems] = useState<ImportSearchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

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

  // 开始搜索所有项目
  const startSearch = async () => {
    if (searchItems.length === 0) {
      parseUrls();
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    const totalItems = searchItems.length;
    
    for (let i = 0; i < searchItems.length; i++) {
      const item = searchItems[i];
      await searchSingleItem(item, i, totalItems);
    }

    setIsProcessing(false);
  };

  // 搜索单个项目
  const searchSingleItem = async (item: ImportSearchItem, index?: number, total?: number) => {
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
          ar: result.ar,  // 添加艺术家ID数组
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
                // 清除之前的错误和详细信息
                error: undefined,
                detailedInfo: undefined,
                existsInDb: undefined
              }
            : prevItem
        ));
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
      }
    } catch (error) {
      // 搜索出错
      setSearchItems(prev => prev.map(prevItem => 
        prevItem.id === item.id 
          ? { 
              ...prevItem, 
              status: 'error',
              error: error instanceof Error ? error.message : '搜索失败',
              searchResults: undefined,
              selectedResult: undefined,
              detailedInfo: undefined,
              existsInDb: undefined
            }
          : prevItem
      ));
    }

    // 更新进度（仅在批量搜索时）
    if (typeof index === 'number' && typeof total === 'number') {
      setProgress(((index + 1) / total) * 100);
      
      // 添加延迟避免API请求过快
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