// NetEase Cloud Music API Service
// Using the specified domain: https://music-api-for-ncm.onmicrosoft.cn/api/

export interface NeteaseSearchResult {
  ar: number[];
  arName: string[];
  name: string;
  albumName: string;
  albumId: number;
  source: string;
  interval: string;
  songId: number;
  img: string;
  lrc: string | null;
}

export interface NeteaseSearchResponse {
  list: NeteaseSearchResult[];
}

export interface NeteaseAlbumInfo {
  cover_url: string;
  title: string;
  artist: string;
  release_time: string;
  company: string;
  description: string;
}

export interface NeteaseArtistInfo {
  name: string;
  artist_id: string;
  artist_url: string;
  intro: string;
  home_url: string;
  avatar_url: string;
  fan_count: string;
}

export interface NeteaseLyricsResponse {
  lyric: string;
  tlyric: string;
  rlyric: string;
  lxlyric: string;
}

class NeteaseAPI {
  private readonly baseUrl = 'https://music-api-for-ncm.onmicrosoft.cn/api';

  // 搜索歌曲
  async searchSongs(query: string): Promise<NeteaseSearchResponse> {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(`${this.baseUrl}/search/${encodedQuery}`);
    
    if (!response.ok) {
      throw new Error(`搜索失败: ${response.status}`);
    }
    
    return response.json();
  }

  // 获取专辑信息
  async getAlbumInfo(albumId: number): Promise<NeteaseAlbumInfo> {
    const response = await fetch(`${this.baseUrl}/album/${albumId}`);
    
    if (!response.ok) {
      throw new Error(`获取专辑信息失败: ${response.status}`);
    }
    
    return response.json();
  }

  // 获取艺术家信息
  async getArtistInfo(artistId: number): Promise<NeteaseArtistInfo> {
    const response = await fetch(`${this.baseUrl}/artist/${artistId}`);
    
    if (!response.ok) {
      throw new Error(`获取艺术家信息失败: ${response.status}`);
    }
    
    return response.json();
  }

  // 获取歌词
  async getLyrics(songId: number): Promise<NeteaseLyricsResponse> {
    const response = await fetch(`${this.baseUrl}/lyric/${songId}`);
    
    if (!response.ok) {
      throw new Error(`获取歌词失败: ${response.status}`);
    }
    
    return response.json();
  }

  // 从URL中提取搜索关键词
  extractSearchTermFromUrl(url: string): string {
    try {
      // 移除URL前缀，获取最后的部分作为搜索关键词
      const parts = url.split('/');
      let lastPart = parts[parts.length - 1];
      
      // 解码URL编码的字符
      lastPart = decodeURIComponent(lastPart);
      
      // 删除文件后缀名（如 .mp3, .flac, .wav, .m4a 等）
      lastPart = lastPart.replace(/\.(mp3|flac|wav|m4a|ogg|aac|wma)$/i, '');
      
      return lastPart;
    } catch (error) {
      // 如果解码失败，返回原始的最后部分（也删除后缀名）
      const parts = url.split('/');
      let lastPart = parts[parts.length - 1];
      
      // 删除文件后缀名
      lastPart = lastPart.replace(/\.(mp3|flac|wav|m4a|ogg|aac|wma)$/i, '');
      
      return lastPart;
    }
  }

  // 解析时长字符串（如 "04:13"）为秒数
  parseDuration(interval: string): number {
    try {
      const parts = interval.split(':');
      if (parts.length === 2) {
        const minutes = parseInt(parts[0], 10);
        const seconds = parseInt(parts[1], 10);
        return minutes * 60 + seconds;
      }
      return 0;
    } catch {
      return 0;
    }
  }

  // 格式化时长为字符串
  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}

export const neteaseAPI = new NeteaseAPI();