import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Song, PlayerState, Playlist } from '@/types';
import { DEFAULT_SONG } from './default-song';
import { PlaylistManager, PlaylistState } from './playlist-manager';

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
        set({ 
          currentSong: song, 
          currentTime: 0, 
          duration: 0,
          playbackMode: 'song',
          currentPlaylist: null,
          currentMood: null
        });
      },

      setPlaylist: (songs, currentIndex = 0) => {
        const validIndex = Math.max(0, Math.min(currentIndex, songs.length - 1));
        set({
          playlist: songs,
          currentIndex: validIndex,
          currentSong: songs[validIndex] || null,
          currentTime: 0,
          duration: 0,
          playbackMode: 'playlist',
        });
      },

      setPlaylistWithInfo: (playlist, currentIndex = 0) => {
        const validIndex = Math.max(0, Math.min(currentIndex, playlist.songs.length - 1));
        set({
          playlist: playlist.songs,
          currentIndex: validIndex,
          currentSong: playlist.songs[validIndex] || null,
          currentTime: 0,
          duration: 0,
          currentPlaylist: playlist,
          playbackMode: 'playlist',
          currentMood: null,
        });
      },

      setMoodPlaylist: (mood, songs, currentIndex = 0) => {
        const validIndex = Math.max(0, Math.min(currentIndex, songs.length - 1));
        set({
          playlist: songs,
          currentIndex: validIndex,
          currentSong: songs[validIndex] || null,
          currentTime: 0,
          duration: 0,
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
        const { repeatMode, shuffleMode } = get();
        const nextSong = PlaylistManager.getNextSong(shuffleMode, repeatMode);
        
        if (nextSong) {
          // 获取更新后的播放列表状态
          const updatedPlaylist = PlaylistManager.getCurrentPlaylist();
          
          set({
            currentSong: nextSong,
            currentTime: 0,
            duration: 0,
            // 同步播放列表状态
            ...(updatedPlaylist && {
              playlist: updatedPlaylist.songs,
              currentIndex: updatedPlaylist.currentIndex
            })
          });
        }
      },

      previousSong: () => {
        const prevSong = PlaylistManager.getPreviousSong();
        
        if (prevSong) {
          // 获取更新后的播放列表状态
          const updatedPlaylist = PlaylistManager.getCurrentPlaylist();
          
          set({
            currentSong: prevSong,
            currentTime: 0,
            duration: 0,
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
        const { repeatMode } = get();
        return PlaylistManager.canPlayNext(repeatMode);
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
        if (!playlist.find(s => s.id === song.id)) {
          const newPlaylist = [...playlist, song];
          set({ playlist: newPlaylist });
          
          // 同步到 PlaylistManager
          const currentPlaylist = PlaylistManager.getCurrentPlaylist();
          if (currentPlaylist) {
            PlaylistManager.updatePlaylist(newPlaylist, currentPlaylist.currentIndex);
          }
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
        const song = PlaylistManager.jumpToSong(songId);
        
        if (song) {
          const storedPlaylist = PlaylistManager.getCurrentPlaylist();
          if (storedPlaylist) {
            set({
              playlist: storedPlaylist.songs,
              currentIndex: storedPlaylist.currentIndex,
              currentSong: song,
              currentTime: 0,
              duration: 0,
            });
          }
        }
      },

      replacePlaylistAndPlay: (songs, songIndex = 0) => {
        const validIndex = Math.max(0, Math.min(songIndex, songs.length - 1));
        const playlistState = PlaylistManager.updatePlaylist(songs, validIndex);
        
        set({
          playlist: songs,
          currentIndex: validIndex,
          currentSong: songs[validIndex] || null,
          currentTime: 0,
          duration: 0,
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