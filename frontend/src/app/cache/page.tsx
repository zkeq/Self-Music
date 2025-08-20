import { CacheStatusPanel } from '@/components/cache-status-panel';

export default function CachePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">缓存管理</h1>
      <CacheStatusPanel />
    </div>
  );
}