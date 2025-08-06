const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new APIError(response.status, `API request failed: ${response.statusText}`);
  }

  return response.json();
}

// Songs API
export const songsApi = {
  getAll: () => apiRequest<Song[]>('/api/songs'),
  getById: (id: string) => apiRequest<Song>(`/api/songs/${id}`),
  upload: (formData: FormData) => {
    return apiRequest<UploadResponse>('/api/songs/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type to let browser set multipart boundary
    });
  },
  getStreamUrl: (id: string) => `${API_BASE}/api/songs/${id}/stream`,
};

// Playlists API
export const playlistsApi = {
  getAll: () => apiRequest<Playlist[]>('/api/playlists'),
  getById: (id: string) => apiRequest<Playlist>(`/api/playlists/${id}`),
  create: (data: Omit<Playlist, 'id' | 'created_at' | 'updated_at'>) =>
    apiRequest<Playlist>('/api/playlists', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Playlist>) =>
    apiRequest<Playlist>(`/api/playlists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest<{ success: boolean }>(`/api/playlists/${id}`, {
      method: 'DELETE',
    }),
};

// Moods API
export const moodsApi = {
  getAll: () => apiRequest<MoodTag[]>('/api/moods'),
  getSongs: (mood: string) => apiRequest<Song[]>(`/api/moods/${mood}/songs`),
};

// Lyrics API
export const lyricsApi = {
  getBySongId: (songId: string) => apiRequest<Lyrics>(`/api/lyrics/${songId}`),
};

// Import types
import type { Song, Playlist, MoodTag, Lyrics, UploadResponse } from '@/types';