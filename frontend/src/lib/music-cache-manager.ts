/**
 * 音乐缓存管理工具
 * 提供缓存统计、清理等功能
 */

export interface CacheStats {
  musicCacheSize: number;
  cacheEntries: string[];
}

export class MusicCacheManager {
  /**
   * 获取缓存统计信息
   */
  static async getCacheStats(): Promise<CacheStats> {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker 不受支持');
    }

    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data);
        }
      };

      const serviceWorker = navigator.serviceWorker.controller;
      if (serviceWorker) {
        serviceWorker.postMessage(
          { type: 'GET_CACHE_STATS' },
          [messageChannel.port2]
        );
      } else {
        reject(new Error('Service Worker 未激活'));
      }
    });
  }

  /**
   * 清理音乐缓存
   */
  static async clearMusicCache(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker 不受支持');
    }

    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.success) {
          resolve(true);
        } else {
          reject(new Error('清理缓存失败'));
        }
      };

      const serviceWorker = navigator.serviceWorker.controller;
      if (serviceWorker) {
        serviceWorker.postMessage(
          { type: 'CLEAR_MUSIC_CACHE' },
          [messageChannel.port2]
        );
      } else {
        reject(new Error('Service Worker 未激活'));
      }
    });
  }

  /**
   * 格式化缓存大小显示
   */
  static formatCacheSize(size: number): string {
    if (size === 0) return '0 首';
    if (size === 1) return '1 首歌曲';
    return `${size} 首歌曲`;
  }

  /**
   * 检查特定音乐文件是否已缓存
   */
  static async isMusicCached(musicUrl: string): Promise<boolean> {
    try {
      const stats = await this.getCacheStats();
      return stats.cacheEntries.some(entry => entry.includes(musicUrl));
    } catch (error) {
      console.error('检查缓存状态失败:', error);
      return false;
    }
  }

  /**
   * 预缓存音乐文件
   * 通过发起请求让 Service Worker 缓存文件
   */
  static async preloadMusic(musicUrl: string): Promise<boolean> {
    try {
      const response = await fetch(musicUrl);
      return response.ok;
    } catch (error) {
      console.error('预加载音乐失败:', error);
      return false;
    }
  }
}

/**
 * React Hook 用于管理音乐缓存
 */
import { useState, useEffect } from 'react';

export function useMusicCache() {
  const [cacheStats, setCacheStats] = useState<CacheStats>({
    musicCacheSize: 0,
    cacheEntries: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCacheStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const stats = await MusicCacheManager.getCacheStats();
      setCacheStats(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取缓存统计失败');
    } finally {
      setIsLoading(false);
    }
  };

  const clearCache = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await MusicCacheManager.clearMusicCache();
      await refreshCacheStats(); // 清理后刷新统计
    } catch (err) {
      setError(err instanceof Error ? err.message : '清理缓存失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 延迟加载缓存统计，给 Service Worker 时间初始化
    const timer = setTimeout(() => {
      refreshCacheStats();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return {
    cacheStats,
    isLoading,
    error,
    refreshCacheStats,
    clearCache
  };
}