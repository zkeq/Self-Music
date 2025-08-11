'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePlayerStore } from '@/lib/store';

export function AudioManager() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isSeekingRef = useRef(false);
  const timeUpdateRef = useRef<number | null>(null);
  const lastSeekTime = useRef<number>(0);

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

  // 处理时间跳转的回调函数
  const handleSeek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio || typeof time !== 'number' || isNaN(time)) return;
    
    const timeDiff = Math.abs(audio.currentTime - time);
    
    // 只有当时间差大于1秒时才进行跳转，避免在正常播放时频繁调整
    if (timeDiff > 1 && !isSeekingRef.current) {
      console.log('Seeking to:', time, 'from:', audio.currentTime);
      isSeekingRef.current = true;
      audio.currentTime = time;
      lastSeekTime.current = time;
    }
  }, []);

  // 初始化音频对象 - 只在组件挂载时执行一次
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio();
      console.log('Audio element created');
    }

    return () => {
      if (timeUpdateRef.current) {
        cancelAnimationFrame(timeUpdateRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // 设置音频事件监听器 - 只在音频元素创建后执行一次
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      console.log('Audio loaded metadata, duration:', audio.duration);
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      if (!isSeekingRef.current && audio.currentTime !== undefined && !isNaN(audio.currentTime)) {
        setCurrentTime(audio.currentTime);
      }
    };

    const handlePlay = () => {
      console.log('Audio play event');
      // 开始定期更新时间
      const updateTime = () => {
        if (!audio.paused && !audio.ended && !isSeekingRef.current) {
          setCurrentTime(audio.currentTime);
          timeUpdateRef.current = requestAnimationFrame(updateTime);
        }
      };
      timeUpdateRef.current = requestAnimationFrame(updateTime);
    };

    const handlePause = () => {
      console.log('Audio pause event');
      if (timeUpdateRef.current) {
        cancelAnimationFrame(timeUpdateRef.current);
        timeUpdateRef.current = null;
      }
    };

    const handleEnded = () => {
      console.log('Audio ended, repeat mode:', repeatMode);
      if (timeUpdateRef.current) {
        cancelAnimationFrame(timeUpdateRef.current);
        timeUpdateRef.current = null;
      }
      
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else if (repeatMode === 'all') {
        nextSong();
      } else {
        pause();
      }
    };

    const handleError = (error: Event) => {
      console.error('Audio error:', error);
      console.error('Audio source:', audio.src);
      pause();
    };

    const handleCanPlay = () => {
      console.log('Audio can play, duration:', audio.duration);
    };

    const handleLoadStart = () => {
      console.log('Loading audio:', audio.src);
    };

    const handleSeeking = () => {
      isSeekingRef.current = true;
    };

    const handleSeeked = () => {
      isSeekingRef.current = false;
      setCurrentTime(audio.currentTime);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('seeking', handleSeeking);
    audio.addEventListener('seeked', handleSeeked);

    return () => {
      if (timeUpdateRef.current) {
        cancelAnimationFrame(timeUpdateRef.current);
      }
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('seeking', handleSeeking);
      audio.removeEventListener('seeked', handleSeeked);
    };
  }, [setCurrentTime, setDuration, pause, nextSong]);

  // 处理歌曲切换
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;
    
    // 使用提供的audioUrl或fileUrl，或构建默认URL
    const audioUrl = currentSong.audioUrl || 
                    currentSong.fileUrl ||
                    `http://localhost:8000/api/songs/${currentSong.id}/stream`;
    
    console.log('Loading new song:', currentSong.title, 'URL:', audioUrl);
    
    if (audio.src !== audioUrl) {
      // 停止之前的时间更新
      if (timeUpdateRef.current) {
        cancelAnimationFrame(timeUpdateRef.current);
        timeUpdateRef.current = null;
      }
      
      audio.src = audioUrl;
      audio.load();
      console.log('Audio source set to:', audioUrl);
    }
  }, [currentSong]);

  // 处理播放/暂停
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
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
  }, [isPlaying, currentSong, pause]);

  // 处理音量变化
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  // 使用 useEffect 监听 currentTime 变化，但不将其作为依赖
  useEffect(() => {
    // 避免在初始渲染时执行 seek
    if (typeof currentTime === 'number' && currentTime !== lastSeekTime.current) {
      handleSeek(currentTime);
    }
  });

  // 这个组件不渲染任何可见内容，只管理音频播放
  return null;
}