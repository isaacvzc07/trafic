import { NextRequest } from 'next/server'
import { GET } from '@/app/api/history/hourly/route'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => {
          const mockQuery = {
            gte: jest.fn().mockReturnThis(),
            lte: jest.fn().mockResolvedValue({
              data: [
                {
                  hour: '2025-01-06T00:00:00Z',
                  camera_id: 'homero_oe',
                  vehicle_type: 'car',
                  direction: 'in',
                  count: 45,
                  avg_confidence: 0.85,
                },
                {
                  hour: '2025-01-06T01:00:00Z',
                  camera_id: 'homero_eo',
                  vehicle_type: 'bus',
                  direction: 'out',
                  count: 8,
                  avg_confidence: 0.90,
                },
              ],
              error: null,
            }),
          }
          return mockQuery
        }),
      })),
    })),
  },
}))


describe('/api/history/hourly', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return hourly statistics successfully', async () => {
    const request = new NextRequest('http://localhost:3000/api/history/hourly')
    
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('data')
    expect(data).toHaveProperty('period', 'all available data')
    expect(data).toHaveProperty('count')
    expect(Array.isArray(data.data)).toBe(true)
    expect(data.data).toHaveLength(2) // Two different hours
    expect(data.data[0]).toHaveProperty('hour', '2025-01-06T00:00:00Z')
    expect(data.data[0]).toHaveProperty('data')
    expect(Array.isArray(data.data[0].data)).toBe(true)
  })

  it('should handle start and end date parameters', async () => {
    const request = new NextRequest('http://localhost:3000/api/history/hourly?start=2025-01-01&end=2025-01-02')
    
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('data')
    expect(data).toHaveProperty('period', '2025-01-01 to 2025-01-02')
  })

  it('should handle database errors', async () => {
    const { supabase } = require('@/lib/supabase')
    supabase.from.mockReturnValueOnce({
      select: jest.fn(() => ({
        order: jest.fn(() => {
          const mockQuery = {
            gte: jest.fn().mockReturnThis(),
            lte: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }
          return mockQuery
        }),
      })),
    })

    const request = new NextRequest('http://localhost:3000/api/history/hourly')
    
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toHaveProperty('error', 'Database query error')
  })

  it('should handle empty data', async () => {
    const { supabase } = require('@/lib/supabase')
    supabase.from.mockReturnValue({
      select: jest.fn(() => ({
        order: jest.fn(() => {
          const mockQuery = {
            gte: jest.fn().mockReturnThis(),
            lte: jest.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }
          return mockQuery
        }),
      })),
    })

    const request = new NextRequest('http://localhost:3000/api/history/hourly')
    
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data).toEqual([])
    expect(data.count).toBe(0)
  })
})
