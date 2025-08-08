'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { PlayerLayout, PlayerLeftSection, PlayerRightSection } from '@/components/player-layout';
import { AlbumCover, SongInfo } from '@/components/song-info';
import { PlayerControls } from '@/components/player-controls';
import { LyricsCard } from '@/components/lyrics-display';
import { FullscreenLyrics } from '@/components/fullscreen-lyrics';
import { ThemeToggle } from '@/components/theme-toggle';
import { AmbientGlow } from '@/components/ambient-glow';

// Mock data for demonstration
const mockSong = {
  id: '1',
  title: '选择一首歌曲开始播放',
  artist: 'Self-Music Platform',
  album: '欢迎使用',
  duration: 204, // 3:24 in seconds
  mood: ['放松', '专注', '快乐'],
  coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&crop=face', // Sample cover
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockLyrics = [
  { time: 0, text: '欢迎使用 Self-Music' },
  { time: 5, text: '你的专属音乐流媒体平台' },
  { time: 10, text: '在这里发现更多美妙的音乐' },
  { time: 15, text: '让音乐陪伴你的每一刻' },
  { time: 20, text: '♪ 享受音乐带来的快乐 ♪' },
  { time: 30, text: '欢迎使用 Self-Music' },
  { time: 35, text: '你的专属音乐流媒体平台' },
  { time: 40, text: '在这里发现更多美妙的音乐' },
  { time: 45, text: '让音乐陪伴你的每一刻' },
  { time: 50, text: '♪ 享受音乐带来的快乐 ♪' },
];

export default function PlayPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [volume, setVolume] = useState(75);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullscreenLyrics, setIsFullscreenLyrics] = useState(false);

  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handlePrevious = () => console.log('Previous song');
  const handleNext = () => console.log('Next song');
  const handleShuffle = () => setIsShuffle(!isShuffle);
  const handleRepeat = () => setIsRepeat(!isRepeat);
  const handleMute = () => setIsMuted(!isMuted);
  const handleLike = () => setIsLiked(!isLiked);
  const handleVolumeChange = (value: number[]) => setVolume(value[0]);
  const handleSeek = (value: number[]) => setCurrentTime(value[0]);
  const handleLyricClick = (time: number) => setCurrentTime(time);
  const handleFullscreenLyrics = () => setIsFullscreenLyrics(true);
  const handleCloseFullscreenLyrics = () => setIsFullscreenLyrics(false);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden lg:flex">
      {/* Dynamic Ambient Glow Background */}
      <AmbientGlow 
        imageUrl={mockSong.coverUrl} 
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
            <AlbumCover song={mockSong} />
            <SongInfo song={mockSong} />
            <PlayerControls
              isPlaying={isPlaying}
              isShuffle={isShuffle}
              isRepeat={isRepeat}
              isMuted={isMuted}
              isLiked={isLiked}
              volume={volume}
              currentTime={currentTime}
              duration={mockSong.duration}
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
              lyrics={mockLyrics}
              currentTime={currentTime}
              onLyricClick={handleLyricClick}
              onFullscreen={handleFullscreenLyrics}
            />
          </PlayerRightSection>
        </PlayerLayout>
      </div>

      {/* Fullscreen Lyrics Modal */}
      <FullscreenLyrics
        lyrics={mockLyrics}
        currentTime={currentTime}
        onLyricClick={handleLyricClick}
        isOpen={isFullscreenLyrics}
        onClose={handleCloseFullscreenLyrics}
        songTitle={mockSong.title}
        artistName={mockSong.artist}
      />
    </div>
  );
}