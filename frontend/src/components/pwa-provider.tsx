'use client';

import { useEffect } from 'react';

export function PWAProvider() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker 注册成功:', registration);

      // 监听Service Worker更新
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('新的 Service Worker 可用');
              // 可以在这里显示更新提示
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        }
      });

      // 监听Service Worker控制权变化
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker 控制权已变更，页面将重载');
        window.location.reload();
      });

    } catch (error) {
      console.error('Service Worker 注册失败:', error);
    }
  };

  return null;
}