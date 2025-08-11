'use client';

import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/lib/store';

export function AudioManager() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const {
    currentSong,
    isPlaying,
    volume,
    currentTime,
    repeatMode,
    setCurrentTime,
    setDuration,
    pause,
    nextSong,
  } = usePlayerStore();

  // 初始化音频对象
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
      const audio = audioRef.current;

      // 设置音频事件监听器
      const handleLoadedMetadata = () => {
        setDuration(audio.duration);
      };

      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };

      const handleEnded = () => {
        if (repeatMode === 'one') {
          audio.currentTime = 0;
          audio.play();
        } else if (repeatMode === 'all') {
          nextSong();
        } else {
          pause();
        }
      };

      const handleError = (error: Event) => {
        console.error('Audio error:', error);
        console.error('Audio source:', audioRef.current?.src);
        pause();
      };

      const handleCanPlay = () => {
        console.log('Audio can play, duration:', audio.duration);
        if (isPlaying) {
          console.log('Auto-starting playback...');
          audio.play().catch(console.error);
        }
      };

      const handleLoadStart = () => {
        console.log('Loading audio:', audio.src);
      };

      const handleCanPlayThrough = () => {
        console.log('Audio fully loaded and can play through');
      };

      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);
      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('loadstart', handleLoadStart);
      audio.addEventListener('canplaythrough', handleCanPlayThrough);

      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('loadstart', handleLoadStart);
        audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      };
    }
  }, [setCurrentTime, setDuration, pause, nextSong, repeatMode, isPlaying]);

  // 处理歌曲切换
  useEffect(() => {
    if (audioRef.current && currentSong) {
      const audio = audioRef.current;
      
      // 使用提供的audioUrl或构建默认URL
      const audioUrl = currentSong.audioUrl || `http://localhost:8000/api/songs/${currentSong.id}/stream`;
      
      console.log('Loading new song:', currentSong.title, 'URL:', audioUrl);
      
      if (audio.src !== audioUrl) {
        audio.src = audioUrl;
        audio.load();
        console.log('Audio source set to:', audioUrl);
      }
    }
  }, [currentSong]);

  // 处理播放/暂停
  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      
      if (isPlaying && currentSong) {
        console.log('Attempting to play:', currentSong.title);
        audio.play().catch((error) => {
          console.error('Play error:', error);
          console.error('Audio ready state:', audio.readyState);
          console.error('Audio src:', audio.src);
          pause();
        });
      } else {
        console.log('Pausing audio');
        audio.pause();
      }
    }
  }, [isPlaying, currentSong, pause]);

  // 处理音量变化
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // 处理时间跳转（当用户拖拽进度条时）
  useEffect(() => {
    if (audioRef.current && Math.abs(audioRef.current.currentTime - currentTime) > 1) {
      audioRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // 这个组件不渲染任何可见内容，只管理音频播放
  return null;
}