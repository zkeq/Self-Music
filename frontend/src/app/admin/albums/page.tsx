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
  Album as AlbumIcon, 
  Search,
  Calendar,
  Music,
  User,
  MoreHorizontal
} from 'lucide-react';
import { Album, Artist } from '@/types';
import { formatArtistNames, getAllArtistNames } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AlbumWithArtist extends Album {
  artistName?: string;
}

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<AlbumWithArtist[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<AlbumWithArtist | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    artistId: '',
    artistIds: [] as string[],  // 新增：多艺术家ID数组
    selectedArtists: [] as Artist[],  // 新增：选中的艺术家对象
    primaryArtistId: '',  // 新增：主艺术家ID
    coverUrl: '',
    releaseDate: '',
    genre: '',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [albumsResponse, artistsResponse] = await Promise.all([
        adminAPI.getAlbums(),
        adminAPI.getArtists()
      ]);
      
      if (albumsResponse.success && albumsResponse.data) {
        setAlbums(albumsResponse.data);
      }
      
      if (artistsResponse.success && artistsResponse.data) {
        setArtists(artistsResponse.data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证至少选择一个艺术家
    if (formData.artistIds.length === 0) {
      alert('请至少选择一个艺术家');
      return;
    }
    
    try {
      const albumData = {
        title: formData.title,
        artistId: formData.primaryArtistId || formData.artistIds[0], // 主艺术家作为主要艺术家ID
        artistIds: formData.artistIds, // 所有艺术家ID数组
        coverUrl: formData.coverUrl,
        releaseDate: formData.releaseDate,
        genre: formData.genre,
        description: formData.description,
        songCount: editingAlbum?.songCount || 0,
        duration: editingAlbum?.duration || 0
      };
      
      if (editingAlbum) {
        await adminAPI.updateAlbum(editingAlbum.id, albumData);
      } else {
        await adminAPI.createAlbum(albumData);
      }
      setDialogOpen(false);
      setEditingAlbum(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Failed to save album:', error);
    }
  };

  const handleEdit = (album: AlbumWithArtist) => {
    setEditingAlbum(album);
    
    // 准备艺术家数据
    const selectedArtists = album.artists || (album.artist ? [album.artist] : []);
    const artistIds = selectedArtists.map(a => a.id);
    const primaryArtistId = selectedArtists.find(a => a.isPrimary)?.id || artistIds[0] || '';
    
    setFormData({
      title: album.title,
      artistId: album.artistId,
      artistIds: artistIds,
      selectedArtists: selectedArtists,
      primaryArtistId: primaryArtistId,
      coverUrl: album.coverUrl || '',
      releaseDate: album.releaseDate,
      genre: album.genre || '',
      description: album.description || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个专辑吗？')) {
      try {
        await adminAPI.deleteAlbum(id);
        fetchData();
      } catch (error) {
        console.error('Failed to delete album:', error);
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
      coverUrl: '',
      releaseDate: '',
      genre: '',
      description: ''
    });
  };

  const filteredAlbums = albums.filter(album =>
    album.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (album.artists && album.artists.some(artist => 
      artist.name.toLowerCase().includes(searchTerm.toLowerCase())
    )) ||
    (album.artistName && album.artistName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    }
    return `${minutes}分钟`;
  };

  // 处理多艺术家选择变化
  const handleSelectedArtistsChange = (selectedArtists: Artist[]) => {
    const artistIds = selectedArtists.map(artist => artist.id);
    setFormData(prev => ({
      ...prev,
      selectedArtists,
      artistIds
    }));
  };

  // 处理主艺术家变化
  const handlePrimaryArtistChange = (artistId: string) => {
    setFormData(prev => ({
      ...prev,
      primaryArtistId: artistId
    }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">专辑</h1>
            <p className="text-muted-foreground">管理音乐专辑信息</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingAlbum(null); resetForm(); }}>
                <Plus className="h-4 w-4 mr-2" />
                新建专辑
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingAlbum ? '编辑专辑' : '新建专辑'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">专辑名称 *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="请输入专辑名称"
                      required
                    />
                  </div>
                  
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="releaseDate">发行日期 *</Label>
                    <Input
                      id="releaseDate"
                      type="date"
                      value={formData.releaseDate}
                      onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                      required
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

                <div className="space-y-2">
                  <Label htmlFor="coverUrl">专辑封面URL</Label>
                  <Input
                    id="coverUrl"
                    value={formData.coverUrl}
                    onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                    placeholder="专辑封面图片URL"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">专辑描述</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="请输入专辑描述"
                    rows={3}
                  />
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
                    {editingAlbum ? '更新' : '创建'}
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
            placeholder="搜索专辑或艺术家..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Albums Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlbumIcon className="h-5 w-5" />
                专辑列表
                <Badge variant="secondary">{filteredAlbums.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAlbums.map((album, index) => (
                  <div key={album.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                          {album.coverUrl ? (
                            <img src={album.coverUrl} alt={album.title} className="w-full h-full rounded-lg object-cover" />
                          ) : (
                            <AlbumIcon className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-medium">{album.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {album.artists ? getAllArtistNames(album) : album.artistName || '未知艺术家'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(album.releaseDate)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Music className="h-3 w-3" />
                              {album.songCount} 首歌曲
                            </span>
                          </div>
                          
                          {/* 显示艺术家标签 */}
                          {album.artists && album.artists.length > 1 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {album.artists.map((artist) => (
                                <ArtistBadge
                                  key={artist.id}
                                  artist={artist}
                                  isPrimary={artist.isPrimary}
                                  size="sm"
                                />
                              ))}
                            </div>
                          )}
                          
                          {album.duration > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {formatDuration(album.duration)}
                            </p>
                          )}
                          {album.genre && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {album.genre}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleEdit(album)}>
                            <Edit className="h-4 w-4 mr-2" />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(album.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {index < filteredAlbums.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>

              {filteredAlbums.length === 0 && (
                <div className="text-center py-12">
                  <AlbumIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">没有找到专辑</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}