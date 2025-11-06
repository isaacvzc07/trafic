import { renderHook, waitFor } from '@testing-library/react'
import useSWR from 'swr'
import { useLiveCounts, useHourlyStatistics, useSummaryStatistics, useHistoricalData } from '@/hooks/useTrafficData'
import { mockLiveCounts, mockHourlyStats, mockSummaryStats } from '../utils/mockData'

// Mock SWR
jest.mock('swr')

const mockSwr = useSWR as jest.MockedFunction<typeof useSWR>

describe('useTrafficData Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('useLiveCounts', () => {
    it('should return live counts data', () => {
      mockSwr.mockReturnValue({
        data: mockLiveCounts,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      })

      const { result } = renderHook(() => useLiveCounts(5000))

      expect(result.current.liveCounts).toEqual(mockLiveCounts)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isError).toBeUndefined()
    })

    it('should return loading state', () => {
      mockSwr.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: true,
        isValidating: false,
        mutate: jest.fn(),
      })

      const { result } = renderHook(() => useLiveCounts())

      expect(result.current.liveCounts).toBeUndefined()
      expect(result.current.isLoading).toBe(true)
    })

    it('should return error state', () => {
      const error = new Error('API Error')
      mockSwr.mockReturnValue({
        data: undefined,
        error,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      })

      const { result } = renderHook(() => useLiveCounts())

      expect(result.current.isError).toBe(error)
    })

    it('should use correct SWR key', () => {
      mockSwr.mockReturnValue({
        data: mockLiveCounts,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      })

      renderHook(() => useLiveCounts(10000))

      expect(mockSwr).toHaveBeenCalledWith(
        'https://api.trafic.mx/api/v1/live/counts',
        expect.any(Function),
        { refreshInterval: 10000, revalidateOnFocus: true, dedupingInterval: 2000 }
      )
    })
  })

  describe('useHourlyStatistics', () => {
    it('should return hourly statistics data', () => {
      const mockResponse = { period: '2025-01-06', data: mockHourlyStats }
      mockSwr.mockReturnValue({
        data: mockResponse,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      })

      const { result } = renderHook(() => useHourlyStatistics(60000))

      expect(result.current.hourlyStats).toEqual(mockHourlyStats)
      expect(result.current.isLoading).toBe(false)
    })

    it('should use correct SWR key and options', () => {
      mockSwr.mockReturnValue({
        data: { period: '2025-01-06', data: mockHourlyStats },
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      })

      renderHook(() => useHourlyStatistics(30000))

      expect(mockSwr).toHaveBeenCalledWith(
        'https://api.trafic.mx/api/v1/statistics/hourly',
        expect.any(Function),
        { refreshInterval: 30000, revalidateOnFocus: true }
      )
    })
  })

  describe('useSummaryStatistics', () => {
    it('should return summary statistics data', () => {
      mockSwr.mockReturnValue({
        data: mockSummaryStats,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      })

      const { result } = renderHook(() => useSummaryStatistics(60000))

      expect(result.current.summary).toEqual(mockSummaryStats)
      expect(result.current.isLoading).toBe(false)
    })

    it('should use correct SWR key and options', () => {
      mockSwr.mockReturnValue({
        data: mockSummaryStats,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      })

      renderHook(() => useSummaryStatistics(30000))

      expect(mockSwr).toHaveBeenCalledWith(
        'https://api.trafic.mx/api/v1/statistics/summary',
        expect.any(Function),
        { refreshInterval: 30000, revalidateOnFocus: true }
      )
    })
  })

  describe('useHistoricalData', () => {
    const mockHistoricalResponse = {
      period: '2025-01-06',
      count: 3,
      data: [
        {
          hour: '2025-01-06T00:00:00Z',
          data: [
            {
              camera_id: 'homero_oe',
              vehicle_type: 'car',
              direction: 'in',
              count: 45,
              avg_confidence: 0.85,
            },
            {
              camera_id: 'homero_eo',
              vehicle_type: 'bus',
              direction: 'out',
              count: 8,
              avg_confidence: 0.90,
            },
          ],
        },
      ],
    }

    it('should return historical data with correct structure', () => {
      mockSwr.mockReturnValue({
        data: mockHistoricalResponse,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      })

      const { result } = renderHook(() => useHistoricalData('2025-01-01', '2025-01-02'))

      expect(result.current.historicalData).toHaveLength(2)
      expect(result.current.historicalData?.[0]).toEqual({
        period: '2025-01-06',
        hour: '2025-01-06T00:00:00Z',
        camera_id: 'homero_oe',
        vehicle_type: 'car',
        direction: 'in',
        count: 45,
        avg_confidence: 0.85,
      })
      expect(result.current.isLoading).toBe(false)
    })

    it('should construct correct URL with date parameters', () => {
      mockSwr.mockReturnValue({
        data: mockHistoricalResponse,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      })

      renderHook(() => useHistoricalData('2025-01-01', '2025-01-02'))

      expect(mockSwr).toHaveBeenCalledWith(
        '/api/history/hourly?start=2025-01-01&end=2025-01-02',
        expect.any(Function),
        { refreshInterval: 60000, revalidateOnFocus: true }
      )
    })

    it('should handle only start date', () => {
      mockSwr.mockReturnValue({
        data: mockHistoricalResponse,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      })

      renderHook(() => useHistoricalData('2025-01-01'))

      expect(mockSwr).toHaveBeenCalledWith(
        '/api/history/hourly?start=2025-01-01',
        expect.any(Function),
        { refreshInterval: 60000, revalidateOnFocus: true }
      )
    })

    it('should handle no date parameters', () => {
      mockSwr.mockReturnValue({
        data: mockHistoricalResponse,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      })

      renderHook(() => useHistoricalData())

      expect(mockSwr).toHaveBeenCalledWith(
        '/api/history/hourly',
        expect.any(Function),
        { refreshInterval: 60000, revalidateOnFocus: true }
      )
    })

    it('should handle error state', () => {
      const error = new Error('Network error')
      mockSwr.mockReturnValue({
        data: undefined,
        error,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      })

      const { result } = renderHook(() => useHistoricalData())

      expect(result.current.isError).toBe(error)
      expect(result.current.historicalData).toBeUndefined()
    })
  })

  describe('SWR fetcher function', () => {
    it('should fetch data correctly', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ test: 'data' }),
      }
      global.fetch = jest.fn().mockResolvedValue(mockResponse)

      const fetcher = (url: string) => fetch(url).then(res => res.json())
      const result = await fetcher('https://api.example.com/test')

      expect(fetch).toHaveBeenCalledWith('https://api.example.com/test')
      expect(result).toEqual({ test: 'data' })
    })

    it('should handle fetch errors', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
      }
      global.fetch = jest.fn().mockResolvedValue(mockResponse)

      const fetcher = (url: string) => fetch(url).then(res => res.json())

      await expect(fetcher('https://api.example.com/test')).rejects.toThrow()
    })
  })
})
