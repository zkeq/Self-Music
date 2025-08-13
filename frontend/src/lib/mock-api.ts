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
import { 
  mockArtists, 
  mockAlbums, 
  mockSongs, 
  mockPlaylists, 
  mockMoods, 
  mockApiResponses 
} from './mock-data';

// Mock API delay for realistic experience
const mockDelay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API Client
class MockApiClient {
  // Artists API
  async getArtists(page = 1, limit = 20): Promise<ApiResponse<PaginatedResponse<Artist>>> {
    await mockDelay();
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = mockArtists.slice(start, end);
    
    return {
      success: true,
      data: {
        data: paginatedData,
        total: mockArtists.length,
        page,
        limit,
        totalPages: Math.ceil(mockArtists.length / limit),
      },
    };
  }

  async getArtist(id: string): Promise<ApiResponse<Artist>> {
    await mockDelay();
    const artist = mockArtists.find(a => a.id === id);
    
    if (!artist) {
      return {
        success: false,
        error: 'Artist not found',
      };
    }
    
    return {
      success: true,
      data: artist,
    };
  }

  async getArtistSongs(id: string): Promise<ApiResponse<Song[]>> {
    await mockDelay();
    const songs = mockSongs.filter(s => s.artistId === id);
    
    return {
      success: true,
      data: songs,
    };
  }

  async getArtistAlbums(id: string): Promise<ApiResponse<Album[]>> {
    await mockDelay();
    const albums = mockAlbums.filter(a => a.artistId === id);
    
    return {
      success: true,
      data: albums,
    };
  }

  // Albums API
  async getAlbums(page = 1, limit = 20): Promise<ApiResponse<PaginatedResponse<Album>>> {
    await mockDelay();
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = mockAlbums.slice(start, end);
    
    return {
      success: true,
      data: {
        data: paginatedData,
        total: mockAlbums.length,
        page,
        limit,
        totalPages: Math.ceil(mockAlbums.length / limit),
      },
    };
  }

  async getAlbum(id: string): Promise<ApiResponse<Album>> {
    await mockDelay();
    const album = mockAlbums.find(a => a.id === id);
    
    if (!album) {
      return {
        success: false,
        error: 'Album not found',
      };
    }
    
    return {
      success: true,
      data: album,
    };
  }

  async getAlbumSongs(id: string): Promise<ApiResponse<Song[]>> {
    await mockDelay();
    const songs = mockSongs.filter(s => s.albumId === id);
    
    return {
      success: true,
      data: songs,
    };
  }

  // Songs API
  async getSongs(page = 1, limit = 20): Promise<ApiResponse<PaginatedResponse<Song>>> {
    await mockDelay();
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = mockSongs.slice(start, end);
    
    return {
      success: true,
      data: {
        data: paginatedData,
        total: mockSongs.length,
        page,
        limit,
        totalPages: Math.ceil(mockSongs.length / limit),
      },
    };
  }

  async getSong(id: string): Promise<ApiResponse<Song>> {
    await mockDelay();
    const song = mockSongs.find(s => s.id === id);
    
    if (!song) {
      return {
        success: false,
        error: 'Song not found',
      };
    }
    
    return {
      success: true,
      data: song,
    };
  }

  // Playlists API
  async getPlaylists(page = 1, limit = 20): Promise<ApiResponse<PaginatedResponse<Playlist>>> {
    await mockDelay();
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = mockPlaylists.slice(start, end);
    
    return {
      success: true,
      data: {
        data: paginatedData,
        total: mockPlaylists.length,
        page,
        limit,
        totalPages: Math.ceil(mockPlaylists.length / limit),
      },
    };
  }

  async getPlaylist(id: string): Promise<ApiResponse<Playlist>> {
    await mockDelay();
    const playlist = mockPlaylists.find(p => p.id === id);
    
    if (!playlist) {
      return {
        success: false,
        error: 'Playlist not found',
      };
    }
    
    return {
      success: true,
      data: playlist,
    };
  }

