'use client';

import { useEffect, useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from '@/providers/WebSocketProvider';
import { LiveCount } from '@/types/api';

export function useRealTimeTraffic() {
  const { socket, isConnected, liveData: wsData, error: wsError } = useWebSocket();
  const queryClient = useQueryClient();

  // Fallback to HTTP polling when WebSocket is not available
  const { data: httpData, isLoading, isError, error: httpError } = useQuery<LiveCount[]>({
    queryKey: ['liveCounts'],
    queryFn: async () => {
      const response = await fetch('https://api.trafic.mx/api/v1/live/counts');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    refetchInterval: isConnected ? false : 5000, // Only poll when WebSocket is disconnected
    refetchOnWindowFocus: true,
    staleTime: 2000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !isConnected, // Only enable HTTP query when WebSocket is not connected
  });

  // Update TanStack Query cache when WebSocket data arrives
  useEffect(() => {
    if (isConnected && wsData.length > 0) {
      queryClient.setQueryData(['liveCounts'], wsData);
    }
  }, [wsData, isConnected, queryClient]);

  // Manual refetch function
  const refetch = useCallback(() => {
    if (isConnected && socket) {
      // Request fresh data via WebSocket
      socket.emit('request-refresh');
    } else {
      // Fallback to HTTP refetch
      queryClient.refetchQueries({ queryKey: ['liveCounts'] });
    }
  }, [isConnected, socket, queryClient]);

  // Get current data (WebSocket data takes priority)
  const currentData = isConnected ? wsData : httpData;
  const currentError = wsError || httpError;
  const currentLoading = isLoading && !isConnected;

  return {
    liveCounts: currentData || [],
    isLoading: currentLoading,
    isError: !!currentError,
    error: currentError,
    isConnected,
    refetch,
  };
}

// Hook for individual camera real-time updates
export function useCameraUpdate(cameraId: string) {
  const { socket, isConnected } = useWebSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Subscribe to specific camera updates
    socket.emit('subscribe-camera', cameraId);

    const handleCameraUpdate = (data: LiveCount) => {
      if (data.camera_id === cameraId) {
        // Update the specific camera in cache
        queryClient.setQueryData(['liveCounts'], (old: LiveCount[] | undefined) => {
          if (!old) return [data];
          return old.map(camera => 
            camera.camera_id === cameraId ? data : camera
          );
        });
      }
    };

    socket.on('camera-update', handleCameraUpdate);

    return () => {
      socket.off('camera-update', handleCameraUpdate);
      socket.emit('unsubscribe-camera', cameraId);
    };
  }, [socket, isConnected, cameraId, queryClient]);
}

// Hook for traffic alerts
export function useTrafficAlerts() {
  const { socket, isConnected } = useWebSocket();
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleAlert = (alert: string) => {
      setAlerts(prev => [alert, ...prev.slice(0, 9)]); // Keep latest 10 alerts
    };

    socket.on('traffic-alert', handleAlert);

    return () => {
      socket.off('traffic-alert', handleAlert);
    };
  }, [socket, isConnected]);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  return {
    alerts,
    clearAlerts,
    hasAlerts: alerts.length > 0,
  };
}
