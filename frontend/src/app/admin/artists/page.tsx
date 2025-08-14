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
  User, 
  Users,
  Search,
  Star,
  Music,
  Album as AlbumIcon,
  MoreHorizontal
} from 'lucide-react';
import { Artist } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    avatar: '',
    coverUrl: '',
    followers: 0,
    genres: [] as string[],
    verified: false
  });

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getArtists();
      if (response.success && response.data) {
        setArtists(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch artists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const artistData = {
        ...formData,
        songCount: editingArtist?.songCount || 0,
        albumCount: editingArtist?.albumCount || 0
      };
      
      if (editingArtist) {
        await adminAPI.updateArtist(editingArtist.id, artistData);
      } else {
        await adminAPI.createArtist(artistData);
      }
      setDialogOpen(false);
      setEditingArtist(null);
      resetForm();
      fetchArtists();
    } catch (error) {
      console.error('Failed to save artist:', error);
    }
  };

  const handleEdit = (artist: Artist) => {
    setEditingArtist(artist);
    setFormData({
      name: artist.name,
      bio: artist.bio || '',
      avatar: artist.avatar || '',
      coverUrl: artist.coverUrl || '',
      followers: artist.followers,
      genres: artist.genres,
      verified: artist.verified
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个艺术家吗？')) {
      try {
        await adminAPI.deleteArtist(id);
        fetchArtists();
      } catch (error) {
        console.error('Failed to delete artist:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      bio: '',
      avatar: '',
      coverUrl: '',
      followers: 0,
      genres: [],
      verified: false
    });
  };

  const handleGenresChange = (value: string) => {
    const genres = value.split(',').map(g => g.trim()).filter(g => g);
    setFormData({ ...formData, genres });
  };

  const filteredArtists = artists.filter(artist =>
    artist.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">艺术家</h1>
            <p className="text-muted-foreground">管理音乐艺术家信息</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingArtist(null); resetForm(); }}>
                <Plus className="h-4 w-4 mr-2" />
                新建艺术家
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingArtist ? '编辑艺术家' : '新建艺术家'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">艺术家名称 *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="请输入艺术家名称"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="followers">粉丝数</Label>
                    <Input
                      id="followers"
                      type="number"
                      value={formData.followers}
                      onChange={(e) => setFormData({ ...formData, followers: parseInt(e.target.value) || 0 })}
                      placeholder="粉丝数量"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">艺术家简介</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="请输入艺术家简介"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="avatar">头像URL</Label>
                    <Input
                      id="avatar"
                      value={formData.avatar}
                      onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                      placeholder="头像图片URL"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="coverUrl">封面URL</Label>
                    <Input
                      id="coverUrl"
                      value={formData.coverUrl}
                      onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                      placeholder="封面图片URL"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="genres">音乐风格 (用逗号分隔)</Label>
                  <Input
                    id="genres"
                    value={formData.genres.join(', ')}
                    onChange={(e) => handleGenresChange(e.target.value)}
                    placeholder="例如: 流行, 摇滚, 爵士"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="verified"
                    checked={formData.verified}
                    onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                    className="rounded border-input"
                  />
                  <Label htmlFor="verified">认证艺术家</Label>
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
                    {editingArtist ? '更新' : '创建'}
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
            placeholder="搜索艺术家..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Artists Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                艺术家列表
                <Badge variant="secondary">{filteredArtists.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredArtists.map((artist, index) => (
                  <div key={artist.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                          {artist.avatar ? (
                            <img src={artist.avatar} alt={artist.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <User className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{artist.name}</h3>
                            {artist.verified && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{artist.followers.toLocaleString()} 粉丝</span>
                            <span className="flex items-center gap-1">
                              <Music className="h-3 w-3" />
                              {artist.songCount} 首歌曲
                            </span>
                            <span className="flex items-center gap-1">
                              <AlbumIcon className="h-3 w-3" />
                              {artist.albumCount} 张专辑
                            </span>
                          </div>
                          {artist.genres.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {artist.genres.slice(0, 3).map((genre, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {genre}
                                </Badge>
                              ))}
                              {artist.genres.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{artist.genres.length - 3}
                                </Badge>
                              )}
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
                          <DropdownMenuItem onClick={() => handleEdit(artist)}>
                            <Edit className="h-4 w-4 mr-2" />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(artist.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {index < filteredArtists.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>

              {filteredArtists.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">没有找到艺术家</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}