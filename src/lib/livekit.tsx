'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Room, RoomEvent, Track, ConnectionState } from 'livekit-client';

interface LiveKitContextType {
  room: Room | null;
  connect: (roomName: string, participantName: string) => Promise<void>;
  disconnect: () => void;
  isConnected: boolean;
  participants: string[];
}

const LiveKitContext = createContext<LiveKitContextType | undefined>(undefined);

export function LiveKitProvider({ children }: { children: ReactNode }) {
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<string[]>([]);
  const roomRef = useRef<Room | null>(null);

  useEffect(() => {
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
    };
  }, []);

  async function connect(roomName: string, participantName: string) {
    try {
      // Get token from API
      const res = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName, participantName }),
      });
      const { token, url } = await res.json();

      const newRoom = new Room();
      
      newRoom.on(RoomEvent.Connected, () => {
        setIsConnected(true);
        const names = Array.from(newRoom.remoteParticipants.values()).map(p => p.identity);
        setParticipants(names);
      });

      newRoom.on(RoomEvent.Disconnected, () => {
        setIsConnected(false);
        setParticipants([]);
      });

      newRoom.on(RoomEvent.ParticipantConnected, (participant) => {
        setParticipants(prev => [...prev, participant.identity]);
      });

      newRoom.on(RoomEvent.ParticipantDisconnected, (participant) => {
        setParticipants(prev => prev.filter(p => p !== participant.identity));
      });

      await newRoom.connect(url, token);
      roomRef.current = newRoom;
      setRoom(newRoom);
    } catch (error) {
      console.error('LiveKit connection failed:', error);
      throw error;
    }
  }

  function disconnect() {
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
      setRoom(null);
    }
  }

  return (
    <LiveKitContext.Provider value={{ room, connect, disconnect, isConnected, participants }}>
      {children}
    </LiveKitContext.Provider>
  );
}

export function useLiveKit() {
  const context = useContext(LiveKitContext);
  if (!context) throw new Error('useLiveKit must be used within LiveKitProvider');
  return context;
}
