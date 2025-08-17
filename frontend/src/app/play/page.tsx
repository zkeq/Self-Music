import { Suspense } from 'react';
import PlayClient from './play-client';

function PlayFallback() {
  return (
    <div className="h-full bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">加载中...</p>
      </div>
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense fallback={<PlayFallback />}>
      <PlayClient />
    </Suspense>
  );
}
