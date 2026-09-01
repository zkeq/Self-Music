import { useEffect } from 'react';
import { usePlayerStore } from '@/lib/store';

export function useDefaultSongLoader(skip = false) {
  const { currentSong, initializePlaylist } = usePlayerStore();

  useEffect(() => {
    // 如果通过 URL 参数指定了播放内容，跳过默认播放列表的初始化
    if (skip) return;
    // 如果没有当前歌曲，自动初始化播放列表
    if (!currentSong) {
      console.log('Initializing playlist...');
      initializePlaylist();
    }
  }, [currentSong, initializePlaylist, skip]);
}
