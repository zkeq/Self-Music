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
import { MultiArtistSelector } from '@/components/multi-artist-selector';
import { ArtistBadge } from '@/components/artist-badge';
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
  MoreHorizontal,
  Info
} from 'lucide-react';
import { Song, Artist, Album, Mood } from '@/types';
import { formatArtistNames, getAllArtistNames } from '@/types';
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
    artistIds: [] as string[],  // 多艺术家ID数组
    selectedArtists: [] as Artist[],  // 选中的艺术家对象
    primaryArtistId: '',  // 主艺术家ID
    albumId: '',
    selectedAlbum: null as Album | null,  // 选中的专辑
    isInheritingArtists: false,  // 是否从专辑继承艺术家
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
    
    // 验证艺术家信息
    if (!formData.isInheritingArtists && formData.artistIds.length === 0) {
      alert('请选择艺术家或选择一个专辑来继承艺术家信息');
      return;
    }
    
    try {
      const songData = {
        title: formData.title,
        artistId: formData.primaryArtistId || formData.artistIds[0] || formData.artistId,
        artistIds: formData.isInheritingArtists ? 
          (formData.selectedAlbum?.artists?.map(a => a.id) || []) : 
          formData.artistIds,
        albumId: formData.albumId || undefined,
        duration: formData.duration,
        audioUrl: formData.audioUrl,
        coverUrl: formData.coverUrl,
        lyrics: formData.lyrics,
        moodIds: formData.moodIds,
        genre: formData.genre,
        playCount: editingSong?.playCount || 0,
        liked: editingSong?.liked || false
      };
      
      if (editingSong) {
        await adminAPI.updateSong(editingSong.id, songData);
      } else {
        await adminAPI.createSong(songData);
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
    
    // 检查歌曲是否属于专辑并且继承艺术家
    const selectedAlbum = song.albumId ? albums.find(a => a.id === song.albumId) || null : null;
    const isInheritingFromAlbum = Boolean(selectedAlbum && selectedAlbum.artists && selectedAlbum.artists.length > 0);
    
    // 准备艺术家数据
    let selectedArtists: Artist[] = [];
    let artistIds: string[] = [];
    let primaryArtistId = '';
    
    if (song.artists && song.artists.length > 0) {
      selectedArtists = song.artists;
      artistIds = song.artists.map(a => a.id);
      primaryArtistId = song.artists.find(a => a.isPrimary)?.id || artistIds[0] || '';
    } else if (song.artist) {
      selectedArtists = [song.artist];
      artistIds = [song.artist.id];
      primaryArtistId = song.artist.id;
    }
    
    setFormData({
      title: song.title,
      artistId: song.artistId,
      artistIds: isInheritingFromAlbum ? [] : artistIds,
      selectedArtists: isInheritingFromAlbum ? [] : selectedArtists,
      primaryArtistId: isInheritingFromAlbum ? '' : primaryArtistId,
      albumId: song.albumId || '',
      selectedAlbum: selectedAlbum,
      isInheritingArtists: isInheritingFromAlbum,
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
      artistIds: [],
      selectedArtists: [],
      primaryArtistId: '',
      albumId: '',
      selectedAlbum: null,
      isInheritingArtists: false,
      duration: 0,
      audioUrl: '',
      coverUrl: '',
      lyrics: '',
      moodIds: [],
      genre: ''
    });
  };

  // 处理专辑选择变化
  const handleAlbumChange = (albumId: string) => {
    const selectedAlbum = albums.find(album => album.id === albumId) || null;
    const shouldInherit = Boolean(selectedAlbum && selectedAlbum.artists && selectedAlbum.artists.length > 0);
    
    setFormData(prev => ({
      ...prev,
      albumId,
      selectedAlbum: selectedAlbum,
      isInheritingArtists: shouldInherit,
      // 如果选择了专辑且专辑有艺术家，清空手动选择的艺术家
      selectedArtists: shouldInherit ? [] : prev.selectedArtists,
      artistIds: shouldInherit ? [] : prev.artistIds,
      primaryArtistId: shouldInherit ? '' : prev.primaryArtistId
    }));
  };

  // 处理多艺术家选择变化（用于非专辑歌曲）
  const handleSelectedArtistsChange = (selectedArtists: Artist[]) => {
    const artistIds = selectedArtists.map(artist => artist.id);
    setFormData(prev => ({
      ...prev,
      selectedArtists,
      artistIds,
      isInheritingArtists: false
    }));
  };

  // 处理主艺术家变化（用于非专辑歌曲）
  const handlePrimaryArtistChange = (artistId: string) => {
    setFormData(prev => ({
      ...prev,
      primaryArtistId: artistId
    }));
  };

  // 获取当前歌曲的艺术家（用于显示）
  const getCurrentArtists = () => {
    if (formData.isInheritingArtists && formData.selectedAlbum) {
      return formData.selectedAlbum.artists || [];
    }
    return formData.selectedArtists;
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
                <div className="grid grid-cols-1 gap-4">
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
                  
                  {/* 专辑选择 */}
                  <div className="space-y-2">
                    <Label htmlFor="albumId">专辑（可选）</Label>
                    <select
                      id="albumId"
                      value={formData.albumId}
                      onChange={(e) => handleAlbumChange(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">选择专辑（将继承专辑艺术家）</option>
                      {albums.map((album) => (
                        <option key={album.id} value={album.id}>
                          {album.title} - {album.artists ? getAllArtistNames(album) : album.artist?.name || '未知艺术家'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 艺术家继承状态显示 */}
                  {formData.isInheritingArtists && formData.selectedAlbum && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="space-y-2">
                          <p className="text-sm text-blue-800 font-medium">
                            将继承专辑《{formData.selectedAlbum.title}》的艺术家：
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {formData.selectedAlbum.artists?.map((artist) => (
                              <ArtistBadge
                                key={artist.id}
                                artist={artist}
                                isPrimary={artist.isPrimary}
                                size="sm"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 手动艺术家选择（仅当未选择专辑或专辑无艺术家时显示） */}
                  {!formData.isInheritingArtists && (
                    <div className="space-y-2">
                      <MultiArtistSelector
                        allArtists={artists}
                        selectedArtists={formData.selectedArtists}
                        primaryArtistId={formData.primaryArtistId}
                        onSelectedArtistsChange={handleSelectedArtistsChange}
                        onPrimaryArtistChange={handlePrimaryArtistChange}
                        label="艺术家"
                        required
                        placeholder="搜索并选择艺术家..."
                        maxArtists={5}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="genre">音乐风格</Label>
                    <Input
                      id="genre"
                      value={formData.genre}
                      onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                      placeholder="例如: 流行, 摇滚, 爵士"
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
                              {song.artists ? getAllArtistNames(song) : song.artistName || '未知艺术家'}
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
                          
                          {/* 显示艺术家标签 */}
                          {song.artists && song.artists.length > 1 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {song.artists.map((artist) => (
                                <ArtistBadge
                                  key={artist.id}
                                  artist={artist}
                                  isPrimary={artist.isPrimary}
                                  size="sm"
                                />
                              ))}
                            </div>
                          )}
                          
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