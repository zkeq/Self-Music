import type { 
  Artist, 
  Album, 
  Song, 
  Playlist, 
  Mood, 
  ApiResponse, 
  PaginatedResponse, 
  SearchResult,
  RecommendationParams 
} from '@/types';
import { mockApi } from './mock-api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const USE_MOCK_API = false;

// Real API Client Configuration
class RealApiClient {
  private baseURL: string;
  
  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Artists API
  async getArtists(page = 1, limit = 20): Promise<ApiResponse<PaginatedResponse<Artist>>> {
    return this.request(`/artists?page=${page}&limit=${limit}`);
  }

  async getArtist(id: string): Promise<ApiResponse<Artist>> {
    return this.request(`/artists/${id}`);
  }

  async getArtistSongs(id: string): Promise<ApiResponse<Song[]>> {
    return this.request(`/artists/${id}/songs`);
  }

  async getArtistAlbums(id: string): Promise<ApiResponse<Album[]>> {
    return this.request(`/artists/${id}/albums`);
  }

  // Albums API
  async getAlbums(page = 1, limit = 20): Promise<ApiResponse<PaginatedResponse<Album>>> {
    return this.request(`/albums?page=${page}&limit=${limit}`);
  }

  async getAlbum(id: string): Promise<ApiResponse<Album>> {
    return this.request(`/albums/${id}`);
  }

  async getAlbumSongs(id: string): Promise<ApiResponse<Song[]>> {
    return this.request(`/albums/${id}/songs`);
  }

  // Songs API
  async getSongs(page = 1, limit = 20, sortBy = 'created_desc'): Promise<ApiResponse<PaginatedResponse<Song>>> {
    return this.request(`/songs?page=${page}&limit=${limit}&sort_by=${sortBy}`);
  }

  async getSong(id: string): Promise<ApiResponse<Song>> {
    return this.request(`/songs/${id}`);
  }

  // Playlists API
  async getPlaylists(page = 1, limit = 20): Promise<ApiResponse<PaginatedResponse<Playlist>>> {
    return this.request(`/playlists?page=${page}&limit=${limit}`);
  }

  async getPlaylist(id: string): Promise<ApiResponse<Playlist>> {
    return this.request(`/playlists/${id}`);
  }

  async createPlaylist(playlist: Partial<Playlist>): Promise<ApiResponse<Playlist>> {
    return this.request('/playlists', {
      method: 'POST',
      body: JSON.stringify(playlist),
    });
  }

  async updatePlaylist(id: string, playlist: Partial<Playlist>): Promise<ApiResponse<Playlist>> {
    return this.request(`/playlists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(playlist),
    });
  }

  async deletePlaylist(id: string): Promise<ApiResponse<void>> {
    return this.request(`/playlists/${id}`, { method: 'DELETE' });
  }

  async addSongToPlaylist(playlistId: string, songId: string): Promise<ApiResponse<void>> {
    return this.request(`/playlists/${playlistId}/songs`, {
      method: 'POST',
      body: JSON.stringify({ songId }),
    });
  }

  async removeSongFromPlaylist(playlistId: string, songId: string): Promise<ApiResponse<void>> {
    return this.request(`/playlists/${playlistId}/songs/${songId}`, { method: 'DELETE' });
  }

  // Moods API
  async getMoods(): Promise<ApiResponse<Mood[]>> {
    return this.request('/moods');
  }

  async getMood(id: string): Promise<ApiResponse<Mood>> {
    return this.request(`/moods/${id}`);
  }

  async getMoodSongs(id: string, page = 1, limit = 20): Promise<ApiResponse<Song[] | PaginatedResponse<Song>>> {
    return this.request(`/moods/${id}/songs?page=${page}&limit=${limit}`);
  }

  // Search API
  async search(query: string): Promise<ApiResponse<SearchResult>> {
    return this.request(`/search?q=${encodeURIComponent(query)}`);
  }

  // Recommendations API
  async getRecommendations(params: RecommendationParams = {}): Promise<ApiResponse<Song[]>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString());
    });
    
    return this.request(`/recommendations?${queryParams.toString()}`);
  }

  async getSimilarSongs(songId: string, limit = 10): Promise<ApiResponse<Song[]>> {
    return this.request(`/songs/${songId}/similar?limit=${limit}`);
  }

  async getTrendingSongs(limit = 20): Promise<ApiResponse<Song[]>> {
    return this.request(`/trending/songs?limit=${limit}`);
  }

  async getHotSongs(limit = 20): Promise<ApiResponse<Song[]>> {
    return this.request(`/hot/songs?limit=${limit}`);
  }

  async getNewSongs(limit = 20): Promise<ApiResponse<Song[]>> {
    return this.request(`/new/songs?limit=${limit}`);
  }
}

// Create real API client instance
const realApi = new RealApiClient(API_BASE_URL);

// Export the appropriate API based on environment
export const api = USE_MOCK_API ? mockApi : realApi;

// Export individual API functions for convenience
export const {
  getArtists,
  getArtist,
  getArtistSongs,
  getArtistAlbums,
  getAlbums,
  getAlbum,
  getAlbumSongs,
  getSongs,
  getSong,
  getPlaylists,
  getPlaylist,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  getMoods,
  getMood,
  getMoodSongs,
  search,
  getRecommendations,
  getSimilarSongs,
  getTrendingSongs,
  getHotSongs,
  getNewSongs,
} = api;