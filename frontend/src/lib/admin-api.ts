import { LoginRequest, LoginResponse, AdminApiResponse, Artist, Album, Song, Mood, Playlist } from '@/types';

const API_BASE = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8000/api';

class AdminAPI {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('admin_token');
    }
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    this.token = data.access_token;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_token', data.access_token);
      localStorage.setItem('admin_user', JSON.stringify(data.user));
    }

    return data;
  }

  logout() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getCurrentUser() {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('admin_user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  // Artists
  async getArtists(): Promise<AdminApiResponse<Artist[]>> {
    const response = await fetch(`${API_BASE}/admin/artists`, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch artists');
    }
    
    return response.json();
  }

  async createArtist(artist: Omit<Artist, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdminApiResponse<Artist>> {
    const response = await fetch(`${API_BASE}/admin/artists`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(artist),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create artist');
    }
    
    return response.json();
  }

  async updateArtist(id: string, artist: Omit<Artist, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdminApiResponse<Artist>> {
    const response = await fetch(`${API_BASE}/admin/artists/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(artist),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update artist');
    }
    
    return response.json();
  }

  async deleteArtist(id: string): Promise<AdminApiResponse> {
    const response = await fetch(`${API_BASE}/admin/artists/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete artist');
    }
    
    return response.json();
  }

  // Albums
  async getAlbums(): Promise<AdminApiResponse<Album[]>> {
    const response = await fetch(`${API_BASE}/admin/albums`, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch albums');
    }
    
    return response.json();
  }

  async createAlbum(album: Omit<Album, 'id' | 'createdAt' | 'updatedAt' | 'artist'>): Promise<AdminApiResponse<Album>> {
    const response = await fetch(`${API_BASE}/admin/albums`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(album),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create album');
    }
    
    return response.json();
  }

  async updateAlbum(id: string, album: Omit<Album, 'id' | 'createdAt' | 'updatedAt' | 'artist'>): Promise<AdminApiResponse<Album>> {
    const response = await fetch(`${API_BASE}/admin/albums/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(album),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update album');
    }
    
    return response.json();
  }

  async deleteAlbum(id: string): Promise<AdminApiResponse> {
    const response = await fetch(`${API_BASE}/admin/albums/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete album');
    }
    
    return response.json();
  }

  // Songs
  async getSongs(): Promise<AdminApiResponse<Song[]>> {
    const response = await fetch(`${API_BASE}/admin/songs`, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch songs');
    }
    
    return response.json();
  }

  async createSong(song: Omit<Song, 'id' | 'createdAt' | 'updatedAt' | 'artist' | 'album' | 'moods'>): Promise<AdminApiResponse<Song>> {
    const response = await fetch(`${API_BASE}/admin/songs`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(song),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create song');
    }
    
    return response.json();
  }

  async updateSong(id: string, song: Omit<Song, 'id' | 'createdAt' | 'updatedAt' | 'artist' | 'album' | 'moods'>): Promise<AdminApiResponse<Song>> {
    const response = await fetch(`${API_BASE}/admin/songs/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(song),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update song');
    }
    
    return response.json();
  }

  async deleteSong(id: string): Promise<AdminApiResponse> {
    const response = await fetch(`${API_BASE}/admin/songs/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete song');
    }
    
    return response.json();
  }

  // Moods
  async getMoods(): Promise<AdminApiResponse<Mood[]>> {
    const response = await fetch(`${API_BASE}/admin/moods`, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch moods');
    }
    
    return response.json();
  }

  async createMood(mood: Omit<Mood, 'id' | 'createdAt' | 'updatedAt' | 'songs'>): Promise<AdminApiResponse<Mood>> {
    const response = await fetch(`${API_BASE}/admin/moods`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(mood),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create mood');
    }
    
    return response.json();
  }

  async updateMood(id: string, mood: Omit<Mood, 'id' | 'createdAt' | 'updatedAt' | 'songs'>): Promise<AdminApiResponse<Mood>> {
    const response = await fetch(`${API_BASE}/admin/moods/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(mood),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update mood');
    }
    
    return response.json();
  }

  async deleteMood(id: string): Promise<AdminApiResponse> {
    const response = await fetch(`${API_BASE}/admin/moods/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete mood');
    }
    
    return response.json();
  }

  // Playlists
  async getPlaylists(): Promise<AdminApiResponse<Playlist[]>> {
    const response = await fetch(`${API_BASE}/admin/playlists`, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch playlists');
    }
    
    return response.json();
  }

  async createPlaylist(playlist: Omit<Playlist, 'id' | 'createdAt' | 'updatedAt' | 'songs'>): Promise<AdminApiResponse<Playlist>> {
    const response = await fetch(`${API_BASE}/admin/playlists`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(playlist),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create playlist');
    }
    
    return response.json();
  }

  async updatePlaylist(id: string, playlist: Omit<Playlist, 'id' | 'createdAt' | 'updatedAt' | 'songs'>): Promise<AdminApiResponse<Playlist>> {
    const response = await fetch(`${API_BASE}/admin/playlists/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(playlist),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update playlist');
    }
    
    return response.json();
  }

  async deletePlaylist(id: string): Promise<AdminApiResponse> {
    const response = await fetch(`${API_BASE}/admin/playlists/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete playlist');
    }
    
    return response.json();
  }

  // File upload
  async uploadFile(file: File): Promise<AdminApiResponse<{ filename: string; url: string }>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/admin/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload file');
    }

    return response.json();
  }
}

export const adminAPI = new AdminAPI();