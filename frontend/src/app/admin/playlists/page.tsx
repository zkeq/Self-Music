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
  List, 
  Search,
  Music,
  Clock,
  Play,
  Eye,
  EyeOff,
  User,
  MoreHorizontal
} from 'lucide-react';
import { Playlist, Song } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PlaylistWithSongs extends Playlist {
  songs?: Song[];
}

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<PlaylistWithSongs[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<PlaylistWithSongs | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    coverUrl: '',
    songIds: [] as string[],
    isPublic: true,
    creator: 'admin'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [playlistsResponse, songsResponse] = await Promise.all([
        adminAPI.getPlaylists(),
        adminAPI.getSongs()
      ]);
      
      if (playlistsResponse.success && playlistsResponse.data) {
        setPlaylists(playlistsResponse.data);
      }
      
      if (songsResponse.success && songsResponse.data) {
        setSongs(songsResponse.data);
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
      const playlistData = {
        ...formData,
        songCount: formData.songIds.length,
        duration: calculateDuration(formData.songIds),
        playCount: 0
      };
      
      if (editingPlaylist) {
        await adminAPI.updatePlaylist(editingPlaylist.id, playlistData);
      } else {
        await adminAPI.createPlaylist(playlistData);
      }
      setDialogOpen(false);
      setEditingPlaylist(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Failed to save playlist:', error);
    }
  };

  const handleEdit = (playlist: PlaylistWithSongs) => {
    setEditingPlaylist(playlist);
    setFormData({
      name: playlist.name,
      description: playlist.description || '',
      coverUrl: playlist.coverUrl || '',
      songIds: playlist.songIds,
      isPublic: playlist.isPublic,
      creator: playlist.creator
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个歌单吗？')) {
      try {
        await adminAPI.deletePlaylist(id);
        fetchData();
      } catch (error) {
        console.error('Failed to delete playlist:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      coverUrl: '',
      songIds: [],
      isPublic: true,
      creator: 'admin'
    });
  };

  const handleSongToggle = (songId: string) => {
    const newSongIds = formData.songIds.includes(songId)
      ? formData.songIds.filter(id => id !== songId)
      : [...formData.songIds, songId];
    setFormData({ ...formData, songIds: newSongIds });
  };

  const calculateDuration = (songIds: string[]) => {
    return songIds.reduce((total, songId) => {
      const song = songs.find(s => s.id === songId);
      return total + (song?.duration || 0);
    }, 0);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    }
    return `${minutes}分钟`;
  };

  const filteredPlaylists = playlists.filter(playlist =>
    playlist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (playlist.description && playlist.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">歌单</h1>
            <p className="text-muted-foreground">管理音乐歌单信息</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingPlaylist(null); resetForm(); }}>
                <Plus className="h-4 w-4 mr-2" />
                新建歌单
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPlaylist ? '编辑歌单' : '新建歌单'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">歌单名称 *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="请输入歌单名称"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="creator">创建者</Label>
                    <Input
                      id="creator"
                      value={formData.creator}
                      onChange={(e) => setFormData({ ...formData, creator: e.target.value })}
                      placeholder="创建者名称"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">歌单描述</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="请输入歌单描述"
                    rows={3}
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

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                    className="rounded border-input"
                  />
                  <Label htmlFor="isPublic">公开歌单</Label>
                </div>

                <div className="space-y-2">
                  <Label>选择歌曲</Label>
                  <div className="max-h-60 overflow-y-auto border border-input rounded-lg p-3 space-y-2">
                    {songs.map((song) => (
                      <div
                        key={song.id}
                        className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${
                          formData.songIds.includes(song.id)
                            ? 'bg-secondary border border-primary'
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => handleSongToggle(song.id)}
                      >
                        <input
                          type="checkbox"
                          checked={formData.songIds.includes(song.id)}
                          onChange={() => {}}
                          className="rounded"
                        />
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                          {song.coverUrl ? (
                            <img src={song.coverUrl} alt={song.title} className="w-full h-full rounded-lg object-cover" />
                          ) : (
                            <Music className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{song.title}</p>
                          <p className="text-xs text-muted-foreground">{song.artist?.name || '未知艺术家'}</p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    已选择 {formData.songIds.length} 首歌曲，总时长 {formatDuration(calculateDuration(formData.songIds))}
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
                    {editingPlaylist ? '更新' : '创建'}
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
            placeholder="搜索歌单..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Playlists List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="h-5 w-5" />
                歌单列表
                <Badge variant="secondary">{filteredPlaylists.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredPlaylists.map((playlist, index) => (
                  <div key={playlist.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                          {playlist.coverUrl ? (
                            <img src={playlist.coverUrl} alt={playlist.name} className="w-full h-full rounded-lg object-cover" />
                          ) : (
                            <List className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{playlist.name}</h3>
                            {playlist.isPublic ? (
                              <Eye className="h-4 w-4 text-green-600" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {playlist.creator}
                            </span>
                            <span className="flex items-center gap-1">
                              <Music className="h-3 w-3" />
                              {playlist.songCount} 首歌曲
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(playlist.duration)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Play className="h-3 w-3" />
                              {playlist.playCount} 次播放
                            </span>
                          </div>
                          {playlist.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{playlist.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={playlist.isPublic ? "default" : "secondary"} className="text-xs">
                              {playlist.isPublic ? '公开' : '私有'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(playlist.createdAt).toLocaleDateString('zh-CN')}
                            </span>
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
                          <DropdownMenuItem onClick={() => handleEdit(playlist)}>
                            <Edit className="h-4 w-4 mr-2" />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(playlist.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {index < filteredPlaylists.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>

              {filteredPlaylists.length === 0 && (
                <div className="text-center py-12">
                  <List className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">没有找到歌单</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}