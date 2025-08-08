'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Music, 
  Heart, 
  ChevronLeft, 
  ChevronRight,
  Menu,
  Play,
  List,
  Library,
  Smile
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(true); // 设置为true避免初始动画
  
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
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
      label: '播放列表',
      href: '/playlist',
    },
    {
      icon: Smile,
      label: '心情音乐',
      href: '/moods',
    },
  ];

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
        className="fixed top-4 left-4 z-50 lg:hidden bg-background/80 backdrop-blur-sm border"
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Sidebar */}
      <motion.aside
        initial={{ opacity: 1, x: 0 }}
        animate={{ 
          opacity: isInitialized ? 1 : 0, 
        }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          "h-screen bg-background/95 backdrop-blur-sm border-r border-border transition-all duration-300",
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
                transition={{ duration: 0.3, delay: 0.1 }}
                className="flex flex-col min-w-0 flex-1"
              >
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent whitespace-nowrap">
                  Self-Music
                </h1>
                <p className="text-sm text-muted-foreground mt-1 whitespace-nowrap">
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

          <Separator />

          {/* Navigation */}
          <nav className={cn(
            "flex-1 space-y-1 p-4 transition-all",
            isCollapsed && "p-2"
          )}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-left font-normal transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    pathname === item.href && "bg-accent text-accent-foreground",
                    isCollapsed ? "px-0 justify-center" : "px-3"
                  )}
                  onClick={() => {
                    router.push(item.href);
                    setIsMobileOpen(false);
                  }}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", isCollapsed ? "" : "mr-3")} />
                  {!isCollapsed && (
                    <span className="truncate">
                      {item.label}
                    </span>
                  )}
                </Button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4">
            {!isCollapsed && (
              <div className="text-xs text-muted-foreground text-center">
                © 2024 Self-Music
              </div>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
}