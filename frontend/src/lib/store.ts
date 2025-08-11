import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Song, PlayerState, Playlist } from '@/types';

interface PlayerStore extends PlayerState {
  // Additional state
  currentPlaylist: Playlist | null;
  playbackMode: 'song' | 'playlist' | 'mood';
  currentMood: string | null;
  
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
  
  // Enhanced playlist management
  addToPlaylist: (song: Song) => void;
  removeFromPlaylist: (songId: string) => void;
  clearPlaylist: () => void;
  shufflePlaylist: () => void;
  moveSongInPlaylist: (fromIndex: number, toIndex: number) => void;
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
        const { playlist, currentIndex, repeatMode, shuffleMode } = get();
        if (playlist.length === 0) return;

        let nextIndex = currentIndex + 1;

        if (shuffleMode) {
          nextIndex = Math.floor(Math.random() * playlist.length);
        } else if (nextIndex >= playlist.length) {
          if (repeatMode === 'all') {
            nextIndex = 0;
          } else {
            return; // End of playlist
          }
        }

        set({
          currentIndex: nextIndex,
          currentSong: playlist[nextIndex],
          currentTime: 0,
          duration: 0,
        });
      },

      previousSong: () => {
        const { playlist, currentIndex } = get();
        if (playlist.length === 0) return;

        let prevIndex = currentIndex - 1;
        if (prevIndex < 0) {
          prevIndex = playlist.length - 1;
        }

        set({
          currentIndex: prevIndex,
          currentSong: playlist[prevIndex],
          currentTime: 0,
          duration: 0,
        });
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
        set({ currentTime: time });
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
          set({ playlist: [...playlist, song] });
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
      },

      clearPlaylist: () => {
        set({ 
          playlist: [], 
          currentIndex: -1, 
          currentSong: null,
          isPlaying: false 
        });
      },

      shufflePlaylist: () => {
        const { playlist, currentSong } = get();
        if (playlist.length <= 1) return;
        
        const shuffled = [...playlist];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        // Find current song's new position
        const newIndex = shuffled.findIndex(s => s.id === currentSong?.id);
        
        set({ 
          playlist: shuffled,
          currentIndex: newIndex,
          shuffleMode: true
        });
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
      }
    }),
    {
      name: 'player-store',
    }
  )
);