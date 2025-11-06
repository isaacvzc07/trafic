import { 
  validateLiveCountsResponse,
  validateHourlyStatisticsResponse,
  validateHistoricalDataResponse,
  type LiveCount,
  type HourlyStatistic,
  type SummaryStatistics
} from './validations';

// Enhanced fetcher with validation
export async function validatedFetch<T>(url: string, validator: (data: unknown) => { success: boolean; data?: T; error?: any }): Promise<T> {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const result = validator(data);
    
    if (!result.success) {
      console.error('Validation error:', result.error);
      throw new Error(`Invalid API response: ${result.error?.issues?.map((i: any) => i.message).join(', ') || 'Unknown validation error'}`);
    }
    
    return result.data;
  } catch (error) {
    console.error('API fetch error:', error);
    throw error;
  }
}

// Specific validated fetchers
export const fetchLiveCounts = () => 
  validatedFetch<LiveCount[]>('https://api.trafic.mx/api/v1/live/counts', validateLiveCountsResponse);

export const fetchHourlyStatistics = () =>
  validatedFetch<{ period: string; data: HourlyStatistic[] }>(
    'https://api.trafic.mx/api/v1/statistics/hourly', 
    validateHourlyStatisticsResponse
  );

export const fetchSummaryStatistics = () =>
  validatedFetch<SummaryStatistics>('https://api.trafic.mx/api/v1/statistics/summary', (data) => {
    // For summary stats, we'll use a simpler validation
    if (typeof data === 'object' && data !== null && 'start_date' in data && 'end_date' in data) {
      return { success: true, data: data as SummaryStatistics };
    }
    return { success: false, error: 'Invalid summary statistics format' };
  });

export const fetchHistoricalData = (startDate?: string, endDate?: string) => {
  const params = new URLSearchParams();
  if (startDate) params.append('start', startDate);
  if (endDate) params.append('end', endDate);
  
  const url = `/api/history/hourly${params.toString() ? `?${params.toString()}` : ''}`;
  
  return validatedFetch(
    url,
    validateHistoricalDataResponse
  );
};
