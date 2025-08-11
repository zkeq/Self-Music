'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePlayerStore } from '@/lib/store';
import { Sidebar } from '@/components/sidebar';
import { PlayerLayout, PlayerLeftSection, PlayerRightSection } from '@/components/player-layout';
import { AlbumCover, SongInfo } from '@/components/song-info';
import { PlayerControls } from '@/components/player-controls';
import { LyricsCard } from '@/components/lyrics-display';
import { FullscreenLyrics } from '@/components/fullscreen-lyrics';
import { ThemeToggle } from '@/components/theme-toggle';
import { AmbientGlow } from '@/components/ambient-glow';
import { PlaylistPanel } from '@/components/playlist-panel';

export default function PlayPage() {
  const {
    currentSong,
    isPlaying,
    volume,
    currentTime,
    duration,
    playlist,
    currentIndex,
    repeatMode,
    shuffleMode,
    isLoading,
    error,
    play,
    pause,
    nextSong,
    previousSong,
    setVolume,
    setCurrentTime,
    toggleRepeat,
    toggleShuffle,
    seekTo,
    canPlayNext,
    canPlayPrevious,
  } = usePlayerStore();

  const [isFullscreenLyrics, setIsFullscreenLyrics] = useState(false);
  
  // 动态歌词数据 - 可以从API获取或基于当前歌曲生成
  const currentLyrics = useMemo(() => {
    if (!currentSong) return [];
    
    // 这里可以调用API获取歌词，暂时使用基于歌曲的模拟数据
    const baseLyrics = [
      { time: 0, text: `♪ ${currentSong.title} ♪` },
      { time: 10, text: `演唱：${currentSong.artist}` },
      { time: 20, text: `专辑：${currentSong.album || '单曲'}` },
      { time: 30, text: '在音乐的世界里' },
      { time: 40, text: '感受每一个节拍' },
      { time: 50, text: '让旋律带走烦恼' },
      { time: 60, text: '沉浸在美妙的声音中' },
      { time: 80, text: `♪ ${currentSong.title} ♪` },
      { time: 90, text: '音乐无处不在' },
      { time: 100, text: '每一首歌都是一个故事' },
    ];
    
    return baseLyrics;
  }, [currentSong]);

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const handlePrevious = () => {
    if (canPlayPrevious()) {
      previousSong();
    }
  };
  const handleNext = () => {
    if (canPlayNext()) {
      nextSong();
    }
  };
  const handleShuffle = () => toggleShuffle();
  const handleRepeat = () => toggleRepeat();
  const handleMute = () => setVolume(volume === 0 ? 0.75 : 0);
  const handleLike = () => console.log('Like song:', currentSong?.title);
  const handleVolumeChange = (value: number[]) => setVolume(value[0] / 100);
  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    seekTo(newTime);
  };
  const handleLyricClick = (time: number) => {
    setCurrentTime(time);
    seekTo(time);
  };
  const handleFullscreenLyrics = () => setIsFullscreenLyrics(true);
  const handleCloseFullscreenLyrics = () => setIsFullscreenLyrics(false);

  // 默认显示歌曲信息，当没有选择歌曲时
  const displaySong = currentSong || {
    id: 'welcome',
    title: '选择一首歌曲开始播放',
    artist: 'Self-Music Platform',
    album: '欢迎使用',
    duration: 204,
    mood: ['放松', '专注', '快乐'],
    coverUrl: 'http://p1.music.126.net/CyqwMIOhD_DnBqPF1tGFhw==/109951164276956232.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 当没有歌曲时显示默认歌词
  const defaultLyrics = [
    { time: 0, text: '欢迎使用 Self-Music' },
    { time: 10, text: '你的专属音乐流媒体平台' },
    { time: 20, text: '在这里发现更多美妙的音乐' },
    { time: 30, text: '让音乐陪伴你的每一刻' },
    { time: 40, text: '♪ 享受音乐带来的快乐 ♪' },
  ];

  const displayLyrics = currentSong ? currentLyrics : defaultLyrics;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden lg:flex">
      {/* Dynamic Ambient Glow Background */}
      <AmbientGlow 
        imageUrl={displaySong.coverUrl} 
        intensity="medium"
        className="fixed inset-0 z-0" 
      />
      
      {/* Sidebar - Mobile: Fixed overlay, Desktop: Takes layout space */}
      <Sidebar />
      
      {/* Main Content - Full width on mobile, flex-1 on desktop */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Theme Toggle */}
        <div className="absolute top-4 right-4 z-30">
          <ThemeToggle />
        </div>

        {/* Player Layout */}
        <PlayerLayout className="pt-16 lg:pt-0">
          {/* Left Section - Album Cover and Song Info */}
          <PlayerLeftSection>
            <AlbumCover song={displaySong} />
            <SongInfo song={displaySong} />
            <PlayerControls
              isPlaying={isPlaying}
              isShuffle={shuffleMode}
              isRepeat={repeatMode !== 'none'}
              isMuted={volume === 0}
              isLiked={false}
              volume={volume * 100}
              currentTime={currentTime}
              duration={duration || displaySong.duration}
              onPlayPause={handlePlayPause}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onShuffle={handleShuffle}
              onRepeat={handleRepeat}
              onMute={handleMute}
              onLike={handleLike}
              onVolumeChange={handleVolumeChange}
              onSeek={handleSeek}
              className="w-full max-w-md"
            />
          </PlayerLeftSection>

          {/* Right Section - Lyrics */}
          <PlayerRightSection>
            <LyricsCard
              lyrics={displayLyrics}
              currentTime={currentTime}
              onLyricClick={handleLyricClick}
              onFullscreen={handleFullscreenLyrics}
            />
          </PlayerRightSection>
        </PlayerLayout>
      </div>

      {/* Playlist Panel */}
      <PlaylistPanel />

      {/* Fullscreen Lyrics Modal */}
      <FullscreenLyrics
        lyrics={displayLyrics}
        currentTime={currentTime}
        onLyricClick={handleLyricClick}
        isOpen={isFullscreenLyrics}
        onClose={handleCloseFullscreenLyrics}
        songTitle={displaySong.title}
        artistName={displaySong.artist}
      />
    </div>
  );
}