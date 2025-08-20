'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cacheManager } from '@/lib/cache-manager';

export default function OfflinePage() {
  const [cacheStatus, setCacheStatus] = useState<{
    static: number;
    audio: number;
    images: number;
    api: number;
  } | null>(null);

  useEffect(() => {
    // Load cache status
    cacheManager.getCacheStatus().then(status => {
      setCacheStatus(status);
    });
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  const handleClearCache = async () => {
    if (confirm('确定要清除所有缓存吗？这将删除所有离线内容。')) {
      await cacheManager.clearAllCaches();
      setCacheStatus({ static: 0, audio: 0, images: 0, api: 0 });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center p-8 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 max-w-md mx-4">
        <div className="mb-6">
          <svg
            className="w-16 h-16 mx-auto text-white/70"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-4">
          网络连接断开
        </h1>
        
        <p className="text-white/80 mb-6">
          当前无法连接到网络，请检查您的网络连接。您可以继续播放已缓存的音乐。
        </p>
        
        <div className="space-y-3 mb-6">
          <Button
            onClick={handleRetry}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            重试连接
          </Button>
          
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="w-full border-white/30 text-white hover:bg-white/10"
          >
            返回首页
          </Button>
        </div>

        {cacheStatus && (
          <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-white font-medium mb-3">缓存状态</h3>
            <div className="space-y-2 text-sm text-white/70">
              <div className="flex justify-between">
                <span>音频文件:</span>
                <span>{cacheStatus.audio} 个</span>
              </div>
              <div className="flex justify-between">
                <span>封面图片:</span>
                <span>{cacheStatus.images} 个</span>
              </div>
              <div className="flex justify-between">
                <span>静态文件:</span>
                <span>{cacheStatus.static} 个</span>
              </div>
              <div className="flex justify-between">
                <span>API 缓存:</span>
                <span>{cacheStatus.api} 个</span>
              </div>
            </div>
            
            <Button
              onClick={handleClearCache}
              variant="outline"
              size="sm"
              className="mt-3 w-full border-red-400/30 text-red-300 hover:bg-red-400/10"
            >
              清除缓存
            </Button>
          </div>
        )}
        
        <div className="text-sm text-white/60">
          <p className="mb-2">离线模式下可用功能：</p>
          <ul className="space-y-1 text-left">
            <li>• 播放已缓存的音乐</li>
            <li>• 浏览已加载的内容</li>
            <li>• 使用播放列表</li>
            <li>• 查看歌词（如已缓存）</li>
          </ul>
        </div>
      </div>
    </div>
  );
}