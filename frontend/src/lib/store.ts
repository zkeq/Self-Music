import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Song, PlayerState } from '@/types';

interface PlayerStore extends PlayerState {
  // Actions
  setSong: (song: Song) => void;
  setPlaylist: (songs: Song[], currentIndex?: number) => void;
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

      // Actions
      setSong: (song) => {
        set({ currentSong: song, currentTime: 0, duration: 0 });
      },

      setPlaylist: (songs, currentIndex = 0) => {
        const validIndex = Math.max(0, Math.min(currentIndex, songs.length - 1));
        set({
          playlist: songs,
          currentIndex: validIndex,
          currentSong: songs[validIndex] || null,
          currentTime: 0,
          duration: 0,
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
    }),
    {
      name: 'player-store',
    }
  )
);