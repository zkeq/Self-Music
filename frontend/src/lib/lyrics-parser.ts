// 歌词解析工具函数
export interface LyricLine {
  time: number;
  text: string;
}

export function parseLRC(lrcContent: string): LyricLine[] {
  const lines = lrcContent.split('\n');
  const lyrics: LyricLine[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // 匹配时间标签格式 [mm:ss.xx]
    const timeMatch = trimmedLine.match(/\[(\d{2}):(\d{2})\.(\d{2})\](.*)/);
    
    if (timeMatch) {
      const minutes = parseInt(timeMatch[1]);
      const seconds = parseInt(timeMatch[2]);
      const centiseconds = parseInt(timeMatch[3]);
      const text = timeMatch[4].trim();
      
      const time = minutes * 60 + seconds + centiseconds / 100;
      
      if (text) { // 只添加有文本内容的行
        lyrics.push({ time, text });
      }
    }
  }

  // 按时间排序
  return lyrics.sort((a, b) => a.time - b.time);
}

export function getCurrentLyricIndex(lyrics: LyricLine[], currentTime: number): number {
  for (let i = lyrics.length - 1; i >= 0; i--) {
    if (currentTime >= lyrics[i].time) {
      return i;
    }
  }
  return -1;
}

export function getNextLyricTime(lyrics: LyricLine[], currentIndex: number): number | null {
  if (currentIndex >= 0 && currentIndex < lyrics.length - 1) {
    return lyrics[currentIndex + 1].time;
  }
  return null;
}