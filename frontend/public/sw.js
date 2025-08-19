const CACHE_NAME = 'self-music-v1';
const MUSIC_CACHE_NAME = 'music-files-v1';
const COVER_CACHE_NAME = 'cover-images-v1';

// 核心应用文件 - 需要预缓存以支持离线访问
const CORE_CACHE_URLS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icon.png'
];

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

// 静态资源匹配模式
const STATIC_RESOURCE_PATTERNS = [
  /\/_next\/static\//,  // Next.js 静态资源
  /\.(js|css|woff|woff2|ttf|eot)(\?.*)?$/i,  // JavaScript、CSS、字体文件
];

// 检查是否是音乐文件请求
function isMusicFile(url) {
  return MUSIC_FILE_PATTERNS.some(pattern => pattern.test(url));
}

// 检查是否是封面图片请求
function isCoverImage(url) {
  return COVER_IMAGE_PATTERNS.some(pattern => pattern.test(url));
}

// 检查是否是静态资源
function isStaticResource(url) {
  return STATIC_RESOURCE_PATTERNS.some(pattern => pattern.test(url));
}

// 检查是否是API请求
function isApiRequest(url) {
  return url.includes('/api/');
}

// Service Worker 安装事件
self.addEventListener('install', (event) => {
  console.log('Service Worker 安装中...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('预缓存核心文件...');
      return cache.addAll(CORE_CACHE_URLS);
    }).then(() => {
      // 强制激活新的 Service Worker
      return self.skipWaiting();
    })
  );
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
  const urlObj = new URL(url);
  
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
  // 检查是否是静态资源
  else if (isStaticResource(url)) {
    event.respondWith(handleStaticResourceRequest(event.request));
  }
  // 检查是否是HTML页面请求
  else if (!isApiRequest(url) && (urlObj.pathname.endsWith('/') || urlObj.pathname.match(/\.(html)$/))) {
    event.respondWith(handlePageRequest(event.request));
  }
  // API请求 - 网络优先，失败时返回离线提示
  else if (isApiRequest(url)) {
    event.respondWith(handleApiRequest(event.request));
  }
  // 其他请求 - 网络优先
  else {
    event.respondWith(handleOtherRequest(event.request));
  }
});

// 处理音乐文件请求 - 缓存优先策略
async function handleMusicFileRequest(request) {
  try {
    const cache = await caches.open(MUSIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('从缓存返回音乐文件:', request.url);
      return cachedResponse;
    }
    
    console.log('从网络获取音乐文件:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone();
      await cache.put(request, responseToCache);
      console.log('音乐文件已缓存:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('音乐文件请求失败:', error);
    const cache = await caches.open(MUSIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('网络失败，从缓存返回音乐文件:', request.url);
      return cachedResponse;
    }
    throw error;
  }
}

// 处理封面图片请求 - 缓存优先策略
async function handleCoverImageRequest(request) {
  try {
    const cache = await caches.open(COVER_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('从缓存返回封面图片:', request.url);
      return cachedResponse;
    }
    
    console.log('从网络获取封面图片:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone();
      await cache.put(request, responseToCache);
      console.log('封面图片已缓存:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('封面图片请求失败:', error);
    const cache = await caches.open(COVER_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('网络失败，从缓存返回封面图片:', request.url);
      return cachedResponse;
    }
    throw error;
  }
}

// 处理静态资源请求 - 缓存优先策略
async function handleStaticResourceRequest(request) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone();
      await cache.put(request, responseToCache);
    }
    
    return networkResponse;
  } catch (error) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// 处理页面请求 - 缓存优先，失败时返回离线页面
async function handlePageRequest(request) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone();
      await cache.put(request, responseToCache);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('页面请求失败，返回离线页面:', request.url);
    const cache = await caches.open(CACHE_NAME);
    const offlinePage = await cache.match('/offline');
    if (offlinePage) {
      return offlinePage;
    }
    
    // 如果连离线页面都没有缓存，返回基础的离线HTML
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Self-Music - 离线模式</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: sans-serif; text-align: center; padding: 2rem; background: #000; color: #fff; }
          h1 { color: #666; }
          p { color: #999; }
          button { padding: 0.5rem 1rem; background: #333; color: #fff; border: none; border-radius: 0.25rem; cursor: pointer; }
          button:hover { background: #555; }
        </style>
      </head>
      <body>
        <h1>离线模式</h1>
        <p>您当前处于离线状态。请检查网络连接后重试。</p>
        <p>已缓存的音乐仍可正常播放。</p>
        <button onclick="location.reload()">重新连接</button>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// 处理API请求 - 网络优先，失败时返回错误信息
async function handleApiRequest(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.log('API请求失败:', request.url);
    return new Response(JSON.stringify({
      error: 'offline',
      message: '当前处于离线状态，无法获取数据'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 处理其他请求 - 网络优先
async function handleOtherRequest(request) {
  try {
    return await fetch(request);
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
        caches.delete(CACHE_NAME),
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
    const appCache = await caches.open(CACHE_NAME);
    const musicCache = await caches.open(MUSIC_CACHE_NAME);
    const coverCache = await caches.open(COVER_CACHE_NAME);
    
    const appKeys = await appCache.keys();
    const musicKeys = await musicCache.keys();
    const coverKeys = await coverCache.keys();
    
    return {
      appCacheSize: appKeys.length,
      musicCacheSize: musicKeys.length,
      coverCacheSize: coverKeys.length,
      totalCacheSize: appKeys.length + musicKeys.length + coverKeys.length,
      appEntries: appKeys.map(req => req.url),
      musicEntries: musicKeys.map(req => req.url),
      coverEntries: coverKeys.map(req => req.url)
    };
  } catch (error) {
    console.error('获取缓存统计失败:', error);
    return { 
      appCacheSize: 0,
      musicCacheSize: 0, 
      coverCacheSize: 0,
      totalCacheSize: 0,
      appEntries: [],
      musicEntries: [],
      coverEntries: []
    };
  }
}