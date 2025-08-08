'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { PlayerLayout, PlayerLeftSection, PlayerRightSection } from '@/components/player-layout';
import { AlbumCover, SongInfo } from '@/components/song-info';
import { PlayerControls } from '@/components/player-controls';
import { LyricsCard } from '@/components/lyrics-display';
import { FullscreenLyrics } from '@/components/fullscreen-lyrics';
import { ThemeToggle } from '@/components/theme-toggle';
import { AmbientGlow } from '@/components/ambient-glow';
import type { Song } from '@/types';

export default function PlaySongPage() {
  const params = useParams();
  const songId = params.id as string;
  
  const [song, setSong] = useState<Song | null>(null);
  const [lyrics, setLyrics] = useState<Array<{ time: number; text: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [volume, setVolume] = useState(75);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullscreenLyrics, setIsFullscreenLyrics] = useState(false);

  // Mock data - in real app, fetch from API
  useEffect(() => {
    const mockSong: Song = {
      id: songId,
      title: '特定歌曲播放',
      artist: '艺术家名称',
      album: '专辑名称',
      duration: 204,
      mood: ['放松', '专注'],
      coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&crop=face',
      audioUrl: `/api/songs/${songId}/stream`,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
    };

    const mockLyrics = [
      { time: 0, text: `正在播放歌曲 ID: ${songId}` },
      { time: 5, text: '这是一首特定的歌曲' },
      { time: 10, text: '通过歌曲 ID 访问播放' },
      { time: 15, text: '享受专属的音乐体验' },
      { time: 20, text: '♪ 让音乐带你飞翔 ♪' },
    ];

    setSong(mockSong);
    setLyrics(mockLyrics);
    setIsLoading(false);
    
    // Auto play when song loads
    setIsPlaying(true);
  }, [songId]);

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

  if (isLoading || !song) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载歌曲中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden lg:flex">
      {/* Dynamic Ambient Glow Background */}
      <AmbientGlow 
        imageUrl={song.coverUrl} 
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
            <AlbumCover song={song} />
            <SongInfo song={song} />
            <PlayerControls
              isPlaying={isPlaying}
              isShuffle={isShuffle}
              isRepeat={isRepeat}
              isMuted={isMuted}
              isLiked={isLiked}
              volume={volume}
              currentTime={currentTime}
              duration={song.duration}
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
              lyrics={lyrics}
              currentTime={currentTime}
              onLyricClick={handleLyricClick}
              onFullscreen={handleFullscreenLyrics}
            />
          </PlayerRightSection>
        </PlayerLayout>
      </div>

      {/* Fullscreen Lyrics Modal */}
      <FullscreenLyrics
        lyrics={lyrics}
        currentTime={currentTime}
        onLyricClick={handleLyricClick}
        isOpen={isFullscreenLyrics}
        onClose={handleCloseFullscreenLyrics}
        songTitle={song.title}
        artistName={song.artist}
      />
    </div>
  );
}