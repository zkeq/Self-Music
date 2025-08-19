const CACHE_NAME = 'music-cache-v1';
const MUSIC_CACHE_NAME = 'music-files-v1';
const COVER_CACHE_NAME = 'cover-images-v1';

// 音乐文件匹配模式
const MUSIC_FILE_PATTERNS = [
  /\/api\/songs\/\d+\/stream/,  // 后端音乐流接口
  /\.(mp3|wav|flac|aac|ogg|m4a)(\?.*)?$/i,  // 音乐文件扩展名（支持URL参数）
];

// 封面图片匹配模式
const COVER_IMAGE_PATTERNS = [
  /\/api\/albums\/\d+\/cover/,  // 专辑封面接口
  /\/api\/artists\/\d+\/cover/,  // 艺人头像接口
  /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i,  // 所有图片文件（支持URL参数）
];

// 检查是否是音乐文件请求
function isMusicFile(url) {
  return MUSIC_FILE_PATTERNS.some(pattern => pattern.test(url));
}

// 检查是否是封面图片请求
function isCoverImage(url) {
  return COVER_IMAGE_PATTERNS.some(pattern => pattern.test(url));
}

// Service Worker 安装事件
self.addEventListener('install', (event) => {
  console.log('Service Worker 安装中...');
  // 强制激活新的 Service Worker
  self.skipWaiting();
});

// Service Worker 激活事件
self.addEventListener('activate', (event) => {
  console.log('Service Worker 激活中...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // 清理旧版本的缓存，但保留音乐文件和封面缓存
          if (cacheName !== CACHE_NAME && cacheName !== MUSIC_CACHE_NAME && cacheName !== COVER_CACHE_NAME) {
            console.log('删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // 确保新的 Service Worker 立即控制所有页面
      return self.clients.claim();
    })
  );
});

// 拦截网络请求
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  
  // 只处理 GET 请求
  if (event.request.method !== 'GET') {
    return;
  }
  
  // 检查是否是音乐文件
  if (isMusicFile(url)) {
    event.respondWith(handleMusicFileRequest(event.request));
  } 
  // 检查是否是封面图片
  else if (isCoverImage(url)) {
    event.respondWith(handleCoverImageRequest(event.request));
  } 
  else {
    // 对于非音乐文件和封面图片，使用网络优先策略（确保静态资源是最新的）
    event.respondWith(handleNonMusicRequest(event.request));
  }
});

// 处理音乐文件请求 - 缓存优先策略
async function handleMusicFileRequest(request) {
  try {
    // 首先检查缓存
    const cache = await caches.open(MUSIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('从缓存返回音乐文件:', request.url);
      return cachedResponse;
    }
    
    // 缓存中没有，从网络获取
    console.log('从网络获取音乐文件:', request.url);
    const networkResponse = await fetch(request);
    
    // 只缓存成功的响应
    if (networkResponse.ok) {
      // 克隆响应用于缓存
      const responseToCache = networkResponse.clone();
      await cache.put(request, responseToCache);
      console.log('音乐文件已缓存:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('音乐文件请求失败:', error);
    // 如果网络失败，尝试返回缓存的版本
    const cache = await caches.open(MUSIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// 处理封面图片请求 - 缓存优先策略
async function handleCoverImageRequest(request) {
  try {
    // 首先检查缓存
    const cache = await caches.open(COVER_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('从缓存返回封面图片:', request.url);
      return cachedResponse;
    }
    
    // 缓存中没有，从网络获取
    console.log('从网络获取封面图片:', request.url);
    const networkResponse = await fetch(request);
    
    // 只缓存成功的响应
    if (networkResponse.ok) {
      // 克隆响应用于缓存
      const responseToCache = networkResponse.clone();
      await cache.put(request, responseToCache);
      console.log('封面图片已缓存:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('封面图片请求失败:', error);
    // 如果网络失败，尝试返回缓存的版本
    const cache = await caches.open(COVER_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('网络失败，从缓存返回封面图片:', request.url);
      return cachedResponse;
    }
    throw error;
  }
}

// 处理非音乐文件请求 - 网络优先策略
async function handleNonMusicRequest(request) {
  try {
    // 对于静态资源，直接从网络获取以确保是最新的
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.error('网络请求失败:', error);
    throw error;
  }
}

// 监听来自页面的消息
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // 清理音乐缓存的消息处理
  if (event.data && event.data.type === 'CLEAR_MUSIC_CACHE') {
    event.waitUntil(
      caches.delete(MUSIC_CACHE_NAME).then(() => {
        console.log('音乐缓存已清理');
        event.ports[0].postMessage({ success: true });
      })
    );
  }
  
  // 清理封面缓存的消息处理
  if (event.data && event.data.type === 'CLEAR_COVER_CACHE') {
    event.waitUntil(
      caches.delete(COVER_CACHE_NAME).then(() => {
        console.log('封面缓存已清理');
        event.ports[0].postMessage({ success: true });
      })
    );
  }
  
  // 清理所有缓存
  if (event.data && event.data.type === 'CLEAR_ALL_CACHE') {
    event.waitUntil(
      Promise.all([
        caches.delete(MUSIC_CACHE_NAME),
        caches.delete(COVER_CACHE_NAME)
      ]).then(() => {
        console.log('所有缓存已清理');
        event.ports[0].postMessage({ success: true });
      })
    );
  }
  
  // 获取缓存统计信息
  if (event.data && event.data.type === 'GET_CACHE_STATS') {
    event.waitUntil(
      getCacheStats().then((stats) => {
        event.ports[0].postMessage(stats);
      })
    );
  }
});

// 获取缓存统计信息
async function getCacheStats() {
  try {
    const musicCache = await caches.open(MUSIC_CACHE_NAME);
    const coverCache = await caches.open(COVER_CACHE_NAME);
    
    const musicKeys = await musicCache.keys();
    const coverKeys = await coverCache.keys();
    
    return {
      musicCacheSize: musicKeys.length,
      coverCacheSize: coverKeys.length,
      totalCacheSize: musicKeys.length + coverKeys.length,
      musicEntries: musicKeys.map(req => req.url),
      coverEntries: coverKeys.map(req => req.url)
    };
  } catch (error) {
    console.error('获取缓存统计失败:', error);
    return { 
      musicCacheSize: 0, 
      coverCacheSize: 0,
      totalCacheSize: 0,
      musicEntries: [],
      coverEntries: []
    };
  }
}