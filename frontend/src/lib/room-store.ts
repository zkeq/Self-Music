'use client';

import { create } from 'zustand';
import type { Song, RoomSnapshot, RoomMessage } from '@/types';
import { usePlayerStore } from '@/lib/store';
import { buildRoomWebSocketUrl, roomAPI, type RoomActionType, type RoomSeedState } from '@/lib/room-api';

type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

interface RoomStoreState {
  room: RoomSnapshot | null;
  roomCode: string | null;
  memberId: string | null;
  nickname: string;
  serverNowMs: number | null;
  clockOffsetMs: number;
  clockSyncedAt: number | null;
  connectionStatus: ConnectionStatus;
  error: string | null;
  isSending: boolean;
}

interface RoomStoreActions {
  setNickname: (nickname: string) => void;
  createRoom: (seed?: Partial<RoomSeedState>) => Promise<void>;
  joinRoom: (roomCode: string, nickname?: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  refreshRoom: () => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  sendAction: (type: RoomActionType, payload?: Record<string, unknown>) => Promise<void>;
  togglePlay: () => Promise<void>;
  nextSong: () => Promise<void>;
  previousSong: () => Promise<void>;
  seekTo: (time: number) => Promise<void>;
  toggleShuffle: () => Promise<void>;
  toggleRepeat: () => Promise<void>;
  replacePlaylist: (songs: Song[], currentIndex?: number) => Promise<void>;
  playSongAt: (index: number) => Promise<void>;
  addSong: (song: Song) => Promise<void>;
  removeSong: (songId: string) => Promise<void>;
  moveSong: (fromIndex: number, toIndex: number) => Promise<void>;
  clearPlaylist: () => Promise<void>;
}

const NICKNAME_KEY = 'self_music_room_nickname';
const MEMBER_ID_KEY = 'self_music_room_member_id';
const ACTIVE_ROOM_CODE_KEY = 'self_music_active_room_code';

let roomSocket: WebSocket | null = null;
let pendingReconnect: ReturnType<typeof setTimeout> | null = null;
let pollingTimer: ReturnType<typeof setInterval> | null = null;
let playbackTimer: ReturnType<typeof setInterval> | null = null;
let pollingInFlight = false;
let manualDisconnect = false;
const USE_ROOM_WEBSOCKET = process.env.NEXT_PUBLIC_ROOM_WEBSOCKET === 'true';
const CLOCK_OFFSET_SMOOTHING = 0.18;

let estimatedServerOffsetMs = 0;
let hasEstimatedServerOffset = false;
let lastAppliedRoomVersion: number | null = null;

function getLocalStorageValue(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key);
}

function setLocalStorageValue(key: string, value: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, value);
}

function removeLocalStorageValue(key: string) {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
}

function updateRoomUrl(roomCode: string | null) {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  if (roomCode) {
    url.searchParams.set('room', roomCode);
  } else {
    url.searchParams.delete('room');
  }

  const nextUrl = `${url.pathname}${url.searchParams.toString() ? `?${url.searchParams.toString()}` : ''}`;
  window.history.replaceState({}, '', nextUrl);
}

function generateNickname() {
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `Guest-${suffix}`;
}

function ensureIdentity(nickname?: string) {
  const storedNickname = getLocalStorageValue(NICKNAME_KEY);
  const storedMemberId = getLocalStorageValue(MEMBER_ID_KEY);
  const nextNickname = nickname?.trim() || storedNickname || generateNickname();
  const nextMemberId = storedMemberId || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

  setLocalStorageValue(NICKNAME_KEY, nextNickname);
  setLocalStorageValue(MEMBER_ID_KEY, nextMemberId);

  return { nickname: nextNickname, memberId: nextMemberId };
}

function persistIdentity(nickname: string, memberId: string) {
  setLocalStorageValue(NICKNAME_KEY, nickname);
  setLocalStorageValue(MEMBER_ID_KEY, memberId);
}

export function getStoredActiveRoomCode() {
  return getLocalStorageValue(ACTIVE_ROOM_CODE_KEY);
}

