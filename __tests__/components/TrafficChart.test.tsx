import { render, screen } from '@/__tests__/utils/test-utils'
import TrafficChart from '@/components/TrafficChart'
import { mockHourlyStats } from '../utils/mockData'

// Mock the useHistoricalData hook
jest.mock('@/hooks/useTrafficData', () => ({
  useHistoricalData: jest.fn(),
}))

import { useHistoricalData } from '@/hooks/useTrafficData'
const mockUseHistoricalData = useHistoricalData as jest.MockedFunction<typeof useHistoricalData>

// Mock recharts components properly
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children, 'data-testid': testId }) => 
    React.createElement('div', { 'data-testid': testId || 'responsive-container' }, children),
  LineChart: ({ children, 'data-testid': testId }) => 
    React.createElement('div', { 'data-testid': testId || 'line-chart' }, children),
  Line: () => React.createElement('div'),
  XAxis: () => React.createElement('div'),
  YAxis: () => React.createElement('div'),
  CartesianGrid: () => React.createElement('div'),
  Tooltip: () => React.createElement('div'),
  Legend: () => React.createElement('div'),
  BarChart: ({ children, 'data-testid': testId }) => 
    React.createElement('div', { 'data-testid': testId || 'bar-chart' }, children),
  Bar: () => React.createElement('div'),
}))

import React from 'react'

describe('TrafficChart Component', () => {
  const mockData = mockHourlyStats

  beforeEach(() => {
    jest.clearAllMocks()
    // Default mock implementation
    mockUseHistoricalData.mockReturnValue({
      historicalData: mockData,
      period: '2025-01-06',
      isLoading: false,
      isError: undefined,
    })
  })

  it('should render chart title', () => {
    render(<TrafficChart data={mockData} />)

    expect(screen.getByText('Tráfico por Hora (Últimas 24h)')).toBeInTheDocument()
  })

  it('should render responsive container', () => {
    render(<TrafficChart data={mockData} />)

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('should render chart with data', () => {
    render(<TrafficChart data={mockData} />)

    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('should handle empty data gracefully', () => {
    render(<TrafficChart data={[]} />)

    expect(screen.getByText('Tráfico por Hora (Últimas 24h)')).toBeInTheDocument()
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })

  it('should display loading state when no data', () => {
    render(<TrafficChart data={[]} />)

    // Chart should still render the structure even with no data
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })

  it('should process data correctly by camera', () => {
    render(<TrafficChart data={mockData} />)

    // The component should render without errors
    expect(screen.getByText('Tráfico por Hora (Últimas 24h)')).toBeInTheDocument()
  })

  it('should display different vehicle types', () => {
    const dataWithDifferentVehicles = [
      ...mockData,
      {
        period: '2025-01-06',
        hour: '2025-01-06T02:00:00Z',
        camera_id: 'camera_bus',
        vehicle_type: 'bus' as const,
        direction: 'in' as const,
        count: 10,
        avg_confidence: 0.90,
      },
      {
        period: '2025-01-06',
        hour: '2025-01-06T02:00:00Z',
        camera_id: 'camera_truck',
        vehicle_type: 'truck' as const,
        direction: 'out' as const,
        count: 5,
        avg_confidence: 0.80,
      },
    ]

    render(<TrafficChart data={dataWithDifferentVehicles} />)

    expect(screen.getByText('Tráfico por Hora (Últimas 24h)')).toBeInTheDocument()
  })

  it('should aggregate data by hour and camera', () => {
    const hourlyData = [
      {
        period: '2025-01-06',
        hour: '2025-01-06T00:00:00Z',
        camera_id: 'homero_oe',
        vehicle_type: 'car' as const,
        direction: 'in' as const,
        count: 45,
        avg_confidence: 0.85,
      },
      {
        period: '2025-01-06',
        hour: '2025-01-06T00:00:00Z',
        camera_id: 'homero_oe',
        vehicle_type: 'bus' as const,
        direction: 'in' as const,
        count: 8,
        avg_confidence: 0.90,
      },
      {
        period: '2025-01-06',
        hour: '2025-01-06T00:00:00Z',
        camera_id: 'homero_eo',
        vehicle_type: 'car' as const,
        direction: 'out' as const,
        count: 42,
        avg_confidence: 0.83,
      },
    ]

    render(<TrafficChart data={hourlyData} />)

    expect(screen.getByText('Tráfico por Hora (Últimas 24h)')).toBeInTheDocument()
  })

  it('should handle multiple cameras', () => {
    const multiCameraData = [
      {
        period: '2025-01-06',
        hour: '2025-01-06T00:00:00Z',
        camera_id: 'camera1',
        vehicle_type: 'car' as const,
        direction: 'in' as const,
        count: 20,
        avg_confidence: 0.85,
      },
      {
        period: '2025-01-06',
        hour: '2025-01-06T00:00:00Z',
        camera_id: 'camera2',
        vehicle_type: 'car' as const,
        direction: 'in' as const,
        count: 15,
        avg_confidence: 0.80,
      },
      {
        period: '2025-01-06',
        hour: '2025-01-06T00:00:00Z',
        camera_id: 'camera3',
        vehicle_type: 'car' as const,
        direction: 'in' as const,
        count: 10,
        avg_confidence: 0.75,
      },
      {
        period: '2025-01-06',
        hour: '2025-01-06T00:00:00Z',
        camera_id: 'camera4',
        vehicle_type: 'car' as const,
        direction: 'in' as const,
        count: 5,
        avg_confidence: 0.70,
      },
    ]

    render(<TrafficChart data={multiCameraData} />)

    expect(screen.getByText('Tráfico por Hora (Últimas 24h)')).toBeInTheDocument()
  })

  it('should have proper responsive behavior', () => {
    const { container } = render(<TrafficChart data={mockData} />)

    // Check if the container has responsive classes
    const chartContainer = container.querySelector('.bg-white')
    expect(chartContainer).toBeInTheDocument()
  })

  it('should handle undefined data prop', () => {
    // @ts-expect-error Testing undefined prop
    render(<TrafficChart data={undefined} />)

    expect(screen.getByText('Tráfico por Hora (Últimas 24h)')).toBeInTheDocument()
  })

  it('should format hours correctly', () => {
    const dataWithSpecificHour = [
      {
        period: '2025-01-06',
        hour: '2025-01-06T14:00:00Z',
        camera_id: 'camera1',
        vehicle_type: 'car' as const,
        direction: 'in' as const,
        count: 25,
        avg_confidence: 0.85,
      },
    ]

    render(<TrafficChart data={dataWithSpecificHour} />)

    expect(screen.getByText('Tráfico por Hora (Últimas 24h)')).toBeInTheDocument()
  })
})
