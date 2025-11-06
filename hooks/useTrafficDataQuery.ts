'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LiveCount, HourlyStatistic, SummaryStatistics } from '@/types/api';

import { fetchLiveCounts, fetchHourlyStatistics, fetchSummaryStatistics, fetchHistoricalData } from '@/lib/api-validation';

export function useLiveCounts(refreshInterval = 5000) {
  const { data, error, isLoading, refetch } = useQuery<LiveCount[]>({
    queryKey: ['liveCounts'],
    queryFn: () => fetchLiveCounts(),
    refetchInterval: refreshInterval,
    refetchOnWindowFocus: true,
    staleTime: 2000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    liveCounts: data,
    isLoading,
    isError: error,
    refetch,
  };
}

export function useHourlyStatistics(refreshInterval = 60000) {
  const { data, error, isLoading, refetch } = useQuery<{ period: string; data: HourlyStatistic[] }>({
    queryKey: ['hourlyStatistics'],
    queryFn: () => fetchHourlyStatistics(),
    refetchInterval: refreshInterval,
    refetchOnWindowFocus: true,
    staleTime: 30000,
    retry: 2,
  });

  return {
    hourlyStats: data?.data,
    isLoading,
    isError: error,
    refetch,
  };
}

export function useSummaryStatistics(refreshInterval = 60000) {
  const { data, error, isLoading, refetch } = useQuery<SummaryStatistics>({
    queryKey: ['summaryStatistics'],
    queryFn: () => fetchSummaryStatistics(),
    refetchInterval: refreshInterval,
    refetchOnWindowFocus: true,
    staleTime: 30000,
    retry: 2,
  });

  return {
    summary: data,
    isLoading,
    isError: error,
    refetch,
  };
}

// Hook for historical data with date filters
export function useHistoricalData(startDate?: string, endDate?: string, refreshInterval = 60000) {
  const { data, error, isLoading, refetch } = useQuery<{
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
  }>({
    queryKey: ['historicalData', startDate, endDate],
    queryFn: () => fetchHistoricalData(startDate, endDate),
    refetchInterval: refreshInterval,
    refetchOnWindowFocus: true,
    staleTime: 30000,
    enabled: true, // Always enabled, but will refetch when params change
  });

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
    count: data?.count,
    isLoading,
    isError: error,
    refetch,
  };
}

// Hook for manual refetch control
export function useTrafficDataControl() {
  const queryClient = useQueryClient();

  const refetchAll = () => {
    return Promise.all([
      queryClient.refetchQueries({ queryKey: ['liveCounts'] }),
      queryClient.refetchQueries({ queryKey: ['hourlyStatistics'] }),
      queryClient.refetchQueries({ queryKey: ['summaryStatistics'] }),
    ]);
  };

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['liveCounts'] });
    queryClient.invalidateQueries({ queryKey: ['hourlyStatistics'] });
    queryClient.invalidateQueries({ queryKey: ['summaryStatistics'] });
  };

  return {
    refetchAll,
    invalidateAll,
  };
}
