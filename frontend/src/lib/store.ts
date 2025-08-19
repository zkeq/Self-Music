import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Song, PlayerState, Playlist } from '@/types';
import { DEFAULT_SONG } from './default-song';
import { PlaylistManager, PlaylistState } from './playlist-manager';
import { useSongsStore } from './data-stores';  // 导入数据存储以记录播放量

interface PlayerStore extends PlayerState {
  // Additional state
  currentPlaylist: Playlist | null;
  playbackMode: 'song' | 'playlist' | 'mood';
  currentMood: string | null;
  isLoading: boolean;
  error: string | null;
  shouldSeek: number | null; // 用于触发音频跳转
  
  // Actions
  setSong: (song: Song) => void;
  setPlaylist: (songs: Song[], currentIndex?: number) => void;
  setPlaylistWithInfo: (playlist: Playlist, currentIndex?: number) => void;
  setMoodPlaylist: (mood: string, songs: Song[], currentIndex?: number) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  nextSong: () => void;
  previousSong: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  seekTo: (time: number) => void;
  playFromPlaylist: (playlistId: string, songIndex?: number) => void;
  playFromMood: (mood: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Enhanced playlist management
  addToPlaylist: (song: Song) => void;
  removeFromPlaylist: (songId: string) => void;
  clearPlaylist: () => void;
  shufflePlaylist: () => void;
  moveSongInPlaylist: (fromIndex: number, toIndex: number) => void;
  
  // New audio-related actions
  canPlayNext: () => boolean;
  canPlayPrevious: () => boolean;
  loadDefaultSong: () => void;
  
  // New playlist manager integration
  initializePlaylist: () => Promise<void>;
  loadPlaylistFromStorage: () => void;
  jumpToSong: (songId: string) => void;
  replacePlaylistAndPlay: (songs: Song[], songIndex?: number) => void;
}

export const usePlayerStore = create<PlayerStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentSong: null,
      isPlaying: false,
      volume: 0.7,
      currentTime: 0,
      duration: 0,
      playlist: [],
      currentIndex: -1,
      repeatMode: 'none',
      shuffleMode: false,
      currentPlaylist: null,
      playbackMode: 'song',
      currentMood: null,
      isLoading: false,
      error: null,
      shouldSeek: null,

      // Actions
      setSong: (song) => {
        const { currentSong, duration } = get();
        // 如果是同一首歌，保持原有的时长
        const isSameSong = currentSong && currentSong.id === song.id;
        
        set({ 
          currentSong: song, 
          currentTime: 0, 
          duration: isSameSong ? duration : 0, // 同一首歌保持时长，新歌曲重置为0等待加载
          playbackMode: 'song',
          currentPlaylist: null,
          currentMood: null
        });
      },

      setPlaylist: (songs, currentIndex = 0) => {
        const { currentSong, duration } = get();
        const validIndex = Math.max(0, Math.min(currentIndex, songs.length - 1));
        const newSong = songs[validIndex] || null;
        // 如果是同一首歌，保持原有的时长
        const isSameSong = currentSong && newSong && currentSong.id === newSong.id;
        
        set({
          playlist: songs,
          currentIndex: validIndex,
          currentSong: newSong,
          currentTime: 0,
          duration: isSameSong ? duration : 0, // 同一首歌保持时长，新歌曲重置为0等待加载
          playbackMode: 'playlist',
        });
      },

      setPlaylistWithInfo: (playlist, currentIndex = 0) => {
        const { currentSong, duration } = get();
        const validIndex = Math.max(0, Math.min(currentIndex, playlist.songs.length - 1));
        const newSong = playlist.songs[validIndex] || null;
        // 如果是同一首歌，保持原有的时长
        const isSameSong = currentSong && newSong && currentSong.id === newSong.id;
        
        set({
          playlist: playlist.songs,
          currentIndex: validIndex,
          currentSong: newSong,
          currentTime: 0,
          duration: isSameSong ? duration : 0, // 同一首歌保持时长，新歌曲重置为0等待加载
          currentPlaylist: playlist,
          playbackMode: 'playlist',
          currentMood: null,
        });
      },

      setMoodPlaylist: (mood, songs, currentIndex = 0) => {
        const { currentSong, duration } = get();
        const validIndex = Math.max(0, Math.min(currentIndex, songs.length - 1));
        const newSong = songs[validIndex] || null;
        // 如果是同一首歌，保持原有的时长
        const isSameSong = currentSong && newSong && currentSong.id === newSong.id;
        
        set({
          playlist: songs,
          currentIndex: validIndex,
          currentSong: newSong,
          currentTime: 0,
          duration: isSameSong ? duration : 0, // 同一首歌保持时长，新歌曲重置为0等待加载
          playbackMode: 'mood',
          currentMood: mood,
          currentPlaylist: null,
        });
      },

      play: () => set({ isPlaying: true }),
      pause: () => set({ isPlaying: false }),
      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

      setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
      setCurrentTime: (currentTime) => set({ currentTime }),
      setDuration: (duration) => set({ duration }),

