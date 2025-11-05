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
      hour: hourGroup.hour,
      camera_id: stat.camera_id,
      vehicle_type: stat.vehicle_type,
      direction: stat.direction,
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
