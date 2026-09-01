/**
 * 生成分享链接并复制到剪贴板
 */

/**
 * 生成歌曲播放链接
 * @param songId 歌曲 ID
 * @returns 完整的播放链接 URL
 */
export function getSongShareUrl(songId: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/play?music=${encodeURIComponent(songId)}`;
}

/**
 * 生成歌单播放链接
 * @param playlistId 歌单 ID
 * @returns 完整的播放链接 URL
 */
export function getPlaylistShareUrl(playlistId: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/play?playlist=${encodeURIComponent(playlistId)}`;
}

/**
 * 生成心情页面链接
 * @param moodId 心情 ID
 * @returns 完整的心情页面链接 URL
 */
export function getMoodShareUrl(moodId: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/mood/${encodeURIComponent(moodId)}`;
}

/**
 * 生成歌手页面链接
 * @param artistId 歌手 ID
 * @returns 完整的歌手页面链接 URL
 */
export function getArtistShareUrl(artistId: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/artist/${encodeURIComponent(artistId)}`;
}

/**
 * 将链接复制到剪贴板
 * @param url 要复制的链接
 * @returns 是否复制成功
 */
export async function copyShareLink(url: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch (err) {
    console.error('Failed to copy link:', err);
    // 降级方案：使用 document.execCommand
    try {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch (e) {
      console.error('Fallback copy failed:', e);
      return false;
    }
  }
}
