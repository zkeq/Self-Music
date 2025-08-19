'use client';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center p-8 rounded-lg bg-white/10 backdrop-blur-md border border-white/20">
        <div className="mb-6">
          <svg
            className="w-16 h-16 mx-auto text-white/70"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-4">
          网络连接断开
        </h1>
        
        <p className="text-white/80 mb-6 max-w-md">
          当前无法连接到网络，请检查您的网络连接。您可以继续播放已缓存的音乐。
        </p>
        
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 font-medium"
        >
          重试连接
        </button>
        
        <div className="mt-8 text-sm text-white/60">
          <p>离线模式下可用功能：</p>
          <ul className="mt-2 space-y-1">
            <li>• 播放已缓存的音乐</li>
            <li>• 浏览已加载的内容</li>
            <li>• 使用播放列表</li>
          </ul>
        </div>
      </div>
    </div>
  );
}