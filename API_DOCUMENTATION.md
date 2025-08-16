# Self-Music API 文档

## 概述

Self-Music API 是一个音乐流媒体平台的后端接口，提供艺术家、歌曲、专辑、歌单和心情标签的管理功能。

**基础URL:** `http://localhost:8000/api`

**数据格式:** JSON

**错误处理:** 所有响应都包含 `success` 字段，失败时包含 `error` 字段。

## 数据模型

### Artist (艺术家)
```typescript
interface Artist {
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
```

### Album (专辑)
```typescript
interface Album {
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
```

### Song (歌曲)
```typescript
interface Song {
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
```

### Playlist (歌单)
```typescript
interface Playlist {
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
```

### Mood (心情标签)
```typescript
interface Mood {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  coverUrl?: string;
  songCount: number;
  createdAt: string;
  updatedAt: string;
}
```

## API 端点

### 艺术家 (Artists)

#### 获取艺术家列表
```http
GET /artists?page=1&limit=20
```

**响应:**
```json
{
  "success": true,
  "data": {
    "data": [Artist],
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

#### 获取单个艺术家
```http
GET /artists/{id}
```

**响应:**
```json
{
  "success": true,
  "data": Artist
}
```

#### 获取艺术家的歌曲
```http
GET /artists/{id}/songs
```

**响应:**
```json
{
  "success": true,
  "data": [Song]
}
```

#### 获取艺术家的专辑
```http
GET /artists/{id}/albums
```

**响应:**
```json
{
  "success": true,
  "data": [Album]
}
```

### 专辑 (Albums)

#### 获取专辑列表
```http
GET /albums?page=1&limit=20
```

**响应:**
```json
{
  "success": true,
  "data": {
    "data": [Album],
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

#### 获取单个专辑
```http
GET /albums/{id}
```

**响应:**
```json
{
  "success": true,
  "data": Album
}
```

#### 获取专辑的歌曲
```http
GET /albums/{id}/songs
```

**响应:**
```json
{
  "success": true,
  "data": [Song]
}
```

### 歌曲 (Songs)

#### 获取歌曲列表
```http
GET /songs?page=1&limit=20
```

**响应:**
```json
{
  "success": true,
  "data": {
    "data": [Song],
    "total": 200,
    "page": 1,
    "limit": 20,
    "totalPages": 10
  }
}
```

#### 获取单个歌曲
```http
GET /songs/{id}
```

**响应:**
```json
{
  "success": true,
  "data": Song
}
```

#### 获取热门歌曲
```http
GET /hot/songs?limit=20
```

**响应:**
```json
{
  "success": true,
  "data": [Song]
}
```

#### 获取新歌曲
```http
GET /new/songs?limit=20
```

**响应:**
```json
{
  "success": true,
  "data": [Song]
}
```

#### 获取趋势歌曲
```http
GET /trending/songs?limit=20
```

**响应:**
```json
{
  "success": true,
  "data": [Song]
}
```

### 歌单 (Playlists)

#### 获取歌单列表
```http
GET /playlists?page=1&limit=20
```

**响应:**
```json
{
  "success": true,
  "data": {
    "data": [Playlist],
    "total": 30,
    "page": 1,
    "limit": 20,
    "totalPages": 2
  }
}
```

#### 获取单个歌单
```http
GET /playlists/{id}
```

**响应:**
```json
{
  "success": true,
  "data": Playlist
}
```

#### 创建歌单
```http
POST /playlists
```

**请求体:**
```json
{
  "name": "我的歌单",
  "description": "个人收藏",
  "isPublic": false
}
```

**响应:**
```json
{
  "success": true,
  "data": Playlist
}
```

#### 更新歌单
```http
PUT /playlists/{id}
```

**请求体:**
```json
{
  "name": "更新的歌单名称",
  "description": "更新的描述"
}
```

**响应:**
```json
{
  "success": true,
  "data": Playlist
}
```

#### 删除歌单
```http
DELETE /playlists/{id}
```

**响应:**
```json
{
  "success": true
}
```

#### 添加歌曲到歌单
```http
POST /playlists/{playlistId}/songs
```

**请求体:**
```json
{
  "songId": "song123"
}
```

**响应:**
```json
{
  "success": true
}
```

#### 从歌单移除歌曲
```http
DELETE /playlists/{playlistId}/songs/{songId}
```

**响应:**
```json
{
  "success": true
}
```

### 心情标签 (Moods)

#### 获取心情标签列表
```http
GET /moods
```

**响应:**
```json
{
  "success": true,
  "data": [Mood]
}
```

#### 获取单个心情标签
```http
GET /moods/{id}
```

**响应:**
```json
{
  "success": true,
  "data": Mood
}
```

#### 获取心情标签的歌曲
```http
GET /moods/{id}/songs
```

**响应:**
```json
{
  "success": true,
  "data": [Song]
}
```

### 搜索 (Search)

#### 全局搜索
```http
GET /search?q={query}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "songs": [Song],
    "artists": [Artist],
    "albums": [Album],
    "playlists": [Playlist]
  }
}
```

### 推荐 (Recommendations)

#### 获取推荐歌曲
```http
GET /recommendations?type=hot&limit=20&moodId=happy&artistId=artist123
```

**查询参数:**
- `type`: 推荐类型 (`hot`, `new`, `trending`, `similar`)
- `limit`: 限制数量 (默认: 20)
- `moodId`: 心情ID (可选)
- `artistId`: 艺术家ID (可选)

**响应:**
```json
{
  "success": true,
  "data": [Song]
}
```

#### 获取相似歌曲
```http
GET /songs/{songId}/similar?limit=10
```

**响应:**
```json
{
  "success": true,
  "data": [Song]
}
```

## 错误响应

所有API在出错时都会返回以下格式：

```json
{
  "success": false,
  "error": "错误描述信息"
}
```

### 常见错误代码

- `400` - 请求参数错误
- `404` - 资源不存在
- `500` - 服务器内部错误

## 示例用法

### 创建完整的音乐流程

1. **创建艺术家**
```http
POST /artists
{
  "name": "周杰伦",
  "bio": "华语流行音乐创作天王",
  "genres": ["华语流行", "R&B"]
}
```

2. **创建专辑**
```http
POST /albums
{
  "title": "十一月的萧邦",
  "artistId": "artist123",
  "releaseDate": "2005-11-01",
  "genre": "华语流行"
}
```

3. **创建歌曲**
```http
POST /songs
{
  "title": "夜曲",
  "artistId": "artist123",
  "albumId": "album123",
  "duration": 234,
  "audioUrl": "https://example.com/song.mp3",
  "lyrics": "[00:00.00]夜曲 - 周杰伦...",
  "moodIds": ["romantic", "melancholy"]
}
```

4. **创建歌单并添加歌曲**
```http
POST /playlists
{
  "name": "华语经典",
  "description": "经典华语歌曲合集",
  "isPublic": true
}

POST /playlists/{playlistId}/songs
{
  "songId": "song123"
}
```

## 数据同步建议

1. **艺术家优先**: 先创建艺术家，再创建专辑和歌曲
2. **关联维护**: 确保所有关联ID的一致性
3. **批量操作**: 支持批量创建和更新操作
4. **缓存策略**: 热门数据建议使用缓存
5. **分页查询**: 大量数据使用分页避免性能问题

## 环境变量配置

```env
# Mock API 开关
NEXT_PUBLIC_USE_MOCK=true

# 真实API地址
NEXT_PUBLIC_API_URL=http://localhost:8000/api

add test
```

当 `NEXT_PUBLIC_USE_MOCK=true` 或未设置 `NEXT_PUBLIC_API_URL` 时，前端会使用Mock数据。