      nextSong: () => {
        const { repeatMode, shuffleMode, currentSong, duration } = get();
        console.log('Store nextSong called with:', { repeatMode, shuffleMode, currentSong: currentSong?.title });
        const nextSong = PlaylistManager.getNextSong(shuffleMode, repeatMode);
        
        if (nextSong) {
          // 获取更新后的播放列表状态
          const updatedPlaylist = PlaylistManager.getCurrentPlaylist();
          console.log('Updated playlist from manager:', updatedPlaylist?.currentIndex);
          // 如果是同一首歌，保持原有的时长
          const isSameSong = currentSong && currentSong.id === nextSong.id;
          
          set({
            currentSong: nextSong,
            currentTime: 0, // 重置播放时间
            duration: isSameSong ? duration : 0, // 同一首歌保持时长，新歌曲重置为0等待加载
            isPlaying: true, // 确保继续播放
            // 同步播放列表状态
            ...(updatedPlaylist && {
              playlist: updatedPlaylist.songs,
              currentIndex: updatedPlaylist.currentIndex
            })
          });
          console.log('Set new song:', nextSong.title, 'at index:', updatedPlaylist?.currentIndex);
        } else {
          // 没有下一首歌时，停止播放
          console.log('Playlist ended, stopping playback');
          set({ isPlaying: false });
        }
      },

      previousSong: () => {
        const { currentSong, duration } = get();
        const prevSong = PlaylistManager.getPreviousSong();
        
        if (prevSong) {
          // 获取更新后的播放列表状态
          const updatedPlaylist = PlaylistManager.getCurrentPlaylist();
          // 如果是同一首歌，保持原有的时长
          const isSameSong = currentSong && currentSong.id === prevSong.id;
          
          set({
            currentSong: prevSong,
            currentTime: 0,
            duration: isSameSong ? duration : 0, // 同一首歌保持时长，新歌曲重置为0等待加载
            isPlaying: true, // 确保新歌曲开始播放
            // 同步播放列表状态
            ...(updatedPlaylist && {
              playlist: updatedPlaylist.songs,
              currentIndex: updatedPlaylist.currentIndex
            })
          });
        }
      },

      toggleRepeat: () => {
        const { repeatMode } = get();
        const modes: PlayerState['repeatMode'][] = ['none', 'all', 'one'];
        const currentIndex = modes.indexOf(repeatMode);
        const nextMode = modes[(currentIndex + 1) % modes.length];
        set({ repeatMode: nextMode });
      },

      toggleShuffle: () => {
        set((state) => ({ shuffleMode: !state.shuffleMode }));
      },

