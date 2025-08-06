'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme-toggle'
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Heart,
  Music,
  Upload,
  Repeat,
  Shuffle
} from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Music className="h-6 w-6" />
            <h1 className="text-xl font-semibold">Self-Music</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              上传音乐
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Player Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Album Art */}
                  <div className="flex justify-center">
                    <div className="aspect-square w-full max-w-sm bg-muted rounded-lg flex items-center justify-center">
                      <Music className="h-16 w-16 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Song Info and Controls */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold">选择一首歌曲开始播放</h2>
                      <p className="text-muted-foreground">Self-Music Platform</p>
                    </div>

                    {/* Mood Tags */}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">放松</Badge>
                      <Badge variant="secondary">专注</Badge>
                      <Badge variant="secondary">快乐</Badge>
                    </div>

                    <Separator />

                    {/* Progress */}
                    <div className="space-y-2">
                      <Progress value={33} className="w-full" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>0:00</span>
                        <span>3:24</span>
                      </div>
                    </div>

                    {/* Player Controls */}
                    <div className="flex items-center justify-center space-x-2">
                      <Button variant="ghost" size="icon">
                        <Shuffle className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <SkipBack className="h-4 w-4" />
                      </Button>
                      <Button size="icon" className="h-12 w-12">
                        <Play className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <SkipForward className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Repeat className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Volume and Like */}
                    <div className="flex items-center justify-between">
                      <Button variant="ghost" size="icon">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center space-x-2">
                        <Volume2 className="h-4 w-4" />
                        <div className="w-24">
                          <Progress value={75} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">快速操作</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Music className="mr-2 h-4 w-4" />
                    浏览歌单
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Heart className="mr-2 h-4 w-4" />
                    我的收藏
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Shuffle className="mr-2 h-4 w-4" />
                    心情电台
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Playlists */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">最近播放</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                      <Music className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">暂无播放记录</p>
                      <p className="text-sm text-muted-foreground truncate">开始播放音乐</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}