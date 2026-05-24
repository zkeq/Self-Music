'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { getStoredActiveRoomCode } from '@/lib/room-context';
import { useRoomStore } from '@/lib/room-store';

export function RoomPresenceManager() {
  const searchParams = useSearchParams();
  const roomCode = useRoomStore((state) => state.roomCode);
  const room = useRoomStore((state) => state.room);
  const connectionStatus = useRoomStore((state) => state.connectionStatus);
  const joinRoom = useRoomStore((state) => state.joinRoom);
  const joiningRef = useRef<string | null>(null);

  useEffect(() => {
    const urlRoomCode = searchParams?.get('room');
    const storedRoomCode = getStoredActiveRoomCode();
    const nextRoomCode = urlRoomCode || storedRoomCode;

    if (!nextRoomCode) return;
    if (roomCode === nextRoomCode && room?.code === nextRoomCode) return;
    if (connectionStatus === 'connecting') return;
    if (joiningRef.current === nextRoomCode) return;

    joiningRef.current = nextRoomCode;
    void joinRoom(nextRoomCode).finally(() => {
      joiningRef.current = null;
    });
  }, [connectionStatus, joinRoom, room?.code, roomCode, searchParams]);

  return null;
}
