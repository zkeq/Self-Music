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
}

export interface Album {
  id: string;
  title: string;
  artist: Artist;
  artistId: string;
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
  artist: Artist;
  artistId: string;
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
  type?: 'hot' | 'new' | 'trending' | 'similar';
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