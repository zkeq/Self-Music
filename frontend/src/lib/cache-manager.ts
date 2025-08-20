/**
 * Cache Manager - Interface for interacting with Service Worker cache
 */

export class CacheManager {
  private static instance: CacheManager;
  private serviceWorkerReady: Promise<ServiceWorkerRegistration | null>;

  constructor() {
    this.serviceWorkerReady = this.waitForServiceWorker();
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  private async waitForServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        return registration;
      } catch (error) {
        console.error('Service Worker not ready:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Preemptively cache an audio file
   */
  async cacheAudio(url: string): Promise<void> {
    try {
      const registration = await this.serviceWorkerReady;
      if (registration?.active) {
        registration.active.postMessage({
          type: 'CACHE_AUDIO',
          url: url
        });
      }
    } catch (error) {
      console.error('Failed to cache audio:', error);
    }
  }

  /**
   * Preemptively cache an image (cover art)
   */
  async cacheImage(url: string): Promise<void> {
    try {
      const registration = await this.serviceWorkerReady;
      if (registration?.active) {
        registration.active.postMessage({
          type: 'CACHE_IMAGE',
          url: url
        });
      }
    } catch (error) {
      console.error('Failed to cache image:', error);
    }
  }

  /**
   * Clear a specific cache
   */
  async clearCache(cacheName: 'static' | 'audio' | 'images' | 'api'): Promise<void> {
    try {
      const registration = await this.serviceWorkerReady;
      if (registration?.active) {
        registration.active.postMessage({
          type: 'CLEAR_CACHE',
          cacheName: cacheName
        });
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  /**
   * Clear all caches
   */
  async clearAllCaches(): Promise<void> {
    try {
      const registration = await this.serviceWorkerReady;
      if (registration?.active) {
        registration.active.postMessage({
          type: 'CLEAR_ALL_CACHES'
        });
      }
    } catch (error) {
      console.error('Failed to clear all caches:', error);
    }
  }

  /**
   * Get cache status
   */
  async getCacheStatus(): Promise<{
    static: number;
    audio: number;
    images: number;
    api: number;
  } | null> {
    try {
      const registration = await this.serviceWorkerReady;
      if (registration?.active) {
        return new Promise((resolve) => {
          const messageChannel = new MessageChannel();
          messageChannel.port1.onmessage = (event) => {
            if (event.data.type === 'CACHE_STATUS') {
              resolve({
                static: event.data.static,
                audio: event.data.audio,
                images: event.data.images,
                api: event.data.api
              });
            }
          };

          registration.active!.postMessage({
            type: 'GET_CACHE_STATUS'
          }, [messageChannel.port2]);

          // Timeout after 5 seconds
          setTimeout(() => resolve(null), 5000);
        });
      }
      return null;
    } catch (error) {
      console.error('Failed to get cache status:', error);
      return null;
    }
  }

  /**
   * Check if the app is offline
   */
  isOffline(): boolean {
    return !navigator.onLine;
  }

  /**
   * Preload essential resources for a song
   */
  async preloadSong(song: { id: string; audioUrl?: string; coverUrl?: string }): Promise<void> {
    try {
      // Cache audio if URL provided
      if (song.audioUrl) {
        await this.cacheAudio(song.audioUrl);
      } else {
        // Use default stream URL pattern
        await this.cacheAudio(`/api/songs/${song.id}/stream`);
      }

      // Cache cover image if available
      if (song.coverUrl) {
        await this.cacheImage(song.coverUrl);
      }
    } catch (error) {
      console.error('Failed to preload song:', error);
    }
  }

  /**
   * Preload essential resources for a playlist
   */
  async preloadPlaylist(songs: Array<{ id: string; audioUrl?: string; coverUrl?: string }>): Promise<void> {
    try {
      // Cache first few songs (up to 5) to enable quick offline playback
      const songsToCache = songs.slice(0, 5);
      
      for (const song of songsToCache) {
        await this.preloadSong(song);
      }
    } catch (error) {
      console.error('Failed to preload playlist:', error);
    }
  }
}

// Export singleton instance
export const cacheManager = CacheManager.getInstance();

// Hook for React components
export function useCacheManager() {
  return cacheManager;
}