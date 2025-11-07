'use client';

import useSWR from 'swr';
import { LiveCount, HourlyStatistic, SummaryStatistics } from '@/types/api';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useLiveCounts(refreshInterval = 5000) {
  const { data, error, isLoading } = useSWR<LiveCount[]>(
    'https://api.trafic.mx/api/v1/live/counts',
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  );

  return {
    liveCounts: data,
    isLoading,
    isError: error,
  };
}

export function useHourlyStatistics(refreshInterval = 60000) {
  const { data, error, isLoading } = useSWR<{ period: string; data: HourlyStatistic[] }>(
    'https://api.trafic.mx/api/v1/statistics/hourly',
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: true,
    }
  );

  return {
    hourlyStats: data?.data,
    isLoading,
    isError: error,
  };
}

export function useSummaryStatistics(refreshInterval = 60000) {
  const { data, error, isLoading } = useSWR<SummaryStatistics>(
    'https://api.trafic.mx/api/v1/statistics/summary',
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: true,
    }
  );

  return {
    summary: data,
    isLoading,
    isError: error,
  };
}

// Hook for historical data with date filters
export function useHistoricalData(startDate?: string, endDate?: string, refreshInterval = 60000) {
  // Build URL with query params
  const params = new URLSearchParams();
  if (startDate) params.append('start', startDate);
  if (endDate) params.append('end', endDate);

  const url = `/api/history/hourly${params.toString() ? `?${params.toString()}` : ''}`;

  const { data, error, isLoading } = useSWR<{
    period: string;
    count: number;
    data: Array<{
      hour: string;
      data: Array<{
        camera_id: string;
        vehicle_type: string;
        direction: string;
        count: number;
        avg_confidence: number;
      }>;
    }>;
  }>(
    url,
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: true,
    }
  );

  // Flatten the data structure to match HourlyStatistic[]
  const flattenedData: HourlyStatistic[] | undefined = data?.data.flatMap(hourGroup =>
    hourGroup.data.map(stat => ({
      period: data.period,
      hour: hourGroup.hour,
      camera_id: stat.camera_id,
      vehicle_type: stat.vehicle_type as 'car' | 'bus' | 'truck',
      direction: stat.direction as 'in' | 'out',
      count: stat.count,
      avg_confidence: stat.avg_confidence,
    }))
  );

  return {
    historicalData: flattenedData,
    period: data?.period,
    isLoading,
    isError: error,
  };
}

// Combined hook for all traffic data
export function useTrafficData() {
  const { liveCounts } = useLiveCounts();
  const { hourlyStats } = useHourlyStatistics();
  const { summary } = useSummaryStatistics();
  // Only get data from November 6, 2025 onwards
  const { historicalData } = useHistoricalData('2025-11-06T00:00:00.000Z');

  // Process live data for AI components
  const liveData = liveCounts?.map(count => ({
    camera_id: count.camera_id,
    count: (count.total_in || 0) + (count.total_out || 0),
    hour: count.timestamp || new Date().toISOString(),
    direction: 'total'
  })) || [];

  // Process historical data for AI components (already filtered by date)
  const processedHistoricalData = historicalData?.map(stat => ({
    camera_id: stat.camera_id,
    count: stat.count,
    hour: stat.hour,
    vehicle_type: stat.vehicle_type,
    direction: stat.direction
  })) || [];

  // Generate camera insights for AI components
  const cameraInsights = liveCounts?.map(count => ({
    camera_id: count.camera_id,
    peak_hour: count.timestamp ? new Date(count.timestamp).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
    total_vehicles: (count.total_in || 0) + (count.total_out || 0),
    flow_rate: ((count.total_in || 0) + (count.total_out || 0)) > 0 ? (((count.total_in || 0) + (count.total_out || 0)) / 60).toFixed(1) : '0.0' // vehicles per minute
  })) || [];

  return {
    liveData,
    historicalData: processedHistoricalData,
    cameraInsights,
    liveCounts,
    hourlyStatistics: hourlyStats,
    summaryStatistics: summary,
    isLoading: false,
    isError: false
  };
}
