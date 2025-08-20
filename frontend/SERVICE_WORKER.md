# Service Worker Implementation - Self-Music

## Overview

This implementation provides a comprehensive high-availability Service Worker for the Self-Music platform, addressing all requirements from issue #35.

## Cache Strategies

### 1. Audio Files
- **Strategy**: Cache-first
- **Duration**: 2 months (60 days)
- **Cache Name**: `self-music-audio-v1.0.0`
- **Pattern**: `/api/songs/{id}/stream`
- **Behavior**: 
  - First check cache, serve immediately if available
  - If not cached or expired, fetch from network
  - Cache successful responses for future use
  - On network failure, serve stale cache if available

### 2. Cover Images
- **Strategy**: Cache-first  
- **Duration**: 2 months (60 days)
- **Cache Name**: `self-music-images-v1.0.0`
- **Pattern**: Cover URLs and image assets
- **Behavior**: Same as audio files

### 3. Static Assets
- **Strategy**: Stale-while-revalidate
- **Duration**: 6 hours
- **Cache Name**: `self-music-static-v1.0.0`
- **Pattern**: JS, CSS, HTML files, `_next/*`
- **Behavior**:
  - Serve from cache immediately if available
  - Update cache in background
  - Ensure users always get fast responses
  - Automatic updates without user intervention

### 4. API Requests
- **Strategy**: Network-first
- **Duration**: 5 minutes
- **Cache Name**: `self-music-api-v1.0.0`
- **Pattern**: `/api/*` (excluding audio streams)
- **Behavior**:
  - Try network first for fresh data
  - Fall back to cache on network failure
  - Short cache duration for data freshness

## Key Features

### ✅ No Error Failed Pages
- Comprehensive error handling for all request types
- Graceful fallbacks to cached content
- Automatic redirect to offline page for navigation failures
- Service worker intercepts all network errors

### ✅ Real-time Static File Updates
- Stale-while-revalidate strategy ensures immediate responses
- Background updates keep content fresh
- Cache versioning prevents conflicts
- Automatic cleanup of old cache versions

### ✅ Long-term Media Caching
- 2-month cache for audio and images reduces bandwidth
- Cache-first strategy for optimal offline experience
- Intelligent cache expiration tracking
- Automatic preloading of currently playing songs

### ✅ Streaming Preservation
- Audio streaming URLs properly detected and cached
- Environment-aware URL construction
- No interference with existing audio playback
- Seamless integration with existing audio manager

### ✅ Offline-first Experience
- Essential resources pre-cached on install
- Offline page with cache status information
- Cache management interface at `/cache`
- Preload manager for playlist optimization

## File Structure

```
frontend/
├── public/
│   └── sw.js                     # Main service worker
├── src/
│   ├── components/
│   │   ├── pwa-provider.tsx      # Service worker registration
│   │   ├── cache-status-panel.tsx # Cache management UI
│   │   ├── preload-manager.tsx   # Playlist preloading
│   │   └── install-prompt.tsx    # Enhanced PWA install
│   ├── lib/
│   │   └── cache-manager.ts      # Cache utility interface
│   └── app/
│       ├── cache/
│       │   └── page.tsx          # Cache management page
│       └── offline/
│           └── page.tsx          # Enhanced offline page
```

## Usage

### Automatic Caching
Songs are automatically cached when played:
```typescript
// Audio manager integration
cacheManager.preloadSong({
  id: currentSong.id,
  audioUrl: audioUrl,
  coverUrl: currentSong.coverUrl
});
```

### Manual Cache Management
```typescript
import { cacheManager } from '@/lib/cache-manager';

// Cache specific resources
await cacheManager.cacheAudio('/api/songs/123/stream');
await cacheManager.cacheImage('/covers/album.jpg');

// Preload playlist
await cacheManager.preloadPlaylist(songs);

// Clear caches
await cacheManager.clearCache('audio');
await cacheManager.clearAllCaches();

// Get cache status
const status = await cacheManager.getCacheStatus();
```

### Cache Management UI
- Visit `/cache` for comprehensive cache management
- View cache sizes and item counts
- Clear specific cache types
- Monitor online/offline status

## Service Worker Messaging

The service worker responds to these message types:

- `CACHE_AUDIO` - Preemptively cache audio file
- `CACHE_IMAGE` - Preemptively cache image
- `CLEAR_CACHE` - Clear specific cache type
- `CLEAR_ALL_CACHES` - Clear all caches
- `GET_CACHE_STATUS` - Return cache statistics

## Configuration

### Cache Versions
Update `CACHE_VERSION` in `sw.js` to force cache refresh:
```javascript
const CACHE_VERSION = '1.0.0';
```

### Cache Durations
Modify durations in `CACHE_DURATIONS`:
```javascript
const CACHE_DURATIONS = {
  static: 6 * 60 * 60 * 1000,        // 6 hours
  audio: 60 * 24 * 60 * 60 * 1000,   // 2 months  
  images: 60 * 24 * 60 * 60 * 1000,  // 2 months
  api: 5 * 60 * 1000                 // 5 minutes
};
```

### Essential Cache URLs
Essential files cached on install:
```javascript
const ESSENTIAL_CACHE_URLS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icon.png'
];
```

## Environment Configuration

### Development
- Service worker loads from `/sw.js`
- Audio URLs default to `localhost:8000`
- Real-time updates and debugging

### Production
- Set `NEXT_PUBLIC_API_URL` environment variable
- Cache headers configured in `next.config.ts`
- Optimized cache strategies

## Browser Support

- **Chrome/Edge**: Full support including background sync
- **Firefox**: Full support with service worker APIs
- **Safari**: Full support with webkit optimizations
- **Mobile**: PWA installation and offline functionality

## Monitoring

### Cache Status
```typescript
const status = await cacheManager.getCacheStatus();
console.log(status);
// {
//   static: 15,   // 15 static files cached
//   audio: 8,     // 8 audio files cached  
//   images: 12,   // 12 images cached
//   api: 5        // 5 API responses cached
// }
```

### Performance
- Background cache updates don't block UI
- Intelligent preloading prevents cache thrashing
- Automatic cleanup of expired content
- Memory-efficient cache management

## Security

- Service worker scope limited to current origin
- No external resource caching without validation
- Automatic cleanup prevents cache bloat
- Secure cache key generation

## Testing

### Manual Testing
1. Load the app and play songs
2. Go offline (disable network)
3. Verify songs continue playing
4. Check `/offline` page functionality
5. Test cache management at `/cache`

### Browser DevTools
1. Application tab → Service Workers
2. Application tab → Storage → Cache Storage
3. Network tab → Offline simulation
4. Console for service worker logs

## Troubleshooting

### Service Worker Not Loading
- Check browser console for registration errors
- Verify `/sw.js` is accessible
- Check HTTPS requirement in production

### Cache Not Working
- Verify service worker is active
- Check cache API browser support
- Monitor network requests in DevTools

### Audio Streaming Issues
- Verify audio URL construction
- Check CORS headers on backend
- Monitor service worker fetch logs

---

This implementation fully satisfies all requirements from issue #35, providing a robust, high-availability caching system that enhances the Self-Music platform's reliability and offline capabilities.