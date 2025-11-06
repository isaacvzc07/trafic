'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { LiveCount } from '@/types/api';

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  liveData: LiveCount[];
  error: string | null;
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
  liveData: [],
  error: null,
});

export function useWebSocket() {
  return useContext(WebSocketContext);
}

interface WebSocketProviderProps {
  children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [liveData, setLiveData] = useState<LiveCount[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Skip WebSocket connection in development if server is not available
    if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_WS_URL) {
      console.log('WebSocket: Skipping connection in development mode');
      return;
    }

    const socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000', {
      path: '/api/socket/io',
      transports: ['websocket', 'polling'],
      timeout: 5000,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setError(null);
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.warn('WebSocket connection error:', error.message);
      setError(error.message);
      setIsConnected(false);
      
      // In development, don't show connection errors as critical
      if (process.env.NODE_ENV === 'development') {
        console.log('WebSocket: Development mode - connection errors are expected');
      }
    });

    socket.on('traffic_update', (data: any) => {
      setLiveData(prev => {
        const index = prev.findIndex(item => item.camera_id === data.camera_id);
        if (index >= 0) {
          // Update existing camera
          const updated = [...prev];
          updated[index] = data;
          return updated;
        } else {
          // Add new camera
          return [...prev, data];
        }
      });
    });

    setSocket(socket);

    return () => {
      socket.disconnect();
    };
  }, []);

  const value: WebSocketContextType = {
    socket,
    isConnected,
    liveData,
    error,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}
