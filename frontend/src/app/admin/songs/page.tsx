"use client";

import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/admin-api';
import AdminLayout from '@/components/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Music, 
  Search,
  Play,
  User,
  Album as AlbumIcon,
  Heart,
  Clock,
  MoreHorizontal
} from 'lucide-react';
import { Song, Artist, Album, Mood } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SongWithRelations extends Song {
  artistName?: string;
  albumTitle?: string;
}

export default function SongsPage() {
  const [songs, setSongs] = useState<SongWithRelations[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [moods, setMoods] = useState<Mood[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<SongWithRelations | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    artistId: '',
    albumId: '',
    duration: 0,
    audioUrl: '',
    coverUrl: '',
    lyrics: '',
    moodIds: [] as string[],
    genre: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [songsResponse, artistsResponse, albumsResponse, moodsResponse] = await Promise.all([
        adminAPI.getSongs(),
        adminAPI.getArtists(),
        adminAPI.getAlbums(),
        adminAPI.getMoods()
      ]);
      
      if (songsResponse.success && songsResponse.data) {
        setSongs(songsResponse.data);
      }
      
      if (artistsResponse.success && artistsResponse.data) {
        setArtists(artistsResponse.data);
      }
      
      if (albumsResponse.success && albumsResponse.data) {
        setAlbums(albumsResponse.data);
      }
      
      if (moodsResponse.success && moodsResponse.data) {
        setMoods(moodsResponse.data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSong) {
        await adminAPI.updateSong(editingSong.id, formData);
      } else {
        await adminAPI.createSong(formData);
      }
      setDialogOpen(false);
      setEditingSong(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Failed to save song:', error);
    }
  };

  const handleEdit = (song: SongWithRelations) => {
    setEditingSong(song);
    setFormData({
      title: song.title,
      artistId: song.artistId,
      albumId: song.albumId || '',
      duration: song.duration,
      audioUrl: song.audioUrl || '',
      coverUrl: song.coverUrl || '',
      lyrics: song.lyrics || '',
      moodIds: song.moodIds,
      genre: song.genre || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这首歌曲吗？')) {
      try {
        await adminAPI.deleteSong(id);
        fetchData();
      } catch (error) {
        console.error('Failed to delete song:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      artistId: '',
      albumId: '',
      duration: 0,
      audioUrl: '',
      coverUrl: '',
      lyrics: '',
      moodIds: [],
      genre: ''
    });
  };

  const handleMoodToggle = (moodId: string) => {
    const newMoodIds = formData.moodIds.includes(moodId)
      ? formData.moodIds.filter(id => id !== moodId)
      : [...formData.moodIds, moodId];
    setFormData({ ...formData, moodIds: newMoodIds });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (song.artistName && song.artistName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (song.albumTitle && song.albumTitle.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getAlbumsForArtist = (artistId: string) => {
    return albums.filter(album => album.artistId === artistId);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">歌曲</h1>
            <p className="text-muted-foreground">管理音乐歌曲信息</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingSong(null); resetForm(); }}>
                <Plus className="h-4 w-4 mr-2" />
                新建歌曲
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingSong ? '编辑歌曲' : '新建歌曲'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">歌曲名称 *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="请输入歌曲名称"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="artistId">艺术家 *</Label>
                    <select
                      id="artistId"
                      value={formData.artistId}
                      onChange={(e) => setFormData({ ...formData, artistId: e.target.value, albumId: '' })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      <option value="">选择艺术家</option>
                      {artists.map((artist) => (
                        <option key={artist.id} value={artist.id}>{artist.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="albumId">专辑</Label>
                    <select
                      id="albumId"
                      value={formData.albumId}
                      onChange={(e) => setFormData({ ...formData, albumId: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!formData.artistId}
                    >
                      <option value="">选择专辑（可选）</option>
                      {getAlbumsForArtist(formData.artistId).map((album) => (
                        <option key={album.id} value={album.id}>{album.title}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="duration">时长（秒）</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                      placeholder="歌曲时长"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="audioUrl">音频文件URL</Label>
                    <Input
                      id="audioUrl"
                      value={formData.audioUrl}
                      onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
                      placeholder="音频文件URL"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="coverUrl">封面图片URL</Label>
                    <Input
                      id="coverUrl"
                      value={formData.coverUrl}
                      onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                      placeholder="封面图片URL"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="genre">音乐风格</Label>
                  <Input
                    id="genre"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    placeholder="例如: 流行, 摇滚, 爵士"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lyrics">歌词</Label>
                  <Textarea
                    id="lyrics"
                    value={formData.lyrics}
                    onChange={(e) => setFormData({ ...formData, lyrics: e.target.value })}
                    placeholder="请输入歌词内容"
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label>心情标签</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto p-2 border border-input rounded-md">
                    {moods.map((mood) => (
                      <div
                        key={mood.id}
                        className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
                          formData.moodIds.includes(mood.id)
                            ? 'bg-secondary border border-primary'
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => handleMoodToggle(mood.id)}
                      >
                        <input
                          type="checkbox"
                          checked={formData.moodIds.includes(mood.id)}
                          onChange={() => {}}
                          className="rounded"
                        />
                        <span className="text-sm">{mood.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    取消
                  </Button>
                  <Button type="submit">
                    {editingSong ? '更新' : '创建'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索歌曲、艺术家或专辑..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Songs Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                歌曲列表
                <Badge variant="secondary">{filteredSongs.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredSongs.map((song, index) => (
                  <div key={song.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                          {song.coverUrl ? (
                            <img src={song.coverUrl} alt={song.title} className="w-full h-full rounded-lg object-cover" />
                          ) : (
                            <Music className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-medium">{song.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {song.artistName || '未知艺术家'}
                            </span>
                            {song.albumTitle && (
                              <span className="flex items-center gap-1">
                                <AlbumIcon className="h-3 w-3" />
                                {song.albumTitle}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(song.duration)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Play className="h-3 w-3" />
                              {song.playCount} 次播放
                            </span>
                            {song.liked && <Heart className="h-3 w-3 text-red-500 fill-current" />}
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mt-2">
                            {song.genre && (
                              <Badge variant="outline" className="text-xs">
                                {song.genre}
                              </Badge>
                            )}
                            {song.moodIds.slice(0, 3).map((moodId) => {
                              const mood = moods.find(m => m.id === moodId);
                              return mood ? (
                                <Badge key={moodId} variant="secondary" className="text-xs">
                                  {mood.name}
                                </Badge>
                              ) : null;
                            })}
                            {song.moodIds.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{song.moodIds.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleEdit(song)}>
                            <Edit className="h-4 w-4 mr-2" />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(song.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {index < filteredSongs.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>

              {filteredSongs.length === 0 && (
                <div className="text-center py-12">
                  <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">没有找到歌曲</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}