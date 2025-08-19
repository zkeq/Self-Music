/**
 * 图片优化工具函数
 * 为网易云音乐图片URL添加尺寸参数以提高加载速度
 */

/**
 * 为网易云音乐图片URL添加尺寸参数
 * @param url 原始图片URL
 * @param size 目标尺寸 (宽度x高度，如 "130y130")
 * @returns 优化后的图片URL
 */
export function optimizeImageUrl(url: string | undefined | null, size: string): string {
  if (!url) return '';
  
  // 检查是否是网易云音乐的图片URL
  if (url.includes('music.126.net') || url.includes('p1.music.126.net') || url.includes('p2.music.126.net')) {
    // 如果URL已经包含param参数，先移除
    const baseUrl = url.split('?')[0];
    return `${baseUrl}?param=${size}`;
  }
  
  // 非网易云音乐图片直接返回原URL
  return url;
}

/**
 * 预定义的图片尺寸
 */
export const IMAGE_SIZES = {
  // 小图标 (32x32)
  ICON_SMALL: '32y32',
  // 中等图标 (48x48) - 底部播放器小图
  ICON_MEDIUM: '48y48',
  // 大图标 (56x56) - 歌曲卡片、底部播放器大图
  ICON_LARGE: '56y56',
  // 小卡片 (64x64) - 管理页面表格
  CARD_SMALL: '64y64',
  // 中等卡片 (130x130) - 默认卡片尺寸
  CARD_MEDIUM: '130y130',
  // 大卡片 (144x144) - 播放列表卡片
  CARD_LARGE: '144y144',
  // 专辑封面 (200x200) - 专辑页面
  ALBUM_COVER: '200y200',
  // 播放页面 (300x300) - 全屏播放
  PLAYER_COVER: '300y300',
  // 高清封面 (500x500) - 详情页面
  COVER_HD: '500y500',
} as const;

/**
 * 根据显示上下文获取优化的图片URL
 */
export function getOptimizedImageUrl(url: string | undefined | null, context: keyof typeof IMAGE_SIZES): string {
  return optimizeImageUrl(url, IMAGE_SIZES[context]);
}