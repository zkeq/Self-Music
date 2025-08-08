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
    }),
    {
      name: 'player-store',
    }
  )
);