function recordServerClockOffsetFromTime(serverTime: string | undefined, receivedAtMs = Date.now()) {
  const serverTimeMs = new Date(serverTime || receivedAtMs).getTime();
  const sample = serverTimeMs - receivedAtMs;

  if (!hasEstimatedServerOffset) {
    estimatedServerOffsetMs = sample;
    hasEstimatedServerOffset = true;
    return;
  }

  estimatedServerOffsetMs =
    estimatedServerOffsetMs * (1 - CLOCK_OFFSET_SMOOTHING) + sample * CLOCK_OFFSET_SMOOTHING;
}

function recordServerClockOffset(room: RoomSnapshot, receivedAtMs = Date.now()) {
  recordServerClockOffsetFromTime(room.serverTime || room.updatedAt, receivedAtMs);
}

function getClockState(receivedAtMs = Date.now()) {
  return {
    serverNowMs: receivedAtMs + estimatedServerOffsetMs,
    clockOffsetMs: estimatedServerOffsetMs,
    clockSyncedAt: receivedAtMs,
  };
}

function stopPlaybackTicker() {
  if (playbackTimer) {
    clearInterval(playbackTimer);
    playbackTimer = null;
  }
}

function startPlaybackTicker() {
  if (playbackTimer) return;

  playbackTimer = setInterval(() => {
    const state = useRoomStore.getState();
    const room = state.room;
    if (!room) {
      stopPlaybackTicker();
      return;
    }

    const effectiveServerNowMs = getEstimatedServerNowMs();
    const nextCurrentTime = estimateRoomPlaybackTime(room, effectiveServerNowMs);
    const player = usePlayerStore.getState();

    if (player.currentSong?.id !== room.playlist[room.currentIndex]?.id) {
      return;
    }

    if (Math.abs((player.currentTime || 0) - nextCurrentTime) > 0.01) {
      usePlayerStore.setState({
        currentTime: nextCurrentTime,
        duration: room.duration || player.duration,
        isPlaying: room.isPlaying,
        repeatMode: room.repeatMode,
        shuffleMode: room.shuffleMode,
      });
    }
  }, 100);
}

function resetServerClockOffset() {
  estimatedServerOffsetMs = 0;
  hasEstimatedServerOffset = false;
}

export function getEstimatedServerNowMs(atMs = Date.now()) {
  return atMs + estimatedServerOffsetMs;
}

export function estimateRoomPlaybackTime(room: RoomSnapshot, serverNowMs = getEstimatedServerNowMs()) {
  const anchorTimeMs = new Date(room.lastActionAt || room.updatedAt || room.serverTime || serverNowMs).getTime();
  const elapsed = room.isPlaying ? Math.max(0, serverNowMs - anchorTimeMs) / 1000 : 0;
  return Math.max(0, room.currentTime + elapsed);
}

function applyRoomSnapshot(room: RoomSnapshot, forceSeek = false) {
  const player = usePlayerStore.getState();
  const currentSong = room.playlist[room.currentIndex] || null;
  const liveCurrentTime = Math.max(0, estimateRoomPlaybackTime(room));
  const currentSongChanged = player.currentSong?.id !== currentSong?.id;

  usePlayerStore.setState({
    currentSong,
    playlist: room.playlist,
    currentIndex: room.currentIndex,
    currentTime: liveCurrentTime,
    duration: room.duration || currentSong?.duration || 0,
    isPlaying: room.isPlaying,
    repeatMode: room.repeatMode,
    shuffleMode: room.shuffleMode,
    playbackMode: 'playlist',
    currentPlaylist: null,
    currentMood: null,
    shouldSeek: forceSeek || currentSongChanged ? liveCurrentTime : null,
    isLoading: false,
    error: null,
    isRoomMode: true,
  });
}

function syncRoomState(room: RoomSnapshot | null, receivedAtMs = Date.now(), forceSeek = false) {
  if (!room) {
    resetServerClockOffset();
    lastAppliedRoomVersion = null;
    stopPlaybackTicker();
    usePlayerStore.setState({ isRoomMode: false });
    return;
  }

  if (!forceSeek && lastAppliedRoomVersion === room.version) {
    usePlayerStore.setState({ isRoomMode: true });
    return;
  }

  recordServerClockOffset(room, receivedAtMs);
  lastAppliedRoomVersion = room.version;
  usePlayerStore.setState({ isRoomMode: true });
  applyRoomSnapshot(room, forceSeek);
  startPlaybackTicker();
}

