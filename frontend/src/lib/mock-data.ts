import type { Artist, Album, Song, Playlist, Mood } from '@/types';

// Mock Artists Data
export const mockArtists: Artist[] = [
  {
    id: '1',
    name: '周杰伦',
    bio: '华语流行音乐创作天王、制作人、导演',
    avatar: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    followers: 2800000,
    songCount: 42,
    albumCount: 15,
    genres: ['华语流行', 'R&B', '嘻哈'],
    verified: true,
    createdAt: '2000-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Ed Sheeran',
    bio: '英国创作型歌手，流行音乐代表人物',
    avatar: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
    coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
    followers: 4200000,
    songCount: 52,
    albumCount: 8,
    genres: ['流行', '民谣', '流行摇滚'],
    verified: true,
    createdAt: '2011-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Yiruma',
    bio: '韩国新世纪音乐钢琴家、作曲家',
    avatar: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
    followers: 1200000,
    songCount: 35,
    albumCount: 12,
    genres: ['新世纪', '古典', '钢琴'],
    verified: true,
    createdAt: '2001-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'Ludovico Einaudi',
    bio: '意大利当代古典音乐作曲家、钢琴家',
    avatar: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    followers: 980000,
    songCount: 68,
    albumCount: 20,
    genres: ['古典', '电影音乐', '极简主义'],
    verified: true,
    createdAt: '1996-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '5',
    name: '回春丹',
    bio: '中国民谣乐队，以治愈系音乐著称',
    avatar: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
    coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
    followers: 650000,
    songCount: 28,
    albumCount: 5,
    genres: ['民谣', '治愈', '独立音乐'],
    verified: true,
    createdAt: '2015-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  }
];

// Mock Albums Data
export const mockAlbums: Album[] = [
  {
    id: '1',
    title: '十一月的萧邦',
    artist: mockArtists[0], // 周杰伦
    artistId: '1',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    releaseDate: '2005-11-01',
    songCount: 12,
    duration: 3480,
    genre: '华语流行',
    description: '周杰伦第六张录音室专辑',
    createdAt: '2005-11-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'First Love',
    artist: mockArtists[2], // Yiruma
    artistId: '3',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
    releaseDate: '2001-05-01',
    songCount: 14,
    duration: 2940,
    genre: '新世纪',
    description: 'Yiruma的代表作专辑',
    createdAt: '2001-05-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  }
];

// Mock Moods Data
export const mockMoods: Mood[] = [
  {
    id: 'happy',
    name: '快乐',
    description: '充满活力和正能量的音乐',
    icon: 'Smile',
    color: 'from-yellow-400 to-orange-500',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    songCount: 124,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'relaxed',
    name: '放松',
    description: '舒缓心情，释放压力',
    icon: 'Coffee',
    color: 'from-green-400 to-blue-500',
    coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
    songCount: 87,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'energetic',
    name: '充满活力',
    description: '激发动力，提升能量',
    icon: 'Zap',
    color: 'from-red-400 to-pink-500',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
    songCount: 156,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'focus',
    name: '专注',
    description: '适合工作和学习的背景音乐',
    icon: 'Sun',
    color: 'from-purple-400 to-indigo-500',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    songCount: 93,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'melancholy',
    name: '忧郁',
    description: '情感深沉，触动内心',
    icon: 'CloudRain',
    color: 'from-gray-400 to-blue-600',
    coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
    songCount: 64,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'romantic',
    name: '浪漫',
    description: '温馨浪漫，情意绵绵',
    icon: 'Heart',
    color: 'from-pink-400 to-red-500',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
    songCount: 78,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  }
];

// Mock Songs Data
export const mockSongs: Song[] = [
  {
    id: '1',
    title: '鲜花',
    artist: mockArtists[4], // 回春丹
    artistId: '5',
    duration: 240,
    audioUrl: 'https://media.onmicrosoft.cn/%E5%9B%9E%E6%98%A5%E4%B8%B9%20-%20%E9%B2%9C%E8%8A%B1.flac',
    coverUrl: 'https://p1.music.126.net/fKJMTONzRMaeVthOmEvd9A==/109951168948248373.jpg',
    lyrics: `[00:00.00]鲜花 - 回春丹
[00:15.00]在这个春天里
[00:20.00]鲜花盛开着
[00:25.00]带着希望和美好
[00:30.00]装点着我们的生活`,
    moods: [mockMoods[0], mockMoods[1]], // 快乐, 放松
    moodIds: ['happy', 'relaxed'],
    playCount: 1240,
    liked: true,
    genre: '民谣',
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'River Flows in You',
    artist: mockArtists[2], // Yiruma
    artistId: '3',
    album: mockAlbums[1],
    albumId: '2',
    duration: 210,
    audioUrl: 'https://example.com/yiruma-river-flows.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
    lyrics: `[00:00.00]River Flows in You - Yiruma
[00:10.00]Instrumental`,
    moods: [mockMoods[1], mockMoods[5]], // 放松, 浪漫
    moodIds: ['relaxed', 'romantic'],
    playCount: 890,
    liked: false,
    genre: '新世纪',
    createdAt: '2023-02-10T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    title: 'Nuvole Bianche',
    artist: mockArtists[3], // Ludovico Einaudi
    artistId: '4',
    duration: 360,
    audioUrl: 'https://example.com/einaudi-nuvole-bianche.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    lyrics: `[00:00.00]Nuvole Bianche - Ludovico Einaudi
[00:10.00]Instrumental`,
    moods: [mockMoods[1], mockMoods[3]], // 放松, 专注
    moodIds: ['relaxed', 'focus'],
    playCount: 2150,
    liked: true,
    genre: '古典',
    createdAt: '2023-01-08T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    title: '夜曲',
    artist: mockArtists[0], // 周杰伦
    artistId: '1',
    album: mockAlbums[0],
    albumId: '1',
    duration: 234,
    audioUrl: 'https://example.com/jay-nocturne.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    lyrics: `[00:00.00]夜曲 - 周杰伦
[00:15.00]一群嗜血的蚂蚁
[00:18.00]被腐肉所吸引
[00:21.00]我面无表情看孤独的风景
[00:27.00]失去你爱恨开始分明`,
    moods: [mockMoods[4], mockMoods[5]], // 忧郁, 浪漫
    moodIds: ['melancholy', 'romantic'],
    playCount: 1650,
    liked: true,
    genre: '华语流行',
    createdAt: '2023-03-20T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '5',
    title: 'Shape of You',
    artist: mockArtists[1], // Ed Sheeran
    artistId: '2',
    duration: 233,
    audioUrl: 'https://example.com/ed-shape-of-you.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
    lyrics: `[00:00.00]Shape of You - Ed Sheeran
[00:08.00]The club isn't the best place to find a lover
[00:11.00]So the bar is where I go
[00:14.00]Me and my friends at the table doing shots
[00:16.00]Drinking fast and then we talk slow`,
    moods: [mockMoods[0], mockMoods[2]], // 快乐, 充满活力
    moodIds: ['happy', 'energetic'],
    playCount: 4200,
    liked: true,
    genre: '流行',
    createdAt: '2023-03-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  }
];

// Mock Playlists Data
export const mockPlaylists: Playlist[] = [
  {
    id: '1',
    name: '流行热歌榜',
    description: '最新最热的流行音乐',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    songs: [mockSongs[0], mockSongs[4]], // 鲜花, Shape of You
    songIds: ['1', '5'],
    songCount: 2,
    playCount: 125000,
    duration: 473,
    creator: 'Self Music',
    isPublic: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    name: '轻松咖啡时光',
    description: '适合咖啡时光的轻松音乐',
    coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
    songs: [mockSongs[1], mockSongs[2]], // River Flows in You, Nuvole Bianche
    songIds: ['2', '3'],
    songCount: 2,
    playCount: 87000,
    duration: 570,
    creator: 'Self Music',
    isPublic: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
  },
  {
    id: '3',
    name: '华语经典',
    description: '经典华语歌曲合集',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    songs: [mockSongs[0], mockSongs[3]], // 鲜花, 夜曲
    songIds: ['1', '4'],
    songCount: 2,
    playCount: 156000,
    duration: 474,
    creator: 'Self Music',
    isPublic: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z',
  }
];

// Mock API Response Data
export const mockApiResponses = {
  songs: {
    data: mockSongs,
    total: mockSongs.length,
    page: 1,
    limit: 20,
    totalPages: 1,
  },
  artists: {
    data: mockArtists,
    total: mockArtists.length,
    page: 1,
    limit: 20,
    totalPages: 1,
  },
  albums: {
    data: mockAlbums,
    total: mockAlbums.length,
    page: 1,
    limit: 20,
    totalPages: 1,
  },
  playlists: {
    data: mockPlaylists,
    total: mockPlaylists.length,
    page: 1,
    limit: 20,
    totalPages: 1,
  },
  moods: mockMoods,
  searchResults: {
    songs: mockSongs.slice(0, 3),
    artists: mockArtists.slice(0, 2),
    albums: mockAlbums.slice(0, 1),
    playlists: mockPlaylists.slice(0, 2),
  },
  recommendations: mockSongs.slice(0, 10),
  trending: mockSongs.slice().sort((a, b) => b.playCount - a.playCount).slice(0, 10),
  hot: mockSongs.slice().sort((a, b) => b.playCount - a.playCount).slice(0, 10),
  new: mockSongs.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10),
};