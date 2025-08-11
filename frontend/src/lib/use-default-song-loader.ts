import { useEffect } from 'react';
import { usePlayerStore } from '@/lib/store';

export function useDefaultSongLoader() {
  const { currentSong, loadDefaultSong } = usePlayerStore();

  useEffect(() => {
    // 如果没有当前歌曲，自动加载默认歌曲
    if (!currentSong) {
      console.log('Loading default song...');
      loadDefaultSong();
    }
  }, [currentSong, loadDefaultSong]);
}