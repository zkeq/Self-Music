export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  file_path: string;
  cover_url?: string;
  lyrics_url?: string;
  mood_tags?: string[];
  created_at: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  cover_url?: string;
  songs: Song[];
  created_at: string;
  updated_at: string;
}

export interface LyricLine {
  time: number;
  text: string;
}

export interface Lyrics {
  song_id: string;
  lines: LyricLine[];
}

export interface MoodTag {
  id: string;
  name: string;
  color: string;
  description?: string;
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

export interface UploadResponse {
  success: boolean;
  song?: Song;
  message?: string;
}