  async createPlaylist(playlist: Partial<Playlist>): Promise<ApiResponse<Playlist>> {
    await mockDelay();
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name: playlist.name || 'New Playlist',
      description: playlist.description || '',
      coverUrl: playlist.coverUrl || '',
      songs: [],
      songIds: [],
      songCount: 0,
      playCount: 0,
      duration: 0,
      creator: playlist.creator || 'User',
      isPublic: playlist.isPublic || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockPlaylists.push(newPlaylist);
    
    return {
      success: true,
      data: newPlaylist,
    };
  }

  async updatePlaylist(id: string, playlist: Partial<Playlist>): Promise<ApiResponse<Playlist>> {
    await mockDelay();
    const index = mockPlaylists.findIndex(p => p.id === id);
    
    if (index === -1) {
      return {
        success: false,
        error: 'Playlist not found',
      };
    }
    
    mockPlaylists[index] = {
      ...mockPlaylists[index],
      ...playlist,
      updatedAt: new Date().toISOString(),
    };
    
    return {
      success: true,
      data: mockPlaylists[index],
    };
  }

  async deletePlaylist(id: string): Promise<ApiResponse<void>> {
    await mockDelay();
    const index = mockPlaylists.findIndex(p => p.id === id);
    
    if (index === -1) {
      return {
        success: false,
        error: 'Playlist not found',
      };
    }
    
    mockPlaylists.splice(index, 1);
    
    return {
      success: true,
    };
  }

  async addSongToPlaylist(playlistId: string, songId: string): Promise<ApiResponse<void>> {
    await mockDelay();
    const playlist = mockPlaylists.find(p => p.id === playlistId);
    const song = mockSongs.find(s => s.id === songId);
    
    if (!playlist || !song) {
      return {
        success: false,
        error: 'Playlist or song not found',
      };
    }
    
    if (!playlist.songIds.includes(songId)) {
      playlist.songs.push(song);
      playlist.songIds.push(songId);
      playlist.songCount = playlist.songs.length;
      playlist.duration = playlist.songs.reduce((total, s) => total + s.duration, 0);
      playlist.updatedAt = new Date().toISOString();
    }
    
    return {
      success: true,
    };
  }

  async removeSongFromPlaylist(playlistId: string, songId: string): Promise<ApiResponse<void>> {
    await mockDelay();
    const playlist = mockPlaylists.find(p => p.id === playlistId);
    
    if (!playlist) {
      return {
        success: false,
        error: 'Playlist not found',
      };
    }
    
    playlist.songs = playlist.songs.filter(s => s.id !== songId);
    playlist.songIds = playlist.songIds.filter(id => id !== songId);
    playlist.songCount = playlist.songs.length;
    playlist.duration = playlist.songs.reduce((total, s) => total + s.duration, 0);
    playlist.updatedAt = new Date().toISOString();
    
    return {
      success: true,
    };
  }

  // Moods API
  async getMoods(): Promise<ApiResponse<Mood[]>> {
    await mockDelay();
    return {
      success: true,
      data: mockMoods,
    };
  }

  async getMood(id: string): Promise<ApiResponse<Mood>> {
    await mockDelay();
    const mood = mockMoods.find(m => m.id === id);
    
    if (!mood) {
      return {
        success: false,
        error: 'Mood not found',
      };
    }
    
    return {
      success: true,
      data: mood,
    };
  }

  async getMoodSongs(id: string): Promise<ApiResponse<Song[]>> {
    await mockDelay();
    const songs = mockSongs.filter(s => s.moodIds.includes(id));
    
    return {
      success: true,
      data: songs,
    };
  }

  // Search API
  async search(query: string): Promise<ApiResponse<SearchResult>> {
    await mockDelay();
    const lowerQuery = query.toLowerCase();
    
    const songs = mockSongs.filter(s => 
      s.title.toLowerCase().includes(lowerQuery) || 
      s.artist.name.toLowerCase().includes(lowerQuery) ||
      s.genre?.toLowerCase().includes(lowerQuery)
    );
    
    const artists = mockArtists.filter(a => 
      a.name.toLowerCase().includes(lowerQuery) ||
      a.bio?.toLowerCase().includes(lowerQuery) ||
      a.genres.some(g => g.toLowerCase().includes(lowerQuery))
    );
    
    const albums = mockAlbums.filter(a => 
      a.title.toLowerCase().includes(lowerQuery) ||
      a.artist.name.toLowerCase().includes(lowerQuery) ||
      a.genre?.toLowerCase().includes(lowerQuery)
    );
    
    const playlists = mockPlaylists.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description?.toLowerCase().includes(lowerQuery)
    );
    
