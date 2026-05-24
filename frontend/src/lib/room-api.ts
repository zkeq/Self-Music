import type { ApiResponse, RoomCreateResponse, RoomMember, RoomMessage, RoomSnapshot, Song } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export type RoomActionType =
  | 'replace_playlist'
  | 'play_pause'
  | 'next_song'
  | 'previous_song'
  | 'seek'
  | 'toggle_shuffle'
  | 'toggle_repeat'
  | 'play_song'
  | 'add_song'
  | 'remove_song'
  | 'move_song'
  | 'clear_playlist';

export interface RoomSeedState {
  name?: string;
  nickname?: string;
  memberId?: string;
  playlist?: Song[];
  currentIndex?: number;
  currentTime?: number;
  isPlaying?: boolean;
  repeatMode?: 'none' | 'one' | 'all';
  shuffleMode?: boolean;
}

export interface RoomJoinRequest {
  nickname?: string;
  memberId?: string;
}

export interface RoomClockResponse {
  roomCode: string;
  serverTime: string;
  updatedAt: string;
  lastActionAt?: string;
  version: number;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  currentIndex: number;
  currentSongId: string | null;
}

export interface RoomActionRequest {
  type: RoomActionType;
  payload?: Record<string, unknown>;
  memberId?: string;
  nickname?: string;
}

export interface RoomMessageRequest {
  memberId?: string;
  nickname?: string;
  content: string;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        success: false,
        error: data?.detail || data?.error || `HTTP error ${response.status}`,
      };
    }

    return data ?? { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function getWsBaseUrl(): string {
  return API_BASE_URL.replace(/^http/, 'ws').replace(/\/api\/?$/, '');
}

export function buildRoomWebSocketUrl(roomCode: string, memberId?: string, nickname?: string): string {
  const url = new URL(`${getWsBaseUrl()}/api/rooms/${encodeURIComponent(roomCode)}/ws`);
  if (memberId) url.searchParams.set('memberId', memberId);
  if (nickname) url.searchParams.set('nickname', nickname);
  return url.toString();
}

export const roomAPI = {
  async createRoom(seed: RoomSeedState): Promise<ApiResponse<RoomCreateResponse>> {
    return request('/rooms', {
      method: 'POST',
      body: JSON.stringify(seed),
    });
  },

  async joinRoom(roomCode: string, payload: RoomJoinRequest = {}): Promise<ApiResponse<RoomCreateResponse>> {
    return request(`/rooms/${encodeURIComponent(roomCode)}/join`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getRoom(roomCode: string): Promise<ApiResponse<RoomSnapshot>> {
    return request(`/rooms/${encodeURIComponent(roomCode)}`);
  },

  async getRoomClock(roomCode: string): Promise<ApiResponse<RoomClockResponse>> {
    return request(`/rooms/${encodeURIComponent(roomCode)}/clock`);
  },

  async getMessages(roomCode: string): Promise<ApiResponse<RoomMessage[]>> {
    return request(`/rooms/${encodeURIComponent(roomCode)}/messages`);
  },

  async sendAction(roomCode: string, payload: RoomActionRequest): Promise<ApiResponse<RoomSnapshot>> {
    return request(`/rooms/${encodeURIComponent(roomCode)}/action`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async sendMessage(roomCode: string, payload: RoomMessageRequest): Promise<ApiResponse<RoomMessage>> {
    return request(`/rooms/${encodeURIComponent(roomCode)}/messages`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async leaveRoom(roomCode: string, payload: RoomJoinRequest = {}): Promise<ApiResponse<void>> {
    return request(`/rooms/${encodeURIComponent(roomCode)}/leave`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

export type { RoomMember, RoomMessage, RoomSnapshot, RoomCreateResponse };
