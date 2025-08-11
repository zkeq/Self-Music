'use client';

import { usePlayerStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Plus, Trash2, Shuffle } from 'lucide-react';
import { Song } from '@/types';

// 测试用的模拟歌曲数据
const mockSongs: Song[] = [
  {
    id: '1',
    title: '测试歌曲 1',
    artist: '测试艺术家 1',
    album: '测试专辑 1',
    duration: 234,
    mood: ['放松', '专注'],
    coverUrl: 'http://p1.music.126.net/CyqwMIOhD_DnBqPF1tGFhw==/109951164276956232.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: '测试歌曲 2',
    artist: '测试艺术家 2',
    album: '测试专辑 2',
    duration: 189,
    mood: ['快乐', '活力'],
    coverUrl: 'http://p1.music.126.net/CyqwMIOhD_DnBqPF1tGFhw==/109951164276956232.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: '测试歌曲 3',
    artist: '测试艺术家 3',
    album: '测试专辑 3',
    duration: 312,
    mood: ['悲伤', '治愈'],
    coverUrl: 'http://p1.music.126.net/CyqwMIOhD_DnBqPF1tGFhw==/109951164276956232.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function TestPlaylist() {
  const {
    playlist,
    currentSong,
    isPlaying,
    currentIndex,
    addToPlaylist,
    setSong,
    clearPlaylist,
    shufflePlaylist,
  } = usePlayerStore();

  const addSong = (song: Song) => {
    addToPlaylist(song);
  };

  const playSong = (song: Song) => {
    setSong(song);
  };

  const playFromPlaylist = (index: number) => {
    if (playlist[index]) {
      setSong(playlist[index]);
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
                    <p className="text-sm text-muted-foreground">{song.artist}</p>
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
                      <p className="text-sm text-muted-foreground">{song.artist}</p>
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
    </div>
  );
}