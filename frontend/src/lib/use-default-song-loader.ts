import { useEffect } from 'react';
import { usePlayerStore } from '@/lib/store';

export function useDefaultSongLoader() {
  const { currentSong, initializePlaylist } = usePlayerStore();

  useEffect(() => {
    // 如果没有当前歌曲，自动初始化播放列表
    if (!currentSong) {
      console.log('Initializing playlist...');
      initializePlaylist();
    }
  }, [currentSong, initializePlaylist]);
}