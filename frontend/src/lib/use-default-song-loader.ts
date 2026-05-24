import { useEffect } from 'react';
import { usePlayerStore } from '@/lib/store';

export function useDefaultSongLoader(enabled = true) {
  const { currentSong, initializePlaylist } = usePlayerStore();

  useEffect(() => {
    if (!enabled) return;
    // 如果没有当前歌曲，自动初始化播放列表
    if (!currentSong) {
      console.log('Initializing playlist...');
      initializePlaylist();
    }
  }, [enabled, currentSong, initializePlaylist]);
}