    return {
      success: true,
      data: {
        songs,
        artists,
        albums,
        playlists,
      },
    };
  }

  // Recommendations API
  async getRecommendations(params: RecommendationParams = {}): Promise<ApiResponse<Song[]>> {
    await mockDelay();
    let songs = [...mockSongs];
    
    // Filter by mood if specified
    if (params.moodId) {
      songs = songs.filter(s => s.moodIds.includes(params.moodId!));
    }
    
    // Filter by artist if specified
    if (params.artistId) {
      songs = songs.filter(s => s.artistId === params.artistId);
    }
    
    // Sort by type
    switch (params.type) {
      case 'hot':
        songs.sort((a, b) => b.playCount - a.playCount);
        break;
      case 'new':
        songs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'trending':
        songs.sort((a, b) => b.playCount - a.playCount);
        break;
      default:
        songs.sort(() => Math.random() - 0.5); // Random shuffle
    }
    
    // Apply limit
    if (params.limit) {
      songs = songs.slice(0, params.limit);
    }
    
    return {
      success: true,
      data: songs,
    };
  }

  async getSimilarSongs(songId: string, limit = 10): Promise<ApiResponse<Song[]>> {
    await mockDelay();
    const song = mockSongs.find(s => s.id === songId);
    
    if (!song) {
      return {
        success: false,
        error: 'Song not found',
      };
    }
    
    // Find similar songs based on mood and artist
    const similarSongs = mockSongs
      .filter(s => s.id !== songId)
      .filter(s => 
        s.artistId === song.artistId || 
        s.moodIds.some(mood => song.moodIds.includes(mood))
      )
      .slice(0, limit);
    
    return {
      success: true,
      data: similarSongs,
    };
  }

  async getTrendingSongs(limit = 20): Promise<ApiResponse<Song[]>> {
    await mockDelay();
    const trending = mockSongs
      .slice()
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, limit);
    
    return {
      success: true,
      data: trending,
    };
  }

  async getHotSongs(limit = 20): Promise<ApiResponse<Song[]>> {
    await mockDelay();
    const hot = mockSongs
      .slice()
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, limit);
    
    return {
      success: true,
      data: hot,
    };
  }

  async getNewSongs(limit = 20): Promise<ApiResponse<Song[]>> {
    await mockDelay();
    const newSongs = mockSongs
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
    
    return {
      success: true,
      data: newSongs,
    };
  }
}

// Export singleton instance for mock API
export const mockApi = new MockApiClient();

// Export individual mock API functions
export const {
  getArtists: mockGetArtists,
  getArtist: mockGetArtist,
  getArtistSongs: mockGetArtistSongs,
  getArtistAlbums: mockGetArtistAlbums,
  getAlbums: mockGetAlbums,
  getAlbum: mockGetAlbum,
  getAlbumSongs: mockGetAlbumSongs,
  getSongs: mockGetSongs,
  getSong: mockGetSong,
  getPlaylists: mockGetPlaylists,
  getPlaylist: mockGetPlaylist,
  createPlaylist: mockCreatePlaylist,
  updatePlaylist: mockUpdatePlaylist,
  deletePlaylist: mockDeletePlaylist,
  addSongToPlaylist: mockAddSongToPlaylist,
  removeSongFromPlaylist: mockRemoveSongFromPlaylist,
  getMoods: mockGetMoods,
  getMood: mockGetMood,
  getMoodSongs: mockGetMoodSongs,
  search: mockSearch,
  getRecommendations: mockGetRecommendations,
  getSimilarSongs: mockGetSimilarSongs,
  getTrendingSongs: mockGetTrendingSongs,
  getHotSongs: mockGetHotSongs,
  getNewSongs: mockGetNewSongs,
} = mockApi;