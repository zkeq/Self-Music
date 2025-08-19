import { Song } from '@/types';
import { api } from './api';

export interface PlaylistState {
  songs: Song[];
  currentIndex: number;
  currentSongId: string | null;
  createdAt: string;
  lastUpdated: string;
}

const PLAYLIST_STORAGE_KEY = 'self-music-current-playlist';
const PLAYLIST_HISTORY_KEY = 'self-music-playlist-history';

export class PlaylistManager {
  
  // 获取当前播放列表
  static getCurrentPlaylist(): PlaylistState | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem(PLAYLIST_STORAGE_KEY);
      if (!stored) return null;
      
      const playlist = JSON.parse(stored) as PlaylistState;
      
      // 验证数据完整性
      if (!Array.isArray(playlist.songs) || typeof playlist.currentIndex !== 'number') {
        this.clearCurrentPlaylist();
        return null;
      }
      
      return playlist;
    } catch (error) {
      console.error('Error loading playlist from localStorage:', error);
      this.clearCurrentPlaylist();
      return null;
    }
  }
  
  // 保存当前播放列表
  static saveCurrentPlaylist(playlist: PlaylistState): void {
    if (typeof window === 'undefined') return;
    
    try {
      const playlistData = {
        ...playlist,
        lastUpdated: new Date().toISOString(),
      };
      
      localStorage.setItem(PLAYLIST_STORAGE_KEY, JSON.stringify(playlistData));
      
      // 同时保存到历史记录
      this.saveToHistory(playlistData);
    } catch (error) {
      console.error('Error saving playlist to localStorage:', error);
    }
  }
  
  // 创建新的播放列表状态
  static createPlaylistState(
    songs: Song[], 
    currentIndex: number = 0, 
    currentSongId?: string
  ): PlaylistState {
    const validIndex = Math.max(0, Math.min(currentIndex, songs.length - 1));
    const songId = currentSongId || (songs[validIndex]?.id);
    
    return {
      songs,
      currentIndex: validIndex,
      currentSongId: songId,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
  }
  
  // 更新播放列表
  static updatePlaylist(
    songs: Song[], 
    currentIndex?: number, 
    currentSongId?: string
  ): PlaylistState {
    const currentPlaylist = this.getCurrentPlaylist();
    
    const newIndex = currentIndex !== undefined 
      ? Math.max(0, Math.min(currentIndex, songs.length - 1))
      : currentPlaylist?.currentIndex ?? 0;
    
    const newSongId = currentSongId || songs[newIndex]?.id || null;
    
    const updatedPlaylist: PlaylistState = {
      songs,
      currentIndex: newIndex,
      currentSongId: newSongId,
      createdAt: currentPlaylist?.createdAt || new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
    
    this.saveCurrentPlaylist(updatedPlaylist);
    return updatedPlaylist;
  }
  
  // 切换到下一首歌
  static getNextSong(shuffleMode: boolean = false, repeatMode: 'none' | 'all' | 'one' = 'none'): Song | null {
    const playlist = this.getCurrentPlaylist();
    if (!playlist || playlist.songs.length === 0) return null;
    
    const { songs, currentIndex } = playlist;
    
    // 单曲循环：返回当前歌曲（不更新索引）
    if (repeatMode === 'one') {
      return songs[currentIndex] || null;
    }
    
    let nextIndex: number;
    
    if (shuffleMode) {
      // 随机播放模式
      if (songs.length === 1) {
        // 只有一首歌时，根据重复模式决定
        if (repeatMode === 'all') {
          nextIndex = 0;
        } else {
          return null; // 单次播放，结束
        }
      } else {
        // 多首歌时，随机选择不同的歌曲
        do {
          nextIndex = Math.floor(Math.random() * songs.length);
        } while (nextIndex === currentIndex);
      }
    } else {
      // 顺序播放模式
      nextIndex = currentIndex + 1;
      
      // 检查是否到达列表末尾
      if (nextIndex >= songs.length) {
        if (repeatMode === 'all') {
          // 列表循环：回到第一首
          nextIndex = 0;
        } else {
          // 单次播放：播放结束
          return null;
        }
      }
    }
    
    const nextSong = songs[nextIndex];
    if (nextSong) {
      // 更新播放列表状态
      const updatedPlaylist: PlaylistState = {
        ...playlist,
        currentIndex: nextIndex,
        currentSongId: nextSong.id,
        lastUpdated: new Date().toISOString(),
      };
      this.saveCurrentPlaylist(updatedPlaylist);
    }
    
    return nextSong;
  }
  
  // 切换到上一首歌
  static getPreviousSong(): Song | null {
    const playlist = this.getCurrentPlaylist();
    if (!playlist || playlist.songs.length === 0) return null;
    
    const { songs, currentIndex } = playlist;
    
    // 简单地减1，到头了就跳到末尾
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = songs.length - 1;
    }
    
    const prevSong = songs[prevIndex];
    if (prevSong) {
      const updatedPlaylist: PlaylistState = {
        ...playlist,
        currentIndex: prevIndex,
        currentSongId: prevSong.id,
        lastUpdated: new Date().toISOString(),
      };
      this.saveCurrentPlaylist(updatedPlaylist);
    }
    
    return prevSong;
  }
  
  // 跳转到特定歌曲
  static jumpToSong(songId: string): Song | null {
    const playlist = this.getCurrentPlaylist();
    if (!playlist) return null;
    
    const songIndex = playlist.songs.findIndex(song => song.id === songId);
    if (songIndex === -1) return null;
    
    const song = playlist.songs[songIndex];
    const updatedPlaylist = {
      ...playlist,
      currentIndex: songIndex,
      currentSongId: songId,
      lastUpdated: new Date().toISOString(),
    };
    
    this.saveCurrentPlaylist(updatedPlaylist);
    return song;
  }
  
  // 获取当前歌曲
  static getCurrentSong(): Song | null {
    const playlist = this.getCurrentPlaylist();
    if (!playlist) return null;
    
    return playlist.songs[playlist.currentIndex] || null;
  }
  
  // 检查是否可以播放下一首
  static canPlayNext(shuffleMode: boolean = false, repeatMode: 'none' | 'all' | 'one' = 'none'): boolean {
    const playlist = this.getCurrentPlaylist();
    if (!playlist || playlist.songs.length === 0) return false;
    
    // 单曲循环：总是可以播放（重复当前歌曲）
    if (repeatMode === 'one') return true;
    
    // 列表循环：总是可以播放（列表循环）
    if (repeatMode === 'all') return true;
    
    // 随机播放模式：只要有多首歌就可以播放下一首
    if (shuffleMode) return playlist.songs.length > 1;
    
    // 单次顺序播放：只有不是最后一首才能播放下一首
    return playlist.currentIndex < playlist.songs.length - 1;
  }

  // 检查是否可以播放上一首
  static canPlayPrevious(): boolean {
    const playlist = this.getCurrentPlaylist();
    if (!playlist || playlist.songs.length === 0) return false;
    
    // 只要有多首歌就可以播放上一首
    return playlist.songs.length > 1;
  }
  
  // 清除当前播放列表
  static clearCurrentPlaylist(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(PLAYLIST_STORAGE_KEY);
  }
  
  // 获取推荐的默认播放列表（播放数最多的歌曲）
  static async getRecommendedPlaylist(): Promise<Song[]> {
    try {
      // 首先尝试获取热门歌曲
      const hotSongsResult = await api.getHotSongs(50);
      if (hotSongsResult.success && hotSongsResult.data && hotSongsResult.data.length > 0) {
        // 按播放数排序
        const sortedSongs = hotSongsResult.data.sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
        return sortedSongs.slice(0, 30); // 取前30首
      }
      
      // 如果获取热门歌曲失败，尝试获取所有歌曲并按播放数排序
      const allSongsResult = await api.getSongs(1, 100);
      if (allSongsResult.success && allSongsResult.data && allSongsResult.data.data) {
        const sortedSongs = allSongsResult.data.data.sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
        return sortedSongs.slice(0, 30);
      }
      
      // 如果以上都失败，返回空数组
      return [];
    } catch (error) {
      console.error('Error fetching recommended playlist:', error);
      return [];
    }
  }
  
  // 初始化默认播放列表（新用户首次访问时调用）
  static async initializeDefaultPlaylist(): Promise<PlaylistState | null> {
    try {
      const recommendedSongs = await this.getRecommendedPlaylist();
      if (recommendedSongs.length === 0) return null;
      
      const defaultPlaylist = this.createPlaylistState(recommendedSongs, 0);
      this.saveCurrentPlaylist(defaultPlaylist);
      
      return defaultPlaylist;
    } catch (error) {
      console.error('Error initializing default playlist:', error);
      return null;
    }
  }
  
  // 打乱播放列表
  static shufflePlaylist(): PlaylistState | null {
    const playlist = this.getCurrentPlaylist();
    if (!playlist || playlist.songs.length <= 1) return playlist;
    
    const currentSong = playlist.songs[playlist.currentIndex];
    const shuffledSongs = [...playlist.songs];
    
    // Fisher-Yates 洗牌算法
    for (let i = shuffledSongs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledSongs[i], shuffledSongs[j]] = [shuffledSongs[j], shuffledSongs[i]];
    }
    
    // 确保当前歌曲仍然是当前播放的
    const newCurrentIndex = shuffledSongs.findIndex(song => song.id === currentSong.id);
    
    const shuffledPlaylist = {
      ...playlist,
      songs: shuffledSongs,
      currentIndex: newCurrentIndex >= 0 ? newCurrentIndex : 0,
      lastUpdated: new Date().toISOString(),
    };
    
    this.saveCurrentPlaylist(shuffledPlaylist);
    return shuffledPlaylist;
  }
  
  // 保存播放列表历史记录
  private static saveToHistory(playlist: PlaylistState): void {
    try {
      const history = this.getPlaylistHistory();
      const newHistoryEntry = {
        ...playlist,
        id: Date.now().toString(),
      };
      
      // 保留最近10个播放列表
      const updatedHistory = [newHistoryEntry, ...history.slice(0, 9)];
      localStorage.setItem(PLAYLIST_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error saving playlist history:', error);
    }
  }
  
  // 获取播放列表历史记录
  private static getPlaylistHistory(): PlaylistState[] {
    try {
      const stored = localStorage.getItem(PLAYLIST_HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading playlist history:', error);
      return [];
    }
  }
}