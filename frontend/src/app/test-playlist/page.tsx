'use client';

import { usePlayerStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Plus, Trash2, Shuffle } from 'lucide-react';
import { Song } from '@/types';
import { PlaylistPanel } from '@/components/playlist-panel';

// 测试用的模拟歌曲数据
const mockSongs: Song[] = [{
  id: '1',
  title: '特定歌曲播放',
  artist: {
    id: 'artist-1',
    name: '艺术家名称',
    avatar: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop&crop=face',
    followers: 100000,
    songCount: 25,
    genres: ['流行', '摇滚'],
    verified: true,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  },
  album: {
    id: '1',
    title: '十一月的萧邦',
    artist: {
      id: 'artist-1',
      name: '周杰伦',
      avatar: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop&crop=face',
      followers: 100000,
      songCount: 25,
      genres: ['华语流行'],
      verified: true,
      createdAt: '2005-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
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
  artistId: 'artist-1',
  albumId: 'album-1',
  duration: 204,
  moods: [{
    id: 'happy',
    name: '快乐',
    description: '充满活力和正能量的音乐',
    icon: 'Smile',
    color: 'from-yellow-400 to-orange-500',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    songCount: 124,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  }],
  moodIds: ['mood-1', 'mood-2'],
  coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&crop=face',
  audioUrl: `/api/songs/1/stream`,
  playCount: 1000,
  liked: false,
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z',
},
];

export default function TestPlaylistPage() {
  const {
    playlist,
    currentSong,
    isPlaying,
    currentIndex,
    addToPlaylist,
    setSong,
    replacePlaylistAndPlay,
    clearPlaylist,
    shufflePlaylist,
  } = usePlayerStore();

  const addSong = (song: Song) => {
    addToPlaylist(song);
  };

  const playSong = (song: Song) => {
    // 将歌曲添加到播放列表并播放
    const songIndex = mockSongs.findIndex(s => s.id === song.id);
    if (songIndex !== -1) {
      replacePlaylistAndPlay(mockSongs, songIndex);
    } else {
      setSong(song);
    }
  };

  const playFromPlaylist = (index: number) => {
    if (playlist[index]) {
      replacePlaylistAndPlay(playlist, index);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>播放列表测试</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-3">可用歌曲</h3>
            <div className="space-y-2">
              {mockSongs.map((song) => (
                <div key={song.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{song.title}</p>
                    <p className="text-sm text-muted-foreground">{song.artist.name}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => playSong(song)}>
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={() => addSong(song)} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">当前播放列表 ({playlist.length} 首)</h3>
            <div className="flex space-x-2 mb-3">
              <Button size="sm" onClick={clearPlaylist} variant="outline">
                <Trash2 className="h-4 w-4 mr-2" />
                清空
              </Button>
              <Button size="sm" onClick={shufflePlaylist} variant="outline">
                <Shuffle className="h-4 w-4 mr-2" />
                随机播放
              </Button>
            </div>
            <div className="space-y-2">
              {playlist.length === 0 ? (
                <p className="text-muted-foreground">播放列表为空，点击上方歌曲的 &quot;+&quot; 按钮添加歌曲</p>
              ) : (
                playlist.map((song, index) => (
                  <div 
                    key={song.id} 
                    className={`flex items-center justify-between p-3 border rounded-lg ${
                      index === currentIndex ? 'bg-primary/10 border-primary' : ''
                    }`}
                  >
                    <div>
                      <p className="font-medium">{song.title}</p>
                      <p className="text-sm text-muted-foreground">{song.artist.name}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {index === currentIndex && (
                        <span className="text-sm text-primary">{isPlaying ? '正在播放' : '已暂停'}</span>
                      )}
                      <Button size="sm" onClick={() => playFromPlaylist(index)} variant="outline">
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">当前状态</h3>
            <div className="space-y-1 text-sm">
              <p>当前歌曲: {currentSong?.title || '无'}</p>
              <p>播放状态: {isPlaying ? '播放中' : '已暂停'}</p>
              <p>当前索引: {currentIndex}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <PlaylistPanel />
    </div>
  );
}