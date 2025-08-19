export interface Artist {
  id: string;
  name: string;
  bio?: string;
  avatar?: string;
  coverUrl?: string;
  followers: number;
  songCount: number;
  albumCount?: number;
  genres: string[];
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  isPrimary?: boolean; // For multi-artist associations
}

export interface Album {
  id: string;
  title: string;
  artist: Artist; // Primary artist for backward compatibility
  artists?: Artist[]; // All artists
  artistId: string;
  artistIds?: string[]; // Multiple artist IDs
  coverUrl?: string;
  releaseDate: string;
  songCount: number;
  duration: number;
  genre?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Song {
  id: string;
  title: string;
  artist: Artist; // Primary artist for backward compatibility
  artists?: Artist[]; // All artists
  artistId: string;
  artistIds?: string[]; // Multiple artist IDs
  album?: Album;
  albumId?: string;
  duration: number;
  audioUrl?: string;
  coverUrl?: string;
  lyrics?: string;
  moods: Mood[];
  moodIds: string[];
  playCount: number;
  liked: boolean;
  genre?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  songs: Song[];
  songIds: string[];
  songCount: number;
  playCount: number;
  duration: number;
  creator: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LyricLine {
  time: number;
  text: string;
}

export interface Lyrics {
  songId: string;
  lines: LyricLine[];
}

export interface Mood {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  coverUrl?: string;
  songCount: number;
  songs?: Song[];
  createdAt: string;
  updatedAt: string;
}

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  playlist: Song[];
  currentIndex: number;
  repeatMode: 'none' | 'one' | 'all';
  shuffleMode: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface UploadResponse {
  success: boolean;
  data?: Song;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SearchResult {
  songs: Song[];
  artists: Artist[];
  albums: Album[];
  playlists: Playlist[];
}

export interface RecommendationParams {
  limit?: number;
  type?: 'hot' | 'new' | 'trending' | 'similar' | 'random';
  moodId?: string;
  artistId?: string;
  genreId?: string;
}

export interface User {
  id: string;
  username: string;
  role: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface AdminApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Utility functions for multi-artist support
export const formatArtistNames = (artists?: Artist[], maxNames = 2): string => {
  if (!artists || artists.length === 0) return 'Unknown Artist';
  
  if (artists.length === 1) {
    return artists[0].name;
  }
  
  if (artists.length <= maxNames) {
    return artists.map(a => a.name).join(', ');
  }
  
  const displayedArtists = artists.slice(0, maxNames);
  const remainingCount = artists.length - maxNames;
  return `${displayedArtists.map(a => a.name).join(', ')} & ${remainingCount} others`;
};

export const getPrimaryArtist = (song: Song | Album): Artist => {
  // If artists array exists, find primary artist or return first one
  if (song.artists && song.artists.length > 0) {
    const primary = song.artists.find(a => a.isPrimary);
    return primary || song.artists[0];
  }
  
  // Fallback to the single artist field
  return song.artist;
};

export const getAllArtistNames = (song: Song | Album): string => {
  if (song.artists && song.artists.length > 0) {
    return formatArtistNames(song.artists);
  }
  return song.artist?.name || 'Unknown Artist';
};

// Import related types
export interface ImportSearchItem {
  id: string;
  url: string;
  searchTerm: string;
  status: 'pending' | 'searching' | 'found' | 'detailed' | 'ready' | 'importing' | 'imported' | 'error';
  error?: string;
  searchResults?: ImportSongResult[];
  selectedResult?: ImportSongResult;
  detailedInfo?: ImportDetailedInfo;
  existsInDb?: boolean;
  originalUrl?: string; // 添加原始URL字段
}

export interface ImportSongResult {
  songId: number;
  name: string;
  ar: number[];  // 添加艺术家ID数组
  arName: string[];
  albumName: string;
  albumId: number;
  interval: string;
  img: string;
  duration: number; // parsed from interval
}

export interface ImportDetailedInfo {
  song: ImportSongResult;
  album: ImportAlbumInfo;
  artists: ImportArtistInfo[];
  lyrics: string;
}

export interface ImportAlbumInfo {
  id: number;
  title: string;
  artist: string;
  coverUrl: string;
  releaseDate: string;
  company?: string;
  description?: string;
}

export interface ImportArtistInfo {
  id: string;
  name: string;
  avatarUrl?: string;
  intro?: string;
  fanCount: string;
}

export interface ImportBatchRequest {
  items: ImportBatchItem[];
}

export interface ImportBatchItem {
  songInfo: ImportSongResult;
  albumInfo: ImportAlbumInfo;
  artistsInfo: ImportArtistInfo[];
  lyrics: string;
  audioUrl: string; // 添加音频URL字段
  skipIfExists: boolean;
}

export interface ImportBatchResponse {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
  details: ImportBatchResult[];
}

export interface ImportBatchResult {
  songId: number;
  status: 'imported' | 'skipped' | 'error';
  reason?: string;
  localId?: string; // ID in local database if imported
}