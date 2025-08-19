'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePlayerStore } from '@/lib/store';
import { useSongsStore } from '@/lib/data-stores';  // 导入歌曲存储以记录播放量

export function AudioManager() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeUpdateRef = useRef<number | null>(null);
  const defaultTitleRef = useRef<string | null>(null);

  const {
    currentSong,
    isPlaying,
    volume,
    currentTime,
    repeatMode,
    shouldSeek,
    setCurrentTime,
    setDuration,
    pause,
    nextSong,
  } = usePlayerStore();

  const { recordPlay } = useSongsStore();  // 获取播放量记录方法
  const hasRecordedPlay = useRef<Set<string>>(new Set());  // 跟踪已记录播放量的歌曲

  // 处理时间跳转的回调函数
  const handleSeek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio || typeof time !== 'number' || isNaN(time)) return;
    
    audio.currentTime = time;
  }, []);

  // 初始化音频对象 - 只在组件挂载时执行一次
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio();
      console.log('Audio element created');
    }

    // 记录初始标题
    if (typeof document !== 'undefined' && defaultTitleRef.current === null) {
      defaultTitleRef.current = document.title;
    }

    return () => {
      if (timeUpdateRef.current) {
        cancelAnimationFrame(timeUpdateRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }

      // 恢复标题
      if (typeof document !== 'undefined' && defaultTitleRef.current) {
        document.title = defaultTitleRef.current;
      }
    };
  }, []);

  // 根据播放状态与当前歌曲动态更新页面标题
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const baseTitle = defaultTitleRef.current || 'Self-Music - 音乐流媒体平台';

    if (currentSong && isPlaying) {
      const artistName = (typeof currentSong.artist === 'string')
        ? currentSong.artist
        : currentSong.artist?.name;
      const nowPlaying = `♪ 正在播放：${currentSong.title}${artistName ? ` - ${artistName}` : ''} | Self-Music`;
      document.title = nowPlaying;
    } else {
      document.title = baseTitle;
    }
  }, [currentSong, isPlaying]);

  // 设置音频事件监听器 - 只在音频元素创建后执行一次
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      console.log('Audio loaded metadata, duration:', audio.duration);
      if (audio.duration > 0 && audio.duration !== Infinity) {
        setDuration(audio.duration);
      }
    };

    const handleLoadedData = () => {
      console.log('Audio loaded data, duration:', audio.duration);
      if (audio.duration > 0 && audio.duration !== Infinity) {
        setDuration(audio.duration);
      }
    };

    const handleCanPlay = () => {
      console.log('Audio can play, duration:', audio.duration);
      if (audio.duration > 0 && audio.duration !== Infinity) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handlePlay = () => {
      console.log('Audio play event');
      
      // 记录播放量（仅为真实歌曲，且每首歌曲只记录一次）
      if (currentSong && currentSong.id !== 'demo-song-1' && !hasRecordedPlay.current.has(currentSong.id)) {
        console.log('Recording play for song:', currentSong.title);
        recordPlay(currentSong.id);
        hasRecordedPlay.current.add(currentSong.id);
      }
      
      // 开始定期更新时间
      const updateTime = () => {
        if (!audio.paused && !audio.ended) {
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

      switch (repeatMode) {
        case 'one':
          audio.currentTime = 0;
          audio.play().catch(console.error);
          break;
        default:
          nextSong();
      }
    };

    const handleError = (error: Event) => {
      console.error('Audio error:', error);
      console.error('Audio source:', audio.src);
      pause();
    };

    const handleSeeked = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('seeked', handleSeeked);

    return () => {
      if (timeUpdateRef.current) {
        cancelAnimationFrame(timeUpdateRef.current);
      }
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('seeked', handleSeeked);
    };
  }, [setCurrentTime, setDuration, pause, nextSong, currentSong, recordPlay, repeatMode]); // ensure repeat mode updates

  // 处理歌曲切换
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;
    
    // 当歌曲切换时，重置播放记录（允许重复播放同一首歌曲时记录播放量）
    if (currentSong.id && currentSong.id !== 'demo-song-1') {
      hasRecordedPlay.current.clear();
    }
    
    // 使用提供的audioUrl或fileUrl，或构建默认URL
    const audioUrl = currentSong.audioUrl || 
                    `http://localhost:8000/api/songs/${currentSong.id}/stream`;
    
    console.log('Loading new song:', currentSong.title, 'URL:', audioUrl);
    
    // 检查是否是新的音频源
    if (audio.src !== audioUrl) {
      // 停止之前的时间更新
      if (timeUpdateRef.current) {
        cancelAnimationFrame(timeUpdateRef.current);
        timeUpdateRef.current = null;
      }
      
      audio.src = audioUrl;
      audio.load();
      console.log('Audio source set to:', audioUrl);
    } else {
      // 如果是相同的音频源，检查是否需要更新时长
      if (audio.duration > 0 && audio.duration !== Infinity) {
        console.log('Same audio source, updating duration:', audio.duration);
        setDuration(audio.duration);
      }
    }
  }, [currentSong, setDuration]);

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

  // 处理用户主动的时间跳转请求
  useEffect(() => {
    if (shouldSeek !== null) {
      handleSeek(shouldSeek);
      // 清除 shouldSeek 标志，避免重复触发
      usePlayerStore.setState({ shouldSeek: null });
    }
  }, [shouldSeek, handleSeek]);

  // 暴露 handleSeek 函数供外部使用，移除自动触发的 useEffect
  // handleSeek 函数已经通过 handleSeek callback 暴露给外部组件使用

  // 这个组件不渲染任何可见内容，只管理音频播放
  return null;
}
