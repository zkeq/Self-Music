'use client';

import type { Song } from '@/types';
import { roomAPI } from '@/lib/room-api';

const ACTIVE_ROOM_CODE_KEY = 'self_music_active_room_code';
const NICKNAME_KEY = 'self_music_room_nickname';
const MEMBER_ID_KEY = 'self_music_room_member_id';

function getLocalStorageValue(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key);
}

export function getStoredActiveRoomCode() {
  return getLocalStorageValue(ACTIVE_ROOM_CODE_KEY);
}

export function setStoredActiveRoomCode(roomCode: string | null) {
  if (typeof window === 'undefined') return;
  if (roomCode) {
    localStorage.setItem(ACTIVE_ROOM_CODE_KEY, roomCode);
  } else {
    localStorage.removeItem(ACTIVE_ROOM_CODE_KEY);
  }
}

export function hasStoredActiveRoom() {
  return !!getStoredActiveRoomCode();
}

export function getStoredRoomIdentity() {
  return {
    nickname: getLocalStorageValue(NICKNAME_KEY) || 'Guest',
    memberId: getLocalStorageValue(MEMBER_ID_KEY) || undefined,
  };
}

export async function replaceActiveRoomPlaylist(
  songs: Song[],
  currentIndex = 0,
  options: { isPlaying?: boolean; currentTime?: number } = {}
) {
  const roomCode = getStoredActiveRoomCode();
  if (!roomCode) return null;

  const identity = getStoredRoomIdentity();
  const response = await roomAPI.sendAction(roomCode, {
    type: 'replace_playlist',
    payload: {
      songs,
      currentIndex,
      isPlaying: options.isPlaying ?? true,
      currentTime: options.currentTime ?? 0,
    },
    memberId: identity.memberId,
    nickname: identity.nickname,
  });

  if (!response.success || !response.data) {
    return null;
  }

  return response.data;
}