      seekTo: (time) => {
        const { duration } = get();
        const clampedTime = Math.max(0, Math.min(time, duration || time));
        set({ shouldSeek: clampedTime });
      },

      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),

      canPlayNext: () => {
        const { shuffleMode, repeatMode } = get();
        return PlaylistManager.canPlayNext(shuffleMode, repeatMode);
      },

      canPlayPrevious: () => {
        return PlaylistManager.canPlayPrevious();
      },

      playFromPlaylist: async (playlistId, songIndex = 0) => {
        // In real app, fetch playlist from API
        // For now, mock implementation
        console.log(`Playing from playlist: ${playlistId}, song index: ${songIndex}`);
      },

      playFromMood: async (mood) => {
        // In real app, fetch mood-based songs from API
        // For now, mock implementation
        console.log(`Playing mood: ${mood}`);
      },

      // Enhanced playlist management
      addToPlaylist: (song) => {
        const { playlist } = get();
        // 允许重复添加歌曲到播放列表
        const newPlaylist = [...playlist, song];
        set({ playlist: newPlaylist });
        
        // 同步到 PlaylistManager
        const currentPlaylist = PlaylistManager.getCurrentPlaylist();
        if (currentPlaylist) {
          PlaylistManager.updatePlaylist(newPlaylist, currentPlaylist.currentIndex);
        }
      },

      removeFromPlaylist: (songId) => {
        const { playlist, currentIndex } = get();
        const newPlaylist = playlist.filter(s => s.id !== songId);
        
        // Adjust currentIndex if necessary
        let newCurrentIndex = currentIndex;
        if (currentIndex >= newPlaylist.length) {
          newCurrentIndex = Math.max(0, newPlaylist.length - 1);
        }
        
        set({ 
          playlist: newPlaylist,
          currentIndex: newCurrentIndex,
          currentSong: newPlaylist[newCurrentIndex] || null 
        });
        
        // 同步到 PlaylistManager
        PlaylistManager.updatePlaylist(newPlaylist, newCurrentIndex);
      },

      clearPlaylist: () => {
        set({ 
          playlist: [], 
          currentIndex: -1, 
          currentSong: null,
          isPlaying: false 
        });
        PlaylistManager.clearCurrentPlaylist();
      },

      shufflePlaylist: () => {
        const shuffledPlaylistState = PlaylistManager.shufflePlaylist();
        if (shuffledPlaylistState) {
          set({
            playlist: shuffledPlaylistState.songs,
            currentIndex: shuffledPlaylistState.currentIndex,
            currentSong: shuffledPlaylistState.songs[shuffledPlaylistState.currentIndex],
            shuffleMode: true
          });
        }
      },

      moveSongInPlaylist: (fromIndex, toIndex) => {
        const { playlist, currentIndex } = get();
        if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || 
            fromIndex >= playlist.length || toIndex >= playlist.length) return;
        
        const newPlaylist = [...playlist];
        const [movedSong] = newPlaylist.splice(fromIndex, 1);
        newPlaylist.splice(toIndex, 0, movedSong);
        
        // Adjust currentIndex
        let newCurrentIndex = currentIndex;
        if (fromIndex === currentIndex) {
          newCurrentIndex = toIndex;
        } else if (fromIndex < currentIndex && toIndex >= currentIndex) {
          newCurrentIndex = currentIndex - 1;
        } else if (fromIndex > currentIndex && toIndex <= currentIndex) {
          newCurrentIndex = currentIndex + 1;
        }
        
        set({ 
          playlist: newPlaylist,
          currentIndex: newCurrentIndex,
          currentSong: newPlaylist[newCurrentIndex]
        });
        
        // 同步到 PlaylistManager
        PlaylistManager.updatePlaylist(newPlaylist, newCurrentIndex);
      },

      loadDefaultSong: () => {
        set({
          currentSong: DEFAULT_SONG,
          currentTime: 0,
          duration: 0, // 让音频文件加载后自动设置真实时长
          isPlaying: false,
          playbackMode: 'song',
          currentPlaylist: null,
          currentMood: null,
        });
      },

      // New playlist manager integration methods
      initializePlaylist: async () => {
        set({ isLoading: true });
        
        try {
          // First try to load from localStorage
          const existingPlaylist = PlaylistManager.getCurrentPlaylist();
          
          if (existingPlaylist && existingPlaylist.songs.length > 0) {
            // Load existing playlist
            set({
              playlist: existingPlaylist.songs,
              currentIndex: existingPlaylist.currentIndex,
              currentSong: existingPlaylist.songs[existingPlaylist.currentIndex] || null,
              playbackMode: 'playlist',
              isLoading: false,
            });
          } else {
            // Initialize with recommended playlist for new users
            const defaultPlaylist = await PlaylistManager.initializeDefaultPlaylist();
            
            if (defaultPlaylist) {
              set({
                playlist: defaultPlaylist.songs,
                currentIndex: defaultPlaylist.currentIndex,
                currentSong: defaultPlaylist.songs[defaultPlaylist.currentIndex] || null,
                playbackMode: 'playlist',
                isLoading: false,
              });
            } else {
              // Fallback to default song if no recommendations available
              set({
                currentSong: DEFAULT_SONG,
                currentTime: 0,
                duration: DEFAULT_SONG.duration,
                isPlaying: false,
                playbackMode: 'song',
                isLoading: false,
              });
            }
          }
        } catch (error) {
          console.error('Error initializing playlist:', error);
          set({
            currentSong: DEFAULT_SONG,
            currentTime: 0,
            duration: DEFAULT_SONG.duration,
            isPlaying: false,
            playbackMode: 'song',
            isLoading: false,
            error: 'Failed to load playlist',
          });
        }
      },

      loadPlaylistFromStorage: () => {
        const storedPlaylist = PlaylistManager.getCurrentPlaylist();
        
        if (storedPlaylist) {
          set({
            playlist: storedPlaylist.songs,
            currentIndex: storedPlaylist.currentIndex,
            currentSong: storedPlaylist.songs[storedPlaylist.currentIndex] || null,
            playbackMode: 'playlist',
          });
        }
      },

      jumpToSong: (songId) => {
        const { currentSong, duration } = get();
        const song = PlaylistManager.jumpToSong(songId);
        
        if (song) {
          const storedPlaylist = PlaylistManager.getCurrentPlaylist();
          // 如果是同一首歌，保持原有的时长
          const isSameSong = currentSong && currentSong.id === song.id;
          
          if (storedPlaylist) {
            set({
              playlist: storedPlaylist.songs,
              currentIndex: storedPlaylist.currentIndex,
              currentSong: song,
              currentTime: 0,
              duration: isSameSong ? duration : 0, // 同一首歌保持时长，新歌曲重置为0等待加载
            });
          }
        }
      },

      replacePlaylistAndPlay: (songs, songIndex = 0) => {
        const { currentSong, duration } = get();
        const validIndex = Math.max(0, Math.min(songIndex, songs.length - 1));
        const newSong = songs[validIndex] || null;
        // 如果是同一首歌，保持原有的时长
        const isSameSong = currentSong && newSong && currentSong.id === newSong.id;
        const playlistState = PlaylistManager.updatePlaylist(songs, validIndex);
        
        set({
          playlist: songs,
          currentIndex: validIndex,
          currentSong: newSong,
          currentTime: 0,
          duration: isSameSong ? duration : 0, // 同一首歌保持时长，新歌曲重置为0等待加载
          playbackMode: 'playlist',
          isPlaying: true, // Auto-play when replacing playlist
        });
      },
    }),
    {
      name: 'player-store',
    }
  )
);