function setRoomSocketHandlers(
  roomCode: string,
  setState: (partial: Partial<RoomStoreState>) => void,
  getState: () => RoomStoreState
) {
  const identity = ensureIdentity();
  manualDisconnect = false;

  if (pendingReconnect) {
    clearTimeout(pendingReconnect);
    pendingReconnect = null;
  }

  if (pollingTimer) {
    clearInterval(pollingTimer);
    pollingTimer = null;
  }

  if (roomSocket) {
    roomSocket.close();
    roomSocket = null;
  }

  if (!USE_ROOM_WEBSOCKET) {
    const pollClock = async () => {
      if (pollingInFlight) return;
      const activeRoomCode = getState().roomCode;
      if (!activeRoomCode) return;

      pollingInFlight = true;
      try {
        const response = await roomAPI.getRoomClock(activeRoomCode);
        if (response.success && response.data) {
          const currentVersion = getState().room?.version;
          const receivedAtMs = Date.now();
          recordServerClockOffsetFromTime(response.data.serverTime, receivedAtMs);
          setState(getClockState(receivedAtMs));
          if (response.data.version !== currentVersion) {
            const roomResponse = await roomAPI.getRoom(activeRoomCode);
            if (roomResponse.success && roomResponse.data) {
              setState({ room: roomResponse.data, connectionStatus: 'connected', error: null, ...getClockState(receivedAtMs) });
              syncRoomState(roomResponse.data, receivedAtMs);
            }
          }
        }
      } catch (error) {
        console.error('Failed to poll room clock:', error);
      } finally {
        pollingInFlight = false;
      }
    };

    void pollClock();
    pollingTimer = setInterval(() => {
      void pollClock();
    }, 2000);
    setState({ connectionStatus: 'connected', error: null });
    return;
  }

  const socketUrl = buildRoomWebSocketUrl(roomCode, getState().memberId || identity.memberId, getState().nickname || identity.nickname);

  const socket = new WebSocket(socketUrl);
  roomSocket = socket;

  socket.onopen = () => {
    setState({ connectionStatus: 'connected', error: null });
  };

  socket.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data as string);
      if (payload.room) {
        const currentVersion = getState().room?.version;
        recordServerClockOffsetFromTime(payload.room.serverTime, Date.now());
        setState({ room: payload.room, roomCode: payload.room.code, connectionStatus: 'connected', ...getClockState(Date.now()) });
        if (payload.room.version !== currentVersion) {
          syncRoomState(payload.room, Date.now());
        }
      }

      if (payload.type === 'message' && payload.message) {
        const currentRoom = getState().room;
        setState({
          room: currentRoom
            ? {
                ...currentRoom,
                messages: dedupeMessages([...(currentRoom.messages || []), payload.message]),
              }
            : currentRoom,
        });
      }
    } catch (error) {
      console.error('Failed to parse room websocket message:', error);
    }
  };

  socket.onclose = () => {
    roomSocket = null;
    if (!manualDisconnect) {
      setState({ connectionStatus: 'disconnected' });
      if (pollingTimer) {
        clearInterval(pollingTimer);
      }
      pollingTimer = setInterval(() => {
        const activeRoomCode = getState().roomCode;
        if (!activeRoomCode) return;
        const requestedAt = Date.now();
        void roomAPI.getRoomClock(activeRoomCode).then((response) => {
          if (response.success && response.data) {
            recordServerClockOffsetFromTime(response.data.serverTime, requestedAt);
            setState(getClockState(requestedAt));
          }
        });
      }, 2000);
    }
  };

  socket.onerror = () => {
    setState({ connectionStatus: 'error', error: '房间连接失败' });
  };
}

function dedupeMessages(messages: RoomMessage[]) {
  const seen = new Set<string>();
  return messages.filter((message) => {
    if (seen.has(message.id)) return false;
    seen.add(message.id);
    return true;
  });
}

