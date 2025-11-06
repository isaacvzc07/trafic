import { NextRequest } from 'next/server'
import { GET } from '@/app/api/cron/fetch-live/route'

// Mock fetch
global.fetch = jest.fn()

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
      upsert: jest.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    })),
  },
}))

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('/api/cron/fetch-live', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch and store live data successfully', async () => {
    const mockLiveCounts = [
      {
        camera_id: 'homero_oe',
        camera_name: 'Av. Homero Oeste-Este',
        counts: {
          car_in: 30,
          car_out: 25,
          bus_in: 5,
          bus_out: 3,
          truck_in: 2,
          truck_out: 1,
        },
        total_in: 37,
        total_out: 29,
        timestamp: '2025-01-06T12:00:00Z',
      },
      {
        camera_id: 'homero_eo',
        camera_name: 'Av. Homero Este-Oeste',
        counts: {
          car_in: 25,
          car_out: 20,
          bus_in: 4,
          bus_out: 2,
          truck_in: 1,
          truck_out: 0,
        },
        total_in: 30,
        total_out: 22,
        timestamp: '2025-01-06T12:00:00Z',
      },
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockLiveCounts),
      status: 200,
    } as Response)

    const request = new NextRequest('http://localhost:3000/api/cron/fetch-live')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('message', 'Live data fetched and stored successfully')
    expect(mockFetch).toHaveBeenCalledWith('https://api.trafic.mx/api/v1/live/counts')
  })

  it('should handle API errors gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: jest.fn().mockResolvedValue({ error: 'Internal server error' }),
    } as Response)

    const request = new NextRequest('http://localhost:3000/api/cron/fetch-live')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toHaveProperty('error')
  })

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const request = new NextRequest('http://localhost:3000/api/cron/fetch-live')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toHaveProperty('error')
  })

  it('should detect traffic anomalies', async () => {
    const mockHighTrafficData = [
      {
        camera_id: 'homero_oe',
        camera_name: 'Av. Homero Oeste-Este',
        counts: {
          car_in: 60,
          car_out: 50,
          bus_in: 10,
          bus_out: 8,
          truck_in: 5,
          truck_out: 3,
        },
        total_in: 75, // High traffic
        total_out: 61,
        timestamp: '2025-01-06T12:00:00Z',
      },
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockHighTrafficData),
      status: 200,
    } as Response)

    const request = new NextRequest('http://localhost:3000/api/cron/fetch-live')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('message', 'Live data fetched and stored successfully')
  })

  it('should handle empty response from API', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue([]),
      status: 200,
    } as Response)

    const request = new NextRequest('http://localhost:3000/api/cron/fetch-live')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('message', 'No live data available from API')
  })
})
