'use client';

import { useEffect, useState } from 'react';

export function PWAProvider() {
  const [shouldRegister, setShouldRegister] = useState(false);

  useEffect(() => {
    // 检查是否已安装为PWA
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
      const isInWebAppChrome = window.matchMedia('(display-mode: standalone)').matches;
      
      return isStandalone || isInWebAppiOS || isInWebAppChrome;
    };

    // 只有在PWA模式下才注册Service Worker
    if (checkIfInstalled()) {
      setShouldRegister(true);
    } else if ('serviceWorker' in navigator) {
      // 如果不是PWA模式，尝试卸载现有的Service Worker（但保留缓存）
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.unregister().then(success => {
            if (success) {
              console.log('Service Worker unregistered for non-PWA mode, cache preserved');
            }
          });
        });
      });
    }

    // 监听PWA安装事件
    const handleAppInstalled = () => {
      console.log('PWA installed, registering Service Worker...');
      setShouldRegister(true);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (shouldRegister && 'serviceWorker' in navigator) {
      registerServiceWorker();
    }
  }, [shouldRegister]);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker installed, notify user about update
              console.log('New version available! Please refresh the page.');
              
              // Optionally show a notification or update UI
              if ('showDirectoryPicker' in window || window.confirm('新版本可用，是否立即刷新页面？')) {
                window.location.reload();
              }
            }
          });
        }
      });

      // Handle messages from service worker
      navigator.serviceWorker.addEventListener('message', event => {
        console.log('Message from service worker:', event.data);
      });

      console.log('Service Worker registered successfully:', registration.scope);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  return null;
}