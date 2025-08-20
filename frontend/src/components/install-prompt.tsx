'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // 检查是否已安装
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    const isInWebAppChrome = window.matchMedia('(display-mode: standalone)').matches;
    
    if (isStandalone || isInWebAppiOS || isInWebAppChrome) {
      setIsInstalled(true);
      return;
    }

    // 监听安装提示事件
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // 如果用户已经关闭过，不再显示
      if (isDismissed) return;
      
      // 延迟显示安装提示，避免打断用户体验
      const showTimer = setTimeout(() => {
        setShowInstallPrompt(true);
        
        // 15秒后自动关闭
        const autoHideTimer = setTimeout(() => {
          setShowInstallPrompt(false);
          setIsDismissed(true);
        }, 15000);
        
        // 清理定时器
        return () => clearTimeout(autoHideTimer);
      }, 10000); // 10秒后显示
      
      return () => clearTimeout(showTimer);
    };

    // 监听应用安装事件
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isDismissed]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    } catch (error) {
      console.error('安装提示失败:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setIsDismissed(true);
    // 不再设置重新显示的定时器
  };

  // 如果已安装、已关闭过或没有安装提示，不显示组件
  if (isInstalled || isDismissed || !showInstallPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
      <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-sm text-foreground">
              安装 Self-Music
            </h3>
          </div>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <p className="text-muted-foreground text-xs mb-4 leading-relaxed">
          将 Self-Music 安装到您的设备上，享受更快的访问速度和离线播放功能。安装后即使离线也能播放已缓存的音乐。
        </p>
        
        <div className="flex space-x-2">
          <Button
            onClick={handleInstallClick}
            size="sm"
            className="flex-1"
          >
            立即安装
          </Button>
          <Button
            onClick={handleDismiss}
            size="sm"
            variant="outline"
          >
            稍后
          </Button>
        </div>
        
        <div className="mt-3 text-xs text-muted-foreground">
          💡 安装后自动缓存音乐，实现真正的离线播放
        </div>
      </div>
    </div>
  );
}