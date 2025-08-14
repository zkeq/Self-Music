import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Artist, Album, Song, Playlist, Mood, PaginatedResponse } from '@/types';
import { api } from './api';

// Artists Store
interface ArtistsState {
  artists: Artist[];
  currentArtist: Artist | null;
  artistSongs: Song[];
  artistAlbums: Album[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ArtistsActions {
  fetchArtists: (page?: number, limit?: number) => Promise<void>;
  fetchArtist: (id: string) => Promise<void>;
  fetchArtistSongs: (id: string) => Promise<void>;
  fetchArtistAlbums: (id: string) => Promise<void>;
  setCurrentArtist: (artist: Artist | null) => void;
  clearArtistDetails: () => void;
}

export const useArtistsStore = create<ArtistsState & ArtistsActions>()(
  devtools(
    (set, get) => ({
      // Initial state
      artists: [],
      currentArtist: null,
      artistSongs: [],
      artistAlbums: [],
      isLoading: false,
      error: null,
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },

      // Actions
      fetchArtists: async (page = 1, limit = 20) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.getArtists(page, limit);
          if (response.success && response.data) {
            set({
              artists: response.data.data || [],
              pagination: {
                page: response.data.page || page,
                limit: response.data.limit || limit,
                total: response.data.total || 0,
                totalPages: response.data.totalPages || 0,
              },
              isLoading: false,
            });
          } else {
            set({ 
              artists: [],
              error: response.error || 'Failed to fetch artists', 
              isLoading: false 
            });
          }
        } catch (error) {
          set({ 
            artists: [],
            error: 'Network error', 
            isLoading: false 
          });
        }
      },

      fetchArtist: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.getArtist(id);
          if (response.success && response.data) {
            set({ currentArtist: response.data, isLoading: false });
          } else {
            set({ error: response.error || 'Failed to fetch artist', isLoading: false });
          }
        } catch (error) {
          set({ error: 'Network error', isLoading: false });
        }
      },

      fetchArtistSongs: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.getArtistSongs(id);
          if (response.success && response.data) {
            set({ artistSongs: response.data, isLoading: false });
          } else {
            set({ 
              artistSongs: [],
              error: response.error || 'Failed to fetch artist songs', 
              isLoading: false 
            });
          }
        } catch (error) {
          set({ 
            artistSongs: [],
            error: 'Network error', 
            isLoading: false 
          });
        }
      },

      fetchArtistAlbums: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.getArtistAlbums(id);
          if (response.success && response.data) {
            set({ artistAlbums: response.data, isLoading: false });
          } else {
            set({ 
              artistAlbums: [],
              error: response.error || 'Failed to fetch artist albums', 
              isLoading: false 
            });
          }
        } catch (error) {
          set({ 
            artistAlbums: [],
            error: 'Network error', 
            isLoading: false 
          });
        }
      },

      setCurrentArtist: (artist) => {
        set({ currentArtist: artist });
      },

      clearArtistDetails: () => {
        set({
          currentArtist: null,
          artistSongs: [],
          artistAlbums: [],
        });
      },
    }),
    { name: 'artists-store' }
  )
);

// Songs Store
interface SongsState {
  songs: Song[];
  currentSong: Song | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  trending: Song[];
  hot: Song[];
  new: Song[];
}

interface SongsActions {
  fetchSongs: (page?: number, limit?: number) => Promise<void>;
  fetchSong: (id: string) => Promise<void>;
  fetchTrendingSongs: (limit?: number) => Promise<void>;
  fetchHotSongs: (limit?: number) => Promise<void>;
  fetchNewSongs: (limit?: number) => Promise<void>;
  setCurrentSong: (song: Song | null) => void;
}

