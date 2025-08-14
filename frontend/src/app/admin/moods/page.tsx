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
  Heart, 
  Search,
  Music,
  Palette,
  MoreHorizontal
} from 'lucide-react';
import { Mood } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ICON_OPTIONS = [
  { icon: '😊', name: '开心' },
  { icon: '😢', name: '悲伤' },
  { icon: '😡', name: '愤怒' },
  { icon: '😌', name: '放松' },
  { icon: '💪', name: '激励' },
  { icon: '💕', name: '爱情' },
  { icon: '🎉', name: '庆祝' },
  { icon: '🌙', name: '夜晚' },
  { icon: '☀️', name: '阳光' },
  { icon: '🎵', name: '音乐' },
  { icon: '💔', name: '心碎' },
  { icon: '✨', name: '梦幻' }
];

const COLOR_OPTIONS = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
  '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
  '#ee5a24', '#0abde3', '#10ac84', '#ee5253', '#2e86de',
  '#f368e0', '#ff3838', '#ff6348', '#ff7675', '#a29bfe'
];

export default function MoodsPage() {
  const [moods, setMoods] = useState<Mood[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMood, setEditingMood] = useState<Mood | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '😊',
    color: '#ff6b6b',
    coverUrl: ''
  });

  useEffect(() => {
    fetchMoods();
  }, []);

  const fetchMoods = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getMoods();
      if (response.success && response.data) {
        setMoods(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch moods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const moodData = {
        ...formData,
        songCount: 0
      };
      
      if (editingMood) {
        await adminAPI.updateMood(editingMood.id, moodData);
      } else {
        await adminAPI.createMood(moodData);
      }
      setDialogOpen(false);
      setEditingMood(null);
      resetForm();
      fetchMoods();
    } catch (error) {
      console.error('Failed to save mood:', error);
    }
  };

  const handleEdit = (mood: Mood) => {
    setEditingMood(mood);
    setFormData({
      name: mood.name,
      description: mood.description || '',
      icon: mood.icon,
      color: mood.color,
      coverUrl: mood.coverUrl || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个心情标签吗？')) {
      try {
        await adminAPI.deleteMood(id);
        fetchMoods();
      } catch (error) {
        console.error('Failed to delete mood:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: '😊',
      color: '#ff6b6b',
      coverUrl: ''
    });
  };

  const filteredMoods = moods.filter(mood =>
    mood.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (mood.description && mood.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">心情</h1>
            <p className="text-muted-foreground">管理音乐心情标签</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingMood(null); resetForm(); }}>
                <Plus className="h-4 w-4 mr-2" />
                新建心情
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingMood ? '编辑心情' : '新建心情'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">心情名称 *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="请输入心情名称"
                      required
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
                  <Label htmlFor="description">心情描述</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="请输入心情描述"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>选择图标</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {ICON_OPTIONS.map((option) => (
                      <button
                        key={option.icon}
                        type="button"
                        className={`p-3 text-2xl rounded-lg border-2 hover:bg-muted transition-colors ${
                          formData.icon === option.icon 
                            ? 'border-primary bg-secondary' 
                            : 'border-border'
                        }`}
                        onClick={() => setFormData({ ...formData, icon: option.icon })}
                        title={option.name}
                      >
                        {option.icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>选择颜色</Label>
                  <div className="grid grid-cols-10 gap-2">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                          formData.color === color 
                            ? 'border-foreground ring-2 ring-ring' 
                            : 'border-border'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData({ ...formData, color })}
                      />
                    ))}
                  </div>
                  
                  <div className="mt-3">
                    <Label htmlFor="customColor">自定义颜色</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <input
                        type="color"
                        id="customColor"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-12 h-8 border border-input rounded cursor-pointer"
                      />
                      <Input
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        placeholder="#ffffff"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <Label className="text-sm font-medium">预览</Label>
                  <div className="mt-2 flex items-center space-x-3">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl"
                      style={{ backgroundColor: formData.color }}
                    >
                      {formData.icon}
                    </div>
                    <div>
                      <p className="font-medium">{formData.name || '心情名称'}</p>
                      <p className="text-sm text-muted-foreground">{formData.description || '心情描述'}</p>
                    </div>
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
                    {editingMood ? '更新' : '创建'}
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
            placeholder="搜索心情..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Moods Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                心情列表
                <Badge variant="secondary">{filteredMoods.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredMoods.map((mood, index) => (
                  <div key={mood.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div 
                          className="w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl shadow-lg"
                          style={{ backgroundColor: mood.color }}
                        >
                          {mood.icon}
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-medium">{mood.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Music className="h-3 w-3" />
                              {mood.songCount} 首歌曲
                            </span>
                            <div 
                              className="px-2 py-1 rounded text-white text-xs font-medium"
                              style={{ backgroundColor: mood.color }}
                            >
                              {mood.color}
                            </div>
                          </div>
                          {mood.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{mood.description}</p>
                          )}
                          {mood.coverUrl && (
                            <div className="flex items-center gap-2 mt-2">
                              <img 
                                src={mood.coverUrl} 
                                alt={mood.name}
                                className="w-8 h-8 rounded object-cover"
                              />
                              <span className="text-xs text-muted-foreground">封面图片</span>
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
                          <DropdownMenuItem onClick={() => handleEdit(mood)}>
                            <Edit className="h-4 w-4 mr-2" />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(mood.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {index < filteredMoods.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>

              {filteredMoods.length === 0 && (
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">没有找到心情标签</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}