export const useRoomStore = create<RoomStoreState & RoomStoreActions>()((set, get) => ({
  room: null,
  roomCode: null,
  memberId: getLocalStorageValue(MEMBER_ID_KEY),
  nickname: getLocalStorageValue(NICKNAME_KEY) || 'Guest',
  serverNowMs: null,
  clockOffsetMs: 0,
  clockSyncedAt: null,
  connectionStatus: 'idle',
  error: null,
  isSending: false,

  setNickname: (nickname) => {
    const nextNickname = nickname.trim() || generateNickname();
    setLocalStorageValue(NICKNAME_KEY, nextNickname);
    set({ nickname: nextNickname });
  },

  createRoom: async (seed = {}) => {
    const identity = ensureIdentity(seed.nickname || get().nickname);
    const player = usePlayerStore.getState();
    const playlist = seed.playlist || (player.playlist.length > 0 ? player.playlist : player.currentSong ? [player.currentSong] : []);
    const response = await roomAPI.createRoom({
      name: seed.name || '听歌房间',
      nickname: identity.nickname,
      memberId: identity.memberId,
      playlist,
      currentIndex: seed.currentIndex ?? Math.max(0, player.currentIndex),
      currentTime: seed.currentTime ?? player.currentTime,
      isPlaying: seed.isPlaying ?? player.isPlaying,
      repeatMode: seed.repeatMode ?? player.repeatMode,
      shuffleMode: seed.shuffleMode ?? player.shuffleMode,
    });

    if (!response.success || !response.data) {
      set({ error: response.error || '创建房间失败', connectionStatus: 'error' });
      return;
    }

    const { room, memberId } = response.data;
    persistIdentity(identity.nickname, memberId || identity.memberId);
    setLocalStorageValue(ACTIVE_ROOM_CODE_KEY, room.code);
    updateRoomUrl(room.code);
    const clockState = getClockState(Date.now());
    set({
      room,
      roomCode: room.code,
      memberId: memberId || identity.memberId,
      nickname: identity.nickname,
      ...clockState,
      connectionStatus: 'connected',
      error: null,
      isSending: false,
    });
    syncRoomState(room, Date.now(), true);
    setRoomSocketHandlers(room.code, set, get);
  },

  joinRoom: async (roomCode, nickname) => {
    const identity = ensureIdentity(nickname || get().nickname);
    set({ connectionStatus: 'connecting', error: null });

    const response = await roomAPI.joinRoom(roomCode, {
      nickname: identity.nickname,
      memberId: identity.memberId,
    });

    if (!response.success || !response.data) {
      set({ error: response.error || '加入房间失败', connectionStatus: 'error' });
      usePlayerStore.setState({ isRoomMode: false });
      if (!usePlayerStore.getState().currentSong) {
        usePlayerStore.getState().loadDefaultSong();
      }
      return;
    }

    const { room, memberId } = response.data;
    persistIdentity(identity.nickname, memberId || identity.memberId);
    setLocalStorageValue(ACTIVE_ROOM_CODE_KEY, room.code);
    updateRoomUrl(room.code);
    const clockState = getClockState(Date.now());
    set({
      room,
      roomCode: room.code,
      memberId: memberId || identity.memberId,
      nickname: identity.nickname,
      ...clockState,
      connectionStatus: 'connected',
      error: null,
      isSending: false,
    });
    syncRoomState(room, Date.now(), true);
    setRoomSocketHandlers(room.code, set, get);
  },

  leaveRoom: async () => {
    const { roomCode, memberId, nickname } = get();
    manualDisconnect = true;
    if (roomSocket) {
      roomSocket.close();
      roomSocket = null;
    }

    if (pendingReconnect) {
      clearTimeout(pendingReconnect);
      pendingReconnect = null;
    }

    if (pollingTimer) {
      clearInterval(pollingTimer);
      pollingTimer = null;
    }
    stopPlaybackTicker();

    if (roomCode) {
      await roomAPI.leaveRoom(roomCode, { memberId: memberId || undefined, nickname });
    }

    set({
      room: null,
      roomCode: null,
      serverNowMs: null,
      clockOffsetMs: 0,
      clockSyncedAt: null,
      connectionStatus: 'idle',
      error: null,
      isSending: false,
    });
    removeLocalStorageValue(ACTIVE_ROOM_CODE_KEY);
    updateRoomUrl(null);
    usePlayerStore.setState({ isRoomMode: false });
    resetServerClockOffset();
    lastAppliedRoomVersion = null;
    stopPlaybackTicker();
    if (!usePlayerStore.getState().currentSong) {
      usePlayerStore.getState().loadDefaultSong();
    }
  },

  refreshRoom: async () => {
    const { roomCode } = get();
    if (!roomCode) return;

    const response = await roomAPI.getRoom(roomCode);
    if (!response.success || !response.data) {
      set({ error: response.error || '刷新房间失败' });
      return;
    }

    const previousVersion = get().room?.version;
    set({ room: response.data, ...getClockState(Date.now()) });
    syncRoomState(response.data, Date.now(), response.data.version !== previousVersion);
  },

  sendMessage: async (content) => {
    const { roomCode, memberId, nickname } = get();
    if (!roomCode || !content.trim()) return;

    set({ isSending: true, error: null });
    const response = await roomAPI.sendMessage(roomCode, {
      content: content.trim(),
      memberId: memberId || undefined,
      nickname,
    });

    if (!response.success) {
      set({ error: response.error || '发送消息失败', isSending: false });
      return;
    }

    const currentRoom = get().room;
    set({
      room: currentRoom && response.data
        ? {
            ...currentRoom,
            messages: dedupeMessages([...(currentRoom.messages || []), response.data]),
          }
        : currentRoom,
      isSending: false,
    });
  },

  sendAction: async (type, payload = {}) => {
    const { roomCode, memberId, nickname } = get();
    if (!roomCode) return;

    set({ isSending: true, error: null });
    const response = await roomAPI.sendAction(roomCode, {
      type,
      payload,
      memberId: memberId || undefined,
      nickname,
    });

    if (!response.success || !response.data) {
      set({ error: response.error || '同步房间状态失败', isSending: false });
      return;
    }

    const clockState = getClockState(Date.now());
    set({ room: response.data, isSending: false, connectionStatus: 'connected', ...clockState });
    if (type === 'seek' && typeof payload.time === 'number') {
      usePlayerStore.setState({
        currentTime: response.data.currentTime,
        shouldSeek: response.data.currentTime,
      });
    } else if (['play_song', 'next_song', 'previous_song', 'replace_playlist', 'clear_playlist'].includes(type)) {
      const nextSong = response.data.playlist[response.data.currentIndex] || null;
      usePlayerStore.setState({
        currentSong: nextSong,
        playlist: response.data.playlist,
        currentIndex: response.data.currentIndex,
        currentTime: response.data.currentTime,
        duration: response.data.duration,
        isPlaying: response.data.isPlaying,
        repeatMode: response.data.repeatMode,
        shuffleMode: response.data.shuffleMode,
        shouldSeek: response.data.isPlaying ? response.data.currentTime : 0,
      });
    }
    syncRoomState(response.data, Date.now(), ['seek', 'play_song', 'next_song', 'previous_song', 'replace_playlist', 'clear_playlist'].includes(type));
  },

  togglePlay: async () => {
    await get().sendAction('play_pause');
  },

  nextSong: async () => {
    await get().sendAction('next_song');
  },

  previousSong: async () => {
    await get().sendAction('previous_song');
  },

  seekTo: async (time) => {
    await get().sendAction('seek', { time });
  },

  toggleShuffle: async () => {
    await get().sendAction('toggle_shuffle');
  },

  toggleRepeat: async () => {
    await get().sendAction('toggle_repeat');
  },

  replacePlaylist: async (songs, currentIndex = 0) => {
    const player = usePlayerStore.getState();
    await get().sendAction('replace_playlist', {
      songs,
      currentIndex,
      currentTime: player.currentTime,
      isPlaying: player.isPlaying,
      repeatMode: player.repeatMode,
      shuffleMode: player.shuffleMode,
    });
  },

  playSongAt: async (index) => {
    await get().sendAction('play_song', { index });
  },

  addSong: async (song) => {
    await get().sendAction('add_song', { song });
  },

  removeSong: async (songId) => {
    await get().sendAction('remove_song', { songId });
  },

  moveSong: async (fromIndex, toIndex) => {
    await get().sendAction('move_song', { fromIndex, toIndex });
  },

  clearPlaylist: async () => {
    await get().sendAction('clear_playlist');
  },
}));
