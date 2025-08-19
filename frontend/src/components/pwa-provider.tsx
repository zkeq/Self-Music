'use client';

import { useEffect } from 'react';

export function PWAProvider() {
  useEffect(() => {
    // 基础PWA支持检测
    if ('serviceWorker' in navigator) {
      // 不注册service worker，只检测PWA支持
      console.log('PWA支持已启用');
    }
  }, []);

  return null;
}