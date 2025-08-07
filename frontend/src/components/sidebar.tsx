'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Music, 
  Heart, 
  ChevronLeft, 
  ChevronRight,
  Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    {
      icon: Home,
      label: '首页',
      href: '/',
    },
    {
      icon: Music,
      label: '我的歌单',
      href: '/playlists',
    },
    {
      icon: Heart,
      label: '我的心情',
      href: '/moods',
    },
  ];

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
      <aside
        className={cn(
          "h-screen bg-background/95 backdrop-blur-sm border-r border-border transition-all duration-300",
          // Mobile: fixed overlay, Desktop: takes layout space
          "fixed left-0 top-0 z-[50] w-[280px] lg:relative lg:z-auto",
          // Mobile: hidden by default, Desktop: always visible
          "-translate-x-full lg:translate-x-0",
          isMobileOpen && "translate-x-0",
          className
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6">
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Self-Music
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                你的音乐流媒体平台
              </p>
            </div>
          </div>

          <Separator />

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-left font-normal transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    "px-3"
                  )}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <Icon className="h-4 w-4 shrink-0 mr-3" />
                  <span className="truncate">
                    {item.label}
                  </span>
                </Button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4">
            <div className="text-xs text-muted-foreground text-center">
              © 2024 Self-Music
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}