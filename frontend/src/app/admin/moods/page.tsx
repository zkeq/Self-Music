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
  MoreHorizontal,
  Smile,
  Coffee,
  Zap,
  Sun,
  CloudRain,
  Moon,
  Star,
  Flame,
  Wind,
  Waves,
  Mountain,
  Leaf,
  Sparkles,
  Target,
  Battery,
  Volume2,
  Headphones,
  Radio,
  Mic,
  Guitar,
  Piano,
  Drum,
  Activity,
  TrendingUp,
  Users,
  Globe,
  Clock,
  Calendar,
  Camera,
  Book,
  Gamepad2,
  Smartphone,
  Laptop,
  Car,
  Plane,
  Home,
  Building,
  MapPin,
  Compass,
  Flag,
  Award,
  Gift,
  Lightbulb,
  Key,
  Lock,
  Shield,
  Eye,
  MessageCircle,
  Mail,
  Phone,
  Settings,
  Wrench,
  Scissors,
  Brush,
  Palette as PaletteIcon,
  Image,
  FileText,
  Download,
  Upload,
  Save,
  Trash,
  Archive,
  Folder,
  File,
  Search as SearchIcon,
  Filter,
  Sort,
  BarChart,
  PieChart,
  LineChart
} from 'lucide-react';
import { Mood } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ICON_OPTIONS = [
  { icon: 'Smile', name: '微笑', component: Smile },
  { icon: 'Coffee', name: '咖啡', component: Coffee },
  { icon: 'Zap', name: '闪电', component: Zap },
  { icon: 'Sun', name: '太阳', component: Sun },
  { icon: 'CloudRain', name: '雨云', component: CloudRain },
  { icon: 'Moon', name: '月亮', component: Moon },
  { icon: 'Star', name: '星星', component: Star },
  { icon: 'Heart', name: '爱心', component: Heart },
  { icon: 'Flame', name: '火焰', component: Flame },
  { icon: 'Wind', name: '风', component: Wind },
  { icon: 'Waves', name: '波浪', component: Waves },
  { icon: 'Mountain', name: '山峰', component: Mountain },
  { icon: 'Leaf', name: '叶子', component: Leaf },
  { icon: 'Sparkles', name: '闪烁', component: Sparkles },
  { icon: 'Target', name: '目标', component: Target },
  { icon: 'Battery', name: '电池', component: Battery },
  { icon: 'Volume2', name: '音量', component: Volume2 },
  { icon: 'Headphones', name: '耳机', component: Headphones },
  { icon: 'Radio', name: '电台', component: Radio },
  { icon: 'Mic', name: '麦克风', component: Mic },
  { icon: 'Guitar', name: '吉他', component: Guitar },
  { icon: 'Piano', name: '钢琴', component: Piano },
  { icon: 'Drum', name: '鼓', component: Drum },
  { icon: 'Activity', name: '活动', component: Activity },
  { icon: 'TrendingUp', name: '上升', component: TrendingUp },
  { icon: 'Users', name: '用户', component: Users },
  { icon: 'Globe', name: '地球', component: Globe },
  { icon: 'Clock', name: '时钟', component: Clock },
  { icon: 'Calendar', name: '日历', component: Calendar },
  { icon: 'Camera', name: '相机', component: Camera },
  { icon: 'Book', name: '书本', component: Book },
  { icon: 'Gamepad2', name: '游戏', component: Gamepad2 },
  { icon: 'Home', name: '家', component: Home },
  { icon: 'Car', name: '汽车', component: Car },
  { icon: 'Plane', name: '飞机', component: Plane },
  { icon: 'Award', name: '奖项', component: Award },
  { icon: 'Gift', name: '礼物', component: Gift },
  { icon: 'Lightbulb', name: '灯泡', component: Lightbulb },
  { icon: 'Shield', name: '盾牌', component: Shield },
  { icon: 'Eye', name: '眼睛', component: Eye },
  { icon: 'Compass', name: '指南针', component: Compass },
  { icon: 'Flag', name: '旗帜', component: Flag },
  { icon: 'Brush', name: '画笔', component: Brush },
  { icon: 'PaletteIcon', name: '调色板', component: PaletteIcon },
  { icon: 'Music', name: '音乐', component: Music }
];

