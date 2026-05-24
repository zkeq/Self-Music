'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useRoomStore } from '@/lib/room-store';
import { usePlayerStore } from '@/lib/store';
import {
  Copy,
  DoorOpen,
  LogOut,
  MessageSquare,
  Plus,
  Send,
  Users,
  Radio,
  Sparkles,
  Link2,
} from 'lucide-react';

interface RoomPanelProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatTime(seconds: number) {
  const total = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function RoomPanel({ isOpen, onOpenChange }: RoomPanelProps) {
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [roomName, setRoomName] = useState('听歌房间');
  const [chatInput, setChatInput] = useState('');
  const [nicknameDraft, setNicknameDraft] = useState('');

  const room = useRoomStore((state) => state.room);
  const roomCode = useRoomStore((state) => state.roomCode);
  const nickname = useRoomStore((state) => state.nickname);
  const connectionStatus = useRoomStore((state) => state.connectionStatus);
  const error = useRoomStore((state) => state.error);
  const isSending = useRoomStore((state) => state.isSending);
  const createRoom = useRoomStore((state) => state.createRoom);
  const joinRoom = useRoomStore((state) => state.joinRoom);
  const leaveRoom = useRoomStore((state) => state.leaveRoom);
  const sendMessage = useRoomStore((state) => state.sendMessage);
  const refreshRoom = useRoomStore((state) => state.refreshRoom);

  const currentSong = usePlayerStore((state) => state.currentSong);
  const currentTime = usePlayerStore((state) => state.currentTime);
  const duration = usePlayerStore((state) => state.duration);
  const isPlaying = usePlayerStore((state) => state.isPlaying);

  useEffect(() => {
    setNicknameDraft(nickname);
  }, [nickname]);

  useEffect(() => {
    setRoomCodeInput(roomCode || '');
  }, [roomCode]);

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined' || !roomCode) return '';
    return `${window.location.origin}/play?room=${encodeURIComponent(roomCode)}`;
  }, [roomCode]);

  const handleCreateRoom = async () => {
    await createRoom({
      name: roomName.trim() || '听歌房间',
      nickname: nicknameDraft.trim() || nickname,
    });
    onOpenChange(true);
  };

  const handleJoinRoom = async () => {
    if (!roomCodeInput.trim()) return;
    await joinRoom(roomCodeInput.trim(), nicknameDraft.trim() || nickname);
    onOpenChange(true);
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
  };

  const handleLeaveRoom = async () => {
    await leaveRoom();
  };

  const handleChatSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!chatInput.trim()) return;
    await sendMessage(chatInput.trim());
    setChatInput('');
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 left-0 z-50 h-full w-[22rem] sm:w-[26rem] bg-background/95 backdrop-blur-md border-r shadow-2xl flex flex-col"
          >
            <div className="p-4 border-b space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">房间协同</h2>
                  <p className="text-xs text-muted-foreground">
                    {connectionStatus === 'connected' ? '已连接' : connectionStatus === 'connecting' ? '连接中' : '未连接'}
                  </p>
                </div>
                <Badge variant={room ? 'default' : 'secondary'}>{room ? '房间中' : '单机'}</Badge>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={nicknameDraft}
                    onChange={(e) => setNicknameDraft(e.target.value)}
                    placeholder="昵称"
                  />
                  <Input
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="房间名"
                    disabled={!!room}
                  />
                </div>
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <Input
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value)}
                    placeholder="房间码"
                    disabled={!!room}
                  />
                  <Button onClick={handleJoinRoom} disabled={isSending || !roomCodeInput.trim() || !!room}>
                    <DoorOpen className="h-4 w-4 mr-2" />
                    加入
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={handleCreateRoom} disabled={isSending || !!room}>
                    <Plus className="h-4 w-4 mr-2" />
                    创建
                  </Button>
                  <Button variant="secondary" onClick={() => void refreshRoom()} disabled={!roomCode}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    刷新
                  </Button>
                </div>
              </div>

              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>

            <div className="flex-1 min-h-0">
              {room ? (
                <div className="flex h-full flex-col">
                  <div className="p-4 space-y-3 border-b">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">房间码</p>
                        <p className="font-mono text-sm truncate">{room.code}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => void handleCopyLink()} title="复制链接">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{room.members.length} 位成员</span>
                      <span>v{room.version}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => void refreshRoom()}>
                        <Link2 className="h-4 w-4 mr-2" />
                        对齐
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => void handleLeaveRoom()} className="text-destructive">
                        <LogOut className="h-4 w-4 mr-2" />
                        退出
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 space-y-4 border-b">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Radio className="h-4 w-4" />
                      当前播放
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="font-medium truncate">{currentSong?.title || '暂无歌曲'}</p>
                      <p className="text-xs text-muted-foreground truncate">{currentSong?.artist?.name || '等待同步'}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(currentTime)} / {formatTime(duration)} {isPlaying ? '播放中' : '已暂停'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-rows-[auto_auto_1fr] flex-1 min-h-0">
                    <div className="p-4 pb-2 flex items-center gap-2 text-sm font-medium">
                      <Users className="h-4 w-4" />
                      成员
                    </div>
                    <div className="px-4 pb-4">
                      <div className="flex flex-wrap gap-2">
                        {room.members.map((member) => (
                          <Badge key={member.id} variant={member.isHost ? 'default' : 'secondary'} className="max-w-full truncate">
                            {member.nickname}
                            {member.isHost ? ' · 主' : ''}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="min-h-0 border-t">
                      <div className="p-4 pb-2 flex items-center gap-2 text-sm font-medium">
                        <MessageSquare className="h-4 w-4" />
                        聊天
                      </div>
                      <ScrollArea className="h-[calc(100%-5.5rem)]">
                        <div className="px-4 pb-4 space-y-2">
                          {(room.messages || []).map((message) => (
                            <div key={message.id} className="rounded-lg bg-muted/50 p-3">
                              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                                <span className="truncate">{message.nickname}</span>
                                <span>{new Date(message.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <p className="mt-1 text-sm break-words">{message.content}</p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>

                  <form onSubmit={handleChatSubmit} className="p-4 border-t flex items-center gap-2">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="发一句话..."
                      disabled={isSending}
                    />
                    <Button type="submit" disabled={isSending || !chatInput.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                    创建或加入一个房间，大家就能同步播放、切歌和聊天。
                  </div>
                  <div className="space-y-2 text-sm">
                    <p>1. 输入昵称</p>
                    <p>2. 创建新房间或输入房间码加入</p>
                    <p>3. 分享链接给朋友</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
