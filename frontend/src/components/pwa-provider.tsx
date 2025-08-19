'use client';

import { useEffect } from 'react';

export function PWAProvider() {
  useEffect(() => {
    // 基础PWA支持检测
    if ('serviceWorker' in navigator) {
      console.log('PWA支持已启用');
    }
  }, []);

  return null;
}