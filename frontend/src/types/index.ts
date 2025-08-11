export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  audioUrl?: string;
  fileUrl?: string; // 备用音频URL字段
  coverUrl?: string;
  lyricsUrl?: string;
  mood?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  songs: Song[];
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