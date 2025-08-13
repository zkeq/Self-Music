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
  const [repeatMode, setRepeatMode] = useState<'none' | 'all' | 'one'>('none');
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
      artist: {
        id: 'artist-1',
        name: '艺术家名称',
        avatar: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop&crop=face',
        followers: 100000,
        songCount: 25,
        genres: ['流行', '摇滚'],
        verified: true,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z'
      },
      album: {
        id: '1',
        title: '十一月的萧邦',
        artist: {
          id: 'artist-1',
          name: '周杰伦',
          avatar: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop&crop=face',
          followers: 100000,
          songCount: 25,
          genres: ['华语流行'],
          verified: true,
          createdAt: '2005-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        },
        artistId: '1',
        coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
        releaseDate: '2005-11-01',
        songCount: 12,
        duration: 3480,
        genre: '华语流行',
        description: '周杰伦第六张录音室专辑',
        createdAt: '2005-11-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      artistId: 'artist-1',
      albumId: 'album-1',
      duration: 204,
      moods: [{
        id: 'happy',
        name: '快乐',
        description: '充满活力和正能量的音乐',
        icon: 'Smile',
        color: 'from-yellow-400 to-orange-500',
        coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
        songCount: 124,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }],
      moodIds: ['mood-1', 'mood-2'],
      coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&crop=face',
      audioUrl: `/api/songs/${songId}/stream`,
      playCount: 1000,
      liked: false,
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
  const handleRepeat = () => {
    const modes: ('none' | 'all' | 'one')[] = ['none', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setRepeatMode(nextMode);
  };
  const handleMute = () => setIsMuted(!isMuted);
  const handleLike = () => setIsLiked(!isLiked);
  const handleVolumeChange = (value: number[]) => setVolume(value[0]);
  const handleSeek = (value: number[]) => setCurrentTime(value[0]);
  const handleLyricClick = (time: number) => setCurrentTime(time);
  const handleFullscreenLyrics = () => setIsFullscreenLyrics(true);
  const handleCloseFullscreenLyrics = () => setIsFullscreenLyrics(false);

  if (isLoading || !song) {
    return (
      <div className="h-full bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载歌曲中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-background relative overflow-hidden lg:flex">
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
              repeatMode={repeatMode}
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
        artistName={song.artist.name}
      />
    </div>
  );
}