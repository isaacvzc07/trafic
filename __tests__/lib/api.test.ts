import { api } from '@/lib/api'
import { mockCameras, mockLiveCounts, mockHourlyStats, mockSummaryStats, mockFetchResponse, mockFetchError } from '../utils/mockData'

// Mock fetch globally
global.fetch = jest.fn()

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getCameras', () => {
    it('should fetch cameras successfully', async () => {
      ;(fetch as jest.Mock).mockResolvedValue(mockFetchResponse(mockCameras))

      const result = await api.getCameras()

      expect(fetch).toHaveBeenCalledWith(
        'https://api.trafic.mx/api/v1/cameras',
        {
          next: { revalidate: 60 },
        }
      )
      expect(result).toEqual(mockCameras)
    })

    it('should throw error when fetch fails', async () => {
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      })

      await expect(api.getCameras()).rejects.toThrow('Failed to fetch cameras')
    })
  })

  describe('getLiveCounts', () => {
    it('should fetch live counts with default minutes', async () => {
      ;(fetch as jest.Mock).mockResolvedValue(mockFetchResponse(mockLiveCounts))

      const result = await api.getLiveCounts()

      expect(fetch).toHaveBeenCalledWith(
        'https://api.trafic.mx/api/v1/live/counts',
        {
          cache: 'no-store',
        }
      )
      expect(result).toEqual(mockLiveCounts)
    })

    it('should fetch live counts with custom minutes', async () => {
      ;(fetch as jest.Mock).mockResolvedValue(mockFetchResponse(mockLiveCounts))

      await api.getLiveCounts(10)

      expect(fetch).toHaveBeenCalledWith(
        'https://api.trafic.mx/api/v1/live/counts?minutes=10',
        {
          cache: 'no-store',
        }
      )
    })

    it('should throw error when fetch fails', async () => {
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      })

      await expect(api.getLiveCounts()).rejects.toThrow('Failed to fetch live counts')
    })
  })

  describe('getLiveCountsByCamera', () => {
    it('should fetch live counts for specific camera', async () => {
      const cameraData = mockLiveCounts[0]
      ;(fetch as jest.Mock).mockResolvedValue(mockFetchResponse(cameraData))

      const result = await api.getLiveCountsByCamera('homero_oe')

      expect(fetch).toHaveBeenCalledWith(
        'https://api.trafic.mx/api/v1/live/counts/homero_oe',
        {
          cache: 'no-store',
        }
      )
      expect(result).toEqual(cameraData)
    })

    it('should throw error when fetch fails', async () => {
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      })

      await expect(api.getLiveCountsByCamera('invalid')).rejects.toThrow(
        'Failed to fetch camera counts'
      )
    })
  })

  describe('getEvents', () => {
    it('should fetch events without parameters', async () => {
      ;(fetch as jest.Mock).mockResolvedValue(mockFetchResponse([]))

      await api.getEvents()

      expect(fetch).toHaveBeenCalledWith(
        'https://api.trafic.mx/api/v1/events',
        {
          next: { revalidate: 10 },
        }
      )
    })

    it('should fetch events with all parameters', async () => {
      ;(fetch as jest.Mock).mockResolvedValue(mockFetchResponse([]))

      await api.getEvents({
        limit: 50,
        camera_id: 'homero_oe',
        vehicle_type: 'car',
        direction: 'in',
      })

      expect(fetch).toHaveBeenCalledWith(
        'https://api.trafic.mx/api/v1/events?limit=50&camera_id=homero_oe&vehicle_type=car&direction=in',
        {
          next: { revalidate: 10 },
        }
      )
    })

    it('should throw error when fetch fails', async () => {
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      })

      await expect(api.getEvents()).rejects.toThrow('Failed to fetch events')
    })
  })

  describe('getLines', () => {
    it('should fetch lines without parameters', async () => {
      ;(fetch as jest.Mock).mockResolvedValue(mockFetchResponse([]))

      await api.getLines()

      expect(fetch).toHaveBeenCalledWith(
        'https://api.trafic.mx/api/v1/lines',
        {
          next: { revalidate: 300 },
        }
      )
    })

    it('should fetch lines with parameters', async () => {
      ;(fetch as jest.Mock).mockResolvedValue(mockFetchResponse([]))

      await api.getLines({
        camera_id: 'homero_oe',
        enabled_only: true,
      })

      expect(fetch).toHaveBeenCalledWith(
        'https://api.trafic.mx/api/v1/lines?camera_id=homero_oe&enabled_only=true',
        {
          next: { revalidate: 300 },
        }
      )
    })

    it('should throw error when fetch fails', async () => {
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      })

      await expect(api.getLines()).rejects.toThrow('Failed to fetch lines')
    })
  })

  describe('getHourlyStatistics', () => {
    it('should fetch hourly statistics successfully', async () => {
      ;(fetch as jest.Mock).mockResolvedValue(mockFetchResponse(mockHourlyStats))

      const result = await api.getHourlyStatistics()

      expect(fetch).toHaveBeenCalledWith(
        'https://api.trafic.mx/api/v1/statistics/hourly',
        {
          next: { revalidate: 300 },
        }
      )
      expect(result).toEqual(mockHourlyStats)
    })

    it('should throw error when fetch fails', async () => {
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      })

      await expect(api.getHourlyStatistics()).rejects.toThrow(
        'Failed to fetch hourly statistics'
      )
    })
  })

  describe('getSummary', () => {
    it('should fetch summary without parameters', async () => {
      ;(fetch as jest.Mock).mockResolvedValue(mockFetchResponse(mockSummaryStats))

      const result = await api.getSummary()

      expect(fetch).toHaveBeenCalledWith(
        'https://api.trafic.mx/api/v1/statistics/summary',
        {
          next: { revalidate: 300 },
        }
      )
      expect(result).toEqual(mockSummaryStats)
    })

    it('should fetch summary with date parameters', async () => {
      ;(fetch as jest.Mock).mockResolvedValue(mockFetchResponse(mockSummaryStats))

      await api.getSummary({
        start_date: '2025-01-01',
        end_date: '2025-01-02',
      })

      expect(fetch).toHaveBeenCalledWith(
        'https://api.trafic.mx/api/v1/statistics/summary?start_date=2025-01-01&end_date=2025-01-02',
        {
          next: { revalidate: 300 },
        }
      )
    })

    it('should throw error when fetch fails', async () => {
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      })

      await expect(api.getSummary()).rejects.toThrow('Failed to fetch summary')
    })
  })

  describe('Network Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      ;(fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      await expect(api.getCameras()).rejects.toThrow('Network error')
    })

    it('should handle JSON parsing errors', async () => {
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      })

      await expect(api.getCameras()).rejects.toThrow('Invalid JSON')
    })
  })
})
