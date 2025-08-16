"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { adminAPI } from '@/lib/admin-api';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Users, 
  Music, 
  Album, 
  Heart, 
  List,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface User {
  username: string;
  role: string;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!adminAPI.isAuthenticated()) {
      router.push('/admin/login');
      return;
    }
    
    const currentUser = adminAPI.getCurrentUser();
    setUser(currentUser);
  }, [router]);

  const handleLogout = () => {
    adminAPI.logout();
    router.push('/admin/login');
  };

  const menuItems = [
    { icon: Download, label: '一键导入', href: '/admin/import' },
    { icon: Users, label: '艺术家', href: '/admin/artists' },
    { icon: Album, label: '专辑', href: '/admin/albums' },
    { icon: Music, label: '歌曲', href: '/admin/songs' },
    { icon: Heart, label: '心情', href: '/admin/moods' },
    { icon: List, label: '歌单', href: '/admin/playlists' },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden bg-background border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Settings className="h-4 w-4 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-semibold">管理后台</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-50 bg-card border-r border-border transition-all duration-300 lg:relative lg:translate-x-0",
          sidebarCollapsed ? "w-16" : "w-64",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="p-6">
              <div className={cn(
                "flex items-center",
                sidebarCollapsed ? "justify-center" : "justify-between"
              )}>
                {!sidebarCollapsed && (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <Settings className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div>
                      <h1 className="text-lg font-semibold">管理后台</h1>
                      <p className="text-sm text-muted-foreground">Self-Music</p>
                    </div>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden lg:flex"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                >
                  {sidebarCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Separator />

            {/* User Info */}
            {!sidebarCollapsed && (
              <div className="p-6 pt-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user.username}</p>
                    <p className="text-xs text-muted-foreground">{user.role}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 px-3 space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Button
                    key={item.href}
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      sidebarCollapsed ? "px-2" : "px-3"
                    )}
                    onClick={() => {
                      router.push(item.href);
                      setSidebarOpen(false);
                    }}
                  >
                    <item.icon className={cn("h-4 w-4", !sidebarCollapsed && "mr-3")} />
                    {!sidebarCollapsed && item.label}
                  </Button>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-3">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10",
                  sidebarCollapsed ? "px-2" : "px-3"
                )}
                onClick={handleLogout}
              >
                <LogOut className={cn("h-4 w-4", !sidebarCollapsed && "mr-3")} />
                {!sidebarCollapsed && "退出登录"}
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}