export const useSongsStore = create<SongsState & SongsActions>()(
  devtools(
    (set, get) => ({
      // Initial state
      songs: [],
      currentSong: null,
      isLoading: false,
      error: null,
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
      trending: [],
      hot: [],
      new: [],

      // Actions
      fetchSongs: async (page = 1, limit = 20) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.getSongs(page, limit);
          if (response.success && response.data) {
            set({
              songs: response.data.data || [],
              pagination: {
                page: response.data.page || page,
                limit: response.data.limit || limit,
                total: response.data.total || 0,
                totalPages: response.data.totalPages || 0,
              },
              isLoading: false,
            });
          } else {
            set({ 
              songs: [],
              error: response.error || 'Failed to fetch songs', 
              isLoading: false 
            });
          }
        } catch (error) {
          set({ 
            songs: [],
            error: 'Network error', 
            isLoading: false 
          });
        }
      },

      fetchSong: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.getSong(id);
          if (response.success && response.data) {
            set({ currentSong: response.data, isLoading: false });
          } else {
            set({ error: response.error || 'Failed to fetch song', isLoading: false });
          }
        } catch (error) {
          set({ error: 'Network error', isLoading: false });
        }
      },

      fetchTrendingSongs: async (limit = 20) => {
        try {
          const response = await api.getTrendingSongs(limit);
          if (response.success && response.data) {
            set({ trending: response.data });
          } else {
            set({ trending: [] });
          }
        } catch (error) {
          console.error('Failed to fetch trending songs:', error);
          set({ trending: [] });
        }
      },

      fetchHotSongs: async (limit = 20) => {
        try {
          const response = await api.getHotSongs(limit);
          if (response.success && response.data) {
            set({ hot: response.data });
          } else {
            set({ hot: [] });
          }
        } catch (error) {
          console.error('Failed to fetch hot songs:', error);
          set({ hot: [] });
        }
      },

      fetchNewSongs: async (limit = 20) => {
        try {
          const response = await api.getNewSongs(limit);
          if (response.success && response.data) {
            set({ new: response.data });
          } else {
            set({ new: [] });
          }
        } catch (error) {
          console.error('Failed to fetch new songs:', error);
          set({ new: [] });
        }
      },

      setCurrentSong: (song) => {
        set({ currentSong: song });
      },
    }),
    { name: 'songs-store' }
  )
);

// Playlists Store
interface PlaylistsState {
  playlists: Playlist[];
  currentPlaylist: Playlist | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface PlaylistsActions {
  fetchPlaylists: (page?: number, limit?: number) => Promise<void>;
  fetchPlaylist: (id: string) => Promise<void>;
  createPlaylist: (playlist: Partial<Playlist>) => Promise<void>;
  updatePlaylist: (id: string, playlist: Partial<Playlist>) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
  addSongToPlaylist: (playlistId: string, songId: string) => Promise<void>;
  removeSongFromPlaylist: (playlistId: string, songId: string) => Promise<void>;
  setCurrentPlaylist: (playlist: Playlist | null) => void;
}

export const usePlaylistsStore = create<PlaylistsState & PlaylistsActions>()(
  devtools(
    (set, get) => ({
      // Initial state
      playlists: [],
      currentPlaylist: null,
      isLoading: false,
      error: null,
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },

      // Actions
      fetchPlaylists: async (page = 1, limit = 20) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.getPlaylists(page, limit);
          if (response.success && response.data) {
            set({
              playlists: response.data.data || [],
              pagination: {
                page: response.data.page || page,
                limit: response.data.limit || limit,
                total: response.data.total || 0,
                totalPages: response.data.totalPages || 0,
              },
              isLoading: false,
            });
          } else {
            set({ 
              playlists: [],
              error: response.error || 'Failed to fetch playlists', 
              isLoading: false 
            });
          }
        } catch (error) {
          set({ 
            playlists: [],
            error: 'Network error', 
            isLoading: false 
          });
        }
      },

      fetchPlaylist: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.getPlaylist(id);
          if (response.success && response.data) {
            set({ currentPlaylist: response.data, isLoading: false });
          } else {
            set({ error: response.error || 'Failed to fetch playlist', isLoading: false });
          }
        } catch (error) {
          set({ error: 'Network error', isLoading: false });
        }
      },

      createPlaylist: async (playlist: Partial<Playlist>) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.createPlaylist(playlist);
          if (response.success && response.data) {
            set((state) => ({
              playlists: [...state.playlists, response.data!],
              isLoading: false,
            }));
          } else {
            set({ error: response.error || 'Failed to create playlist', isLoading: false });
          }
        } catch (error) {
          set({ error: 'Network error', isLoading: false });
        }
      },

      updatePlaylist: async (id: string, playlist: Partial<Playlist>) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.updatePlaylist(id, playlist);
          if (response.success && response.data) {
            set((state) => ({
              playlists: state.playlists.map(p => p.id === id ? response.data! : p),
              currentPlaylist: state.currentPlaylist?.id === id ? response.data! : state.currentPlaylist,
              isLoading: false,
            }));
          } else {
            set({ error: response.error || 'Failed to update playlist', isLoading: false });
          }
        } catch (error) {
          set({ error: 'Network error', isLoading: false });
        }
      },

      deletePlaylist: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.deletePlaylist(id);
          if (response.success) {
            set((state) => ({
              playlists: state.playlists.filter(p => p.id !== id),
              currentPlaylist: state.currentPlaylist?.id === id ? null : state.currentPlaylist,
              isLoading: false,
            }));
          } else {
            set({ error: response.error || 'Failed to delete playlist', isLoading: false });
          }
        } catch (error) {
          set({ error: 'Network error', isLoading: false });
        }
      },

      addSongToPlaylist: async (playlistId: string, songId: string) => {
        try {
          const response = await api.addSongToPlaylist(playlistId, songId);
          if (response.success) {
            // Refresh the playlist to get updated song list
            const { fetchPlaylist } = get();
            await fetchPlaylist(playlistId);
          }
        } catch (error) {
          console.error('Failed to add song to playlist:', error);
        }
      },

      removeSongFromPlaylist: async (playlistId: string, songId: string) => {
        try {
          const response = await api.removeSongFromPlaylist(playlistId, songId);
          if (response.success) {
            // Refresh the playlist to get updated song list
            const { fetchPlaylist } = get();
            await fetchPlaylist(playlistId);
          }
        } catch (error) {
          console.error('Failed to remove song from playlist:', error);
        }
      },

      setCurrentPlaylist: (playlist) => {
        set({ currentPlaylist: playlist });
      },
    }),
    { name: 'playlists-store' }
  )
);