const COLOR_OPTIONS = [
  { name: '日出黄橙', value: 'from-yellow-400 to-orange-500' },
  { name: '海洋蓝绿', value: 'from-green-400 to-blue-500' },
  { name: '热情红粉', value: 'from-red-400 to-pink-500' },
  { name: '神秘紫靛', value: 'from-purple-400 to-indigo-500' },
  { name: '忧郁灰蓝', value: 'from-gray-400 to-blue-600' },
  { name: '浪漫粉红', value: 'from-pink-400 to-red-500' },
  { name: '清新绿青', value: 'from-green-300 to-cyan-400' },
  { name: '温暖橙红', value: 'from-orange-400 to-red-400' },
  { name: '梦幻紫粉', value: 'from-purple-300 to-pink-400' },
  { name: '深邃蓝紫', value: 'from-blue-500 to-purple-600' },
  { name: '活力黄绿', value: 'from-yellow-300 to-green-400' },
  { name: '优雅灰紫', value: 'from-gray-300 to-purple-400' },
  { name: '炙热橙黄', value: 'from-orange-300 to-yellow-400' },
  { name: '冷静蓝灰', value: 'from-blue-300 to-gray-400' },
  { name: '青春粉紫', value: 'from-pink-300 to-purple-300' },
  { name: '自然绿棕', value: 'from-green-400 to-yellow-600' },
  { name: '科技青蓝', value: 'from-cyan-400 to-blue-400' },
  { name: '复古红橙', value: 'from-red-300 to-orange-400' },
  { name: '梦境紫蓝', value: 'from-purple-400 to-blue-400' },
  { name: '春日绿黄', value: 'from-green-300 to-yellow-300' }
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
    icon: 'Smile',
    color: 'from-yellow-400 to-orange-500',
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
      icon: 'Smile',
      color: 'from-yellow-400 to-orange-500',
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
                    {ICON_OPTIONS.map((option) => {
                      const IconComponent = option.component;
                      return (
                        <button
                          key={option.icon}
                          type="button"
                          className={`p-3 rounded-lg border-2 hover:bg-muted transition-colors ${
                            formData.icon === option.icon 
                              ? 'border-primary bg-secondary' 
                              : 'border-border'
                          }`}
                          onClick={() => setFormData({ ...formData, icon: option.icon })}
                          title={option.name}
                        >
                          <IconComponent className="h-5 w-5 mx-auto" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>选择渐变颜色</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {COLOR_OPTIONS.map((color) => (
                      <div
                        key={color.value}
                        className={`relative h-12 rounded-lg overflow-hidden transition-transform hover:scale-105 ${
                          formData.color === color.value 
                            ? 'ring-2 ring-ring ring-offset-2' 
                            : ''
                        }`}
                      >
                        <button
                          type="button"
                          className={`w-full h-full bg-gradient-to-r ${color.value} rounded-lg transition-transform`}
                          onClick={() => setFormData({ ...formData, color: color.value })}
                          title={color.name}
                        />
                        {formData.color === color.value && (
                          <div className="absolute inset-0 rounded-lg border-2 border-foreground pointer-events-none" />
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-3">
                    <Label htmlFor="customColor">自定义渐变</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Input
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        placeholder="from-blue-400 to-purple-500"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <Label className="text-sm font-medium">预览</Label>
                  <div className="mt-2 flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white bg-gradient-to-r ${formData.color}`}>
                      {(() => {
                        const selectedIcon = ICON_OPTIONS.find(option => option.icon === formData.icon);
                        if (selectedIcon) {
                          const IconComponent = selectedIcon.component;
                          return <IconComponent className="h-6 w-6" />;
                        }
                        return <Smile className="h-6 w-6" />;
                      })()}
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
                {filteredMoods.map((mood, index) => {
                  const selectedIcon = ICON_OPTIONS.find(option => option.icon === mood.icon);
                  const IconComponent = selectedIcon?.component || Heart;
                  
                  return (
                    <div key={mood.id}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg bg-gradient-to-r ${mood.color}`}>
                            <IconComponent className="h-7 w-7" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-medium">{mood.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Music className="h-3 w-3" />
                                {mood.songCount} 首歌曲
                              </span>
                              <div className={`px-2 py-1 rounded text-white text-xs font-medium bg-gradient-to-r ${mood.color}`}>
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
                  );
                })}
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