import { Suspense } from 'react';
import PlayClient from './play-client';

export default function PlayPage() {
  return (
    <Suspense fallback={<div className="p-6 text-muted-foreground">Loading player…</div>}>
      <PlayClient />
    </Suspense>
  );
}
