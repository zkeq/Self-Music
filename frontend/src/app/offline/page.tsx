'use client';

import { useEffect, useState } from 'react';
import { WifiOff, RotateCcw, Home, Music, Image, Database, FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cacheManager } from '@/lib/cache-manager';

export default function OfflinePage() {
  const [cacheStatus, setCacheStatus] = useState<{
    static: number;
    audio: number;
    images: number;
    api: number;
  } | null>(null);

  useEffect(() => {
    if (cacheManager) {
      cacheManager.getCacheStatus().then(status => {
        setCacheStatus(status);
      });
    }
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  const handleClearCache = async () => {
    if (cacheManager && confirm('确定要清除所有缓存吗？这将删除所有离线内容。')) {
      await cacheManager.clearAllCaches();
      setCacheStatus({ static: 0, audio: 0, images: 0, api: 0 });
    }
  };

  const cacheItems = [
    { icon: Music, label: '音频文件', count: cacheStatus?.audio || 0, variant: 'default' as const },
    { icon: Image, label: '封面图片', count: cacheStatus?.images || 0, variant: 'secondary' as const },
    { icon: FileText, label: '静态文件', count: cacheStatus?.static || 0, variant: 'outline' as const },
    { icon: Database, label: 'API 缓存', count: cacheStatus?.api || 0, variant: 'secondary' as const },
  ];

  const offlineFeatures = [
    '播放已缓存的音乐',
    '浏览已加载的内容',
    '使用播放列表',
    '查看歌词（如已缓存）'
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground">
      <div className="w-full max-w-md space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full bg-red-500/20 w-fit">
              <WifiOff className="h-8 w-8 text-red-400" />
            </div>
            <CardTitle className="text-2xl">网络连接断开</CardTitle>
            <CardDescription>
              当前无法连接到网络，请检查您的网络连接。您可以继续播放已缓存的音乐。
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <Button
                onClick={handleRetry}
                className="w-full"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                重试连接
              </Button>
              
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="w-full"
              >
                <Home className="mr-2 h-4 w-4" />
                返回首页
              </Button>
            </div>
          </CardContent>
        </Card>

        {cacheStatus && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">缓存状态</CardTitle>
              <CardDescription>
                已缓存的离线内容概览
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {cacheItems.map(({ icon: Icon, label, count, variant }) => (
                  <div key={label} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{label}</span>
                    </div>
                    <Badge variant={variant}>
                      {count}
                    </Badge>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <Button
                onClick={handleClearCache}
                variant="destructive"
                size="sm"
                className="w-full"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                清除缓存
              </Button>
            </CardContent>
          </Card>
        )}

        <Alert>
          <Music className="h-4 w-4" />
          <AlertTitle>离线模式</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-1">
              {offlineFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-1 h-1 bg-primary rounded-full" />
                  {feature}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}