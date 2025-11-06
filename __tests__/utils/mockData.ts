import { LiveCount, HourlyStatistic, SummaryStatistics, Camera } from '@/types/api'

// Mock camera data
export const mockCameras: Camera[] = [
  {
    id: 'cam_01',
    name: 'Camera 01 - Main Intersection',
    active: true,
    line_x1: 100,
    line_y1: 200,
    line_x2: 300,
    line_y2: 200,
    address: 'Location: 28.712335611426948, -106.10549703573227',
  },
  {
    id: 'cam_02',
    name: 'Camera 02 - North',
    active: true,
    line_x1: 300,
    line_y1: 300,
    line_x2: 100,
    line_y2: 300,
    address: 'Location: 28.712335611426948, -106.10549703573227',
  },
  {
    id: 'cam_03',
    name: 'Camera 03 - South',
    active: true,
    line_x1: 200,
    line_y1: 100,
    line_x2: 200,
    line_y2: 300,
    address: 'Location: 28.712335611426948, -106.10549703573227',
  },
  {
    id: 'cam_04',
    name: 'Camera 04 - East',
    active: true,
    line_x1: 200,
    line_y1: 300,
    line_x2: 200,
    line_y2: 100,
    address: 'Location: 28.712335611426948, -106.10549703573227',
  },
]

// Mock live count data
export const mockLiveCounts: LiveCount[] = [
  {
    camera_id: 'cam_01',
    camera_name: 'Camera 01 - Main Intersection',
    counts: {
      car_in: 15,
      car_out: 12,
      bus_in: 3,
      bus_out: 2,
      truck_in: 1,
      truck_out: 0,
    },
    total_in: 19,
    total_out: 14,
    timestamp: '2025-01-06T12:00:00Z',
  },
  {
    camera_id: 'cam_02',
    camera_name: 'Camera 02 - North',
    counts: {
      car_in: 8,
      car_out: 10,
      bus_in: 1,
      bus_out: 1,
      truck_in: 0,
      truck_out: 1,
    },
    total_in: 9,
    total_out: 12,
    timestamp: '2025-01-06T12:00:00Z',
  },
  {
    camera_id: 'cam_03',
    camera_name: 'Camera 03 - South',
    counts: {
      car_in: 25,
      car_out: 20,
      bus_in: 5,
      bus_out: 3,
      truck_in: 2,
      truck_out: 1,
    },
    total_in: 32,
    total_out: 24,
    timestamp: '2025-01-06T12:00:00Z',
  },
  {
    camera_id: 'cam_04',
    camera_name: 'Camera 04 - East',
    counts: {
      car_in: 12,
      car_out: 15,
      bus_in: 2,
      bus_out: 3,
      truck_in: 1,
      truck_out: 2,
    },
    total_in: 15,
    total_out: 20,
    timestamp: '2025-01-06T12:00:00Z',
  },
]

// Mock hourly statistics
export const mockHourlyStats: HourlyStatistic[] = [
  {
    period: '2025-01-06',
    hour: '2025-01-06T00:00:00Z',
    camera_id: 'cam_01',
    vehicle_type: 'car',
    direction: 'in',
    count: 45,
    avg_confidence: 0.85,
  },
  {
    period: '2025-01-06',
    hour: '2025-01-06T00:00:00Z',
    camera_id: 'cam_01',
    vehicle_type: 'car',
    direction: 'out',
    count: 42,
    avg_confidence: 0.83,
  },
  {
    period: '2025-01-06',
    hour: '2025-01-06T01:00:00Z',
    camera_id: 'cam_02',
    vehicle_type: 'bus',
    direction: 'in',
    count: 8,
    avg_confidence: 0.90,
  },
]

// Mock summary statistics
export const mockSummaryStats: SummaryStatistics = {
  start_date: '2025-01-06T00:00:00Z',
  end_date: '2025-01-06T23:59:59Z',
  summary: {
    cam_01: {
      car_in: 450,
      car_out: 420,
      bus_in: 80,
      bus_out: 75,
      truck_in: 20,
      truck_out: 18,
    },
    cam_02: {
      car_in: 380,
      car_out: 400,
      bus_in: 65,
      bus_out: 70,
      truck_in: 15,
      truck_out: 12,
    },
    cam_03: {
      car_in: 520,
      car_out: 480,
      bus_in: 95,
      bus_out: 85,
      truck_in: 35,
      truck_out: 28,
    },
    cam_04: {
      car_in: 290,
      car_out: 310,
      bus_in: 45,
      bus_out: 50,
      truck_in: 18,
      truck_out: 22,
    },
  },
}

// Mock API responses
export const mockApiResponse = {
  cameras: mockCameras,
  liveCounts: mockLiveCounts,
  hourlyStats: {
    period: '2025-01-06',
    data: mockHourlyStats,
  },
  summary: mockSummaryStats,
}

// Helper functions for testing
export const createMockLiveCount = (overrides: Partial<LiveCount> = {}): LiveCount => ({
  camera_id: 'test_camera',
  camera_name: 'Test Camera',
  counts: {
    car_in: 10,
    car_out: 8,
    bus_in: 2,
    bus_out: 1,
    truck_in: 1,
    truck_out: 0,
  },
  total_in: 13,
  total_out: 9,
  timestamp: '2025-01-06T12:00:00Z',
  ...overrides,
})

export const createMockHourlyStat = (overrides: Partial<HourlyStatistic> = {}): HourlyStatistic => ({
  period: '2025-01-06',
  hour: '2025-01-06T12:00:00Z',
  camera_id: 'test_camera',
  vehicle_type: 'car',
  direction: 'in',
  count: 15,
  avg_confidence: 0.85,
  ...overrides,
})

// Mock fetch responses
export const mockFetchResponse = (data: any, ok = true, status = 200) => 
  Promise.resolve({
    ok,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  } as Response)

// Mock error response
export const mockFetchError = (message = 'Network error') =>
  Promise.reject(new Error(message))
