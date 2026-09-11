'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  Play,
  List,
  Library,
  Smile,
  Users,
  Settings,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const pathname = usePathname();
  const isPlayerPage = pathname === '/play';

  const menuItems = [
    {
      icon: Heart,
      label: '音乐朋友圈',
      href: '/moments',
    },
    {
      icon: Play,
      label: '播放器',
      href: '/play',
    },
    {
      icon: Library,
      label: '所有歌曲',
      href: '/songs',
    },
    {
      icon: List,
      label: '热门歌单',
      href: '/playlists',
    },
    {
      icon: Users,
      label: '热门艺术家',
      href: '/artists',
    },
    {
      icon: Smile,
      label: '心情音乐',
      href: '/moods',
    },
  ];

  // 客户端挂载后设置初始化状态
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[45] lg:hidden"
            onClick={toggleMobile}
          />
        )}
      </AnimatePresence>

      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMobile}
        className={cn(
          "fixed top-4 left-4 z-50 border backdrop-blur-xl lg:hidden",
          isPlayerPage
            ? "border-white/15 bg-black/20 text-white hover:bg-white/15 hover:text-white"
            : "bg-background/80",
        )}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Sidebar */}
      <aside
        suppressHydrationWarning
        className={cn(
          "h-[100dvh] border-r transition-all duration-300",
          isPlayerPage
            ? "border-white/10 bg-black/20 text-white backdrop-blur-2xl"
            : "border-border bg-background/95 backdrop-blur-sm",
          // Mobile: fixed overlay, Desktop: takes layout space
          "fixed left-0 top-0 z-[50] w-[280px] lg:relative lg:z-auto",
          isCollapsed && "lg:w-16",
          !isCollapsed && "lg:w-[280px]",
          // Mobile: hidden by default, Desktop: always visible
          "-translate-x-full lg:translate-x-0",
          isMobileOpen && "translate-x-0",
          className
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className={cn(
            "flex items-center p-6 transition-all duration-300 min-h-[88px]",
            isCollapsed ? "justify-center" : "justify-between"
          )}>
            {!isCollapsed && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="flex flex-col min-w-0 flex-1"
              >
                <h1 className={cn(
                  "text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent whitespace-nowrap",
                  isPlayerPage ? "from-white to-white/60" : "from-primary to-primary/60",
                )}>
                  Self-Music
                </h1>
                <p className={cn(
                  "mt-1 whitespace-nowrap text-sm",
                  isPlayerPage ? "text-white/55" : "text-muted-foreground",
                )}>
                  你的音乐流媒体平台
                </p>
              </motion.div>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapse}
              className={cn(
                "hidden lg:flex shrink-0 h-8 w-8 transition-all",
                isPlayerPage && "text-white/75 hover:bg-white/12 hover:text-white",
                isCollapsed ? "mx-auto" : ""
              )}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          <Separator className={isPlayerPage ? "bg-white/10" : undefined} />

          {/* Navigation */}
          <nav
            suppressHydrationWarning
            className={cn(
              "flex-1 space-y-1 p-4 transition-all overflow-hidden",
              isCollapsed && "p-2"
            )}
          >
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-left font-normal transition-all duration-300",
                        isPlayerPage
                          ? "text-white/72 hover:bg-white/12 hover:text-white"
                          : "hover:bg-accent hover:text-accent-foreground",
                        isInitialized && pathname === item.href && (
                          isPlayerPage
                            ? "bg-white/16 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                            : "bg-accent text-accent-foreground"
                        ),
                        isCollapsed ? "px-0 justify-center" : "px-3"
                      )}
                    >
                      <Icon className={cn("h-4 w-4 shrink-0 transition-all duration-300", isCollapsed ? "" : "mr-3")} />
                      <span className={cn(
                        "truncate transition-all duration-300 overflow-hidden",
                        isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                      )}>
                        {item.label}
                      </span>
                    </Button>
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 space-y-3">
            {/* Netlify Badge */}
            {!isCollapsed && (
              <div className="text-center">
                <a 
                  href="https://www.netlify.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <img 
                    src="https://www.netlify.com/assets/badges/netlify-badge-color-accent.svg" 
                    alt="Deploys by Netlify" 
                    className="h-8"
                  />
                </a>
              </div>
            )}
            
            {/* Admin Panel Link */}
            <div>
              <a href="/admin/login" onClick={() => setIsMobileOpen(false)}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-left font-normal transition-all duration-300",
                    isPlayerPage
                      ? "border border-white/10 text-white/70 hover:bg-white/12 hover:text-white"
                      : "hover:bg-accent hover:text-accent-foreground border border-border/50",
                    isCollapsed ? "px-0 justify-center" : "px-3"
                  )}
                >
                  <Settings className={cn("h-4 w-4 shrink-0 transition-all duration-300", isCollapsed ? "" : "mr-3")} />
                  <span className={cn(
                    "truncate transition-all duration-300 overflow-hidden",
                    isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                  )}>
                    管理面板
                  </span>
                </Button>
              </a>
            </div>
            
            {!isCollapsed && (
              <div className={cn(
                "text-center text-xs",
                isPlayerPage ? "text-white/45" : "text-muted-foreground",
              )}>
                © 2024 Self-Music
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
