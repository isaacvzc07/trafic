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
    console.log('🔍 API DEBUG: Fetching URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; TrafficDashboard/1.0)',
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    
    console.log('🔍 API DEBUG: Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('🔍 API DEBUG: Raw response data type:', typeof data, 'keys:', Object.keys(data || {}));
    
    const result = validator(data);
    
    if (!result.success || !result.data) {
      console.error('Validation error:', result.error);
      throw new Error(`Invalid API response: ${result.error?.issues?.map((i: any) => i.message).join(', ') || 'Unknown validation error'}`);
    }
    
    console.log('🔍 API DEBUG: Validation passed, returning data');
    return result.data;
  } catch (error) {
    console.error('API fetch error for URL:', url, error);
    
    // Re-throw with more context
    if (error instanceof Error) {
      throw new Error(`Failed to fetch ${url}: ${error.message}`);
    } else {
      throw new Error(`Failed to fetch ${url}: Unknown error`);
    }
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
