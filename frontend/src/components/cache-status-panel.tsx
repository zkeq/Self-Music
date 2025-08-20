'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Trash2, 
  RefreshCw, 
  HardDrive,
  Music,
  Image,
  FileText,
  Wifi,
  WifiOff
} from 'lucide-react';
import { cacheManager } from '@/lib/cache-manager';

interface CacheStatus {
  static: number;
  audio: number;
  images: number;
  api: number;
}

export function CacheStatusPanel() {
  const [cacheStatus, setCacheStatus] = useState<CacheStatus | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCacheStatus();
    
    // Monitor online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadCacheStatus = async () => {
    setLoading(true);
    try {
      const status = await cacheManager.getCacheStatus();
      setCacheStatus(status);
    } catch (error) {
      console.error('Failed to load cache status:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearSpecificCache = async (cacheType: keyof CacheStatus) => {
    if (confirm(`确定要清除${getCacheTypeName(cacheType)}缓存吗？`)) {
      setLoading(true);
      try {
        await cacheManager.clearCache(cacheType);
        await loadCacheStatus();
      } catch (error) {
        console.error('Failed to clear cache:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const clearAllCaches = async () => {
    if (confirm('确定要清除所有缓存吗？这将删除所有离线内容。')) {
      setLoading(true);
      try {
        await cacheManager.clearAllCaches();
        await loadCacheStatus();
      } catch (error) {
        console.error('Failed to clear all caches:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const getCacheTypeName = (type: keyof CacheStatus) => {
    const names = {
      static: '静态文件',
      audio: '音频文件',
      images: '图片',
      api: 'API'
    };
    return names[type];
  };

  const getCacheIcon = (type: keyof CacheStatus) => {
    const icons = {
      static: FileText,
      audio: Music,
      images: Image,
      api: Database
    };
    const IconComponent = icons[type];
    return <IconComponent className="w-4 h-4" />;
  };

  const formatFileSize = (count: number, type: keyof CacheStatus) => {
    // Rough estimation based on file types
    const avgSizes = {
      static: 50, // KB
      audio: 5000, // KB (5MB average)
      images: 200, // KB 
      api: 2 // KB
    };
    
    const totalKB = count * avgSizes[type];
    if (totalKB < 1024) return `${totalKB} KB`;
    return `${(totalKB / 1024).toFixed(1)} MB`;
  };

  if (loading && !cacheStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            缓存管理
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span className="ml-2">加载缓存状态...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            缓存管理
          </div>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Wifi className="w-3 h-3" />
                在线
              </Badge>
            ) : (
              <Badge variant="destructive" className="flex items-center gap-1">
                <WifiOff className="w-3 h-3" />
                离线
              </Badge>
            )}
            <Button 
              onClick={loadCacheStatus} 
              variant="outline" 
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {cacheStatus ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.keys(cacheStatus) as Array<keyof CacheStatus>).map((cacheType) => (
                <div 
                  key={cacheType}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getCacheIcon(cacheType)}
                    <div>
                      <p className="font-medium">{getCacheTypeName(cacheType)}</p>
                      <p className="text-sm text-muted-foreground">
                        {cacheStatus[cacheType]} 项 • {formatFileSize(cacheStatus[cacheType], cacheType)}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => clearSpecificCache(cacheType)}
                    variant="outline"
                    size="sm"
                    disabled={loading || cacheStatus[cacheType] === 0}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">总缓存</p>
                  <p className="text-sm text-muted-foreground">
                    共 {Object.values(cacheStatus).reduce((a, b) => a + b, 0)} 项缓存文件
                  </p>
                </div>
                <Button
                  onClick={clearAllCaches}
                  variant="destructive"
                  disabled={loading || Object.values(cacheStatus).every(count => count === 0)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  清除所有缓存
                </Button>
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>• 音频和图片缓存将保留 2 个月</p>
              <p>• 静态文件缓存将保留 6 小时</p>
              <p>• API 缓存将保留 5 分钟</p>
              <p>• 离线模式下可继续播放已缓存的内容</p>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>无法获取缓存状态</p>
            <p className="text-sm">请确保Service Worker已正确加载</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}