// Moods Store
interface MoodsState {
  moods: Mood[];
  currentMood: Mood | null;
  moodSongs: Song[];
  isLoading: boolean;
  error: string | null;
}

interface MoodsActions {
  fetchMoods: () => Promise<void>;
  fetchMood: (id: string) => Promise<void>;
  fetchMoodSongs: (id: string) => Promise<void>;
  setCurrentMood: (mood: Mood | null) => void;
}

export const useMoodsStore = create<MoodsState & MoodsActions>()(
  devtools(
    (set, get) => ({
      // Initial state
      moods: [],
      currentMood: null,
      moodSongs: [],
      isLoading: false,
      error: null,

      // Actions
      fetchMoods: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.getMoods();
          if (response.success && response.data) {
            set({ moods: response.data, isLoading: false });
          } else {
            set({ 
              moods: [],
              error: response.error || 'Failed to fetch moods', 
              isLoading: false 
            });
          }
        } catch (error) {
          set({ 
            moods: [],
            error: 'Network error', 
            isLoading: false 
          });
        }
      },

      fetchMood: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.getMood(id);
          if (response.success && response.data) {
            set({ currentMood: response.data, isLoading: false });
          } else {
            set({ error: response.error || 'Failed to fetch mood', isLoading: false });
          }
        } catch (error) {
          set({ error: 'Network error', isLoading: false });
        }
      },

      fetchMoodSongs: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.getMoodSongs(id);
          if (response.success && response.data) {
            set({ moodSongs: response.data, isLoading: false });
          } else {
            set({ 
              moodSongs: [],
              error: response.error || 'Failed to fetch mood songs', 
              isLoading: false 
            });
          }
        } catch (error) {
          set({ 
            moodSongs: [],
            error: 'Network error', 
            isLoading: false 
          });
        }
      },

      setCurrentMood: (mood) => {
        set({ currentMood: mood });
      },
    }),
    { name: 'moods-store' }
  )
);

// Search Store
interface SearchState {
  query: string;
  results: {
    songs: Song[];
    artists: Artist[];
    albums: Album[];
    playlists: Playlist[];
  };
  isLoading: boolean;
  error: string | null;
}

interface SearchActions {
  search: (query: string) => Promise<void>;
  clearSearch: () => void;
}

export const useSearchStore = create<SearchState & SearchActions>()(
  devtools(
    (set, get) => ({
      // Initial state
      query: '',
      results: {
        songs: [],
        artists: [],
        albums: [],
        playlists: [],
      },
      isLoading: false,
      error: null,

      // Actions
      search: async (query: string) => {
        if (!query.trim()) {
          set({ 
            query: '', 
            results: { songs: [], artists: [], albums: [], playlists: [] } 
          });
          return;
        }

        set({ isLoading: true, error: null, query });
        try {
          const response = await api.search(query);
          if (response.success && response.data) {
            set({ 
              results: {
                songs: response.data.songs || [],
                artists: response.data.artists || [],
                albums: response.data.albums || [],
                playlists: response.data.playlists || [],
              }, 
              isLoading: false 
            });
          } else {
            set({ 
              results: { songs: [], artists: [], albums: [], playlists: [] },
              error: response.error || 'Failed to search', 
              isLoading: false 
            });
          }
        } catch (error) {
          set({ 
            results: { songs: [], artists: [], albums: [], playlists: [] },
            error: 'Network error', 
            isLoading: false 
          });
        }
      },

      clearSearch: () => {
        set({
          query: '',
          results: { songs: [], artists: [], albums: [], playlists: [] },
          error: null,
        });
      },
    }),
    { name: 'search-store' }
  )
);