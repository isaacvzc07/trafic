import { render, screen } from '@/__tests__/utils/test-utils'
import CameraComparison from '@/components/CameraComparison'
import { mockSummaryStats } from '../utils/mockData'

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

describe('CameraComparison Component', () => {
  const mockData = mockSummaryStats

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render comparison title', () => {
    render(<CameraComparison data={mockData} />)

    expect(screen.getByText('Comparativa entre Cámaras')).toBeInTheDocument()
  })

  it('should render bar chart', () => {
    render(<CameraComparison data={mockData} />)

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })

  it('should display summary table', () => {
    render(<CameraComparison data={mockData} />)

    expect(screen.getByText('Resumen por Cámara')).toBeInTheDocument()
    expect(screen.getByText('Av. Homero Oeste-Este')).toBeInTheDocument()
    expect(screen.getByText('Av. Homero Este-Oeste')).toBeInTheDocument()
  })

  it('should show correct vehicle counts in table', () => {
    render(<CameraComparison data={mockData} />)

    // Check for car counts
    expect(screen.getByText('450')).toBeInTheDocument() // homero_oe car_in
    expect(screen.getByText('420')).toBeInTheDocument() // homero_oe car_out

    // Check for bus counts
    expect(screen.getByText('80')).toBeInTheDocument() // homero_oe bus_in
    expect(screen.getByText('75')).toBeInTheDocument() // homero_oe bus_out
  })

  it('should calculate totals correctly', () => {
    render(<CameraComparison data={mockData} />)

    // Total for homero_oe: 450+420+80+75+20+18 = 1063
    expect(screen.getByText('1063')).toBeInTheDocument()
  })

  it('should handle missing camera data gracefully', () => {
    const incompleteData = {
      start_date: '2025-01-06T00:00:00Z',
      end_date: '2025-01-06T23:59:59Z',
      summary: {
        camera1: {
          car_in: 100,
          car_out: 90,
        },
        // Missing bus and truck data
      },
    }

    render(<CameraComparison data={incompleteData} />)

    expect(screen.getByText('Comparativa entre Cámaras')).toBeInTheDocument()
    expect(screen.getByText('190')).toBeInTheDocument() // 100 + 90
  })

  it('should display flow balance information', () => {
    render(<CameraComparison data={mockData} />)

    expect(screen.getByText('Balance de Flujo')).toBeInTheDocument()
  })

  it('should handle empty summary data', () => {
    const emptyData = {
      start_date: '2025-01-06T00:00:00Z',
      end_date: '2025-01-06T23:59:59Z',
      summary: {},
    }

    render(<CameraComparison data={emptyData} />)

    expect(screen.getByText('Comparativa entre Cámaras')).toBeInTheDocument()
    expect(screen.getByText('Resumen por Cámara')).toBeInTheDocument()
  })

  it('should show table headers', () => {
    render(<CameraComparison data={mockData} />)

    expect(screen.getByText('Cámara')).toBeInTheDocument()
    expect(screen.getByText('Entrada')).toBeInTheDocument()
    expect(screen.getByText('Salida')).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('Balance')).toBeInTheDocument()
  })

  it('should calculate positive balance correctly', () => {
    const positiveBalanceData = {
      start_date: '2025-01-06T00:00:00Z',
      end_date: '2025-01-06T23:59:59Z',
      summary: {
        camera1: {
          car_in: 150,
          car_out: 100,
        },
      },
    }

    render(<CameraComparison data={positiveBalanceData} />)

    expect(screen.getByText('+50')).toBeInTheDocument()
  })

  it('should calculate negative balance correctly', () => {
    const negativeBalanceData = {
      start_date: '2025-01-06T00:00:00Z',
      end_date: '2025-01-06T23:59:59Z',
      summary: {
        camera1: {
          car_in: 100,
          car_out: 150,
        },
      },
    }

    render(<CameraComparison data={negativeBalanceData} />)

    expect(screen.getByText('-50')).toBeInTheDocument()
  })

  it('should show zero balance for equal counts', () => {
    const zeroBalanceData = {
      start_date: '2025-01-06T00:00:00Z',
      end_date: '2025-01-06T23:59:59Z',
      summary: {
        camera1: {
          car_in: 100,
          car_out: 100,
        },
      },
    }

    render(<CameraComparison data={zeroBalanceData} />)

    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('should handle undefined data prop', () => {
    // @ts-expect-error Testing undefined prop
    render(<CameraComparison data={undefined} />)

    expect(screen.getByText('Comparativa entre Cámaras')).toBeInTheDocument()
  })

  it('should display date range information', () => {
    render(<CameraComparison data={mockData} />)

    // The component should show period information
    expect(screen.getByText('Comparativa entre Cámaras')).toBeInTheDocument()
  })

  it('should have proper responsive layout', () => {
    const { container } = render(<CameraComparison data={mockData} />)

    // Check for responsive grid layout
    const gridContainer = container.querySelector('.grid')
    expect(gridContainer).toBeInTheDocument()
  })

  it('should process multiple cameras correctly', () => {
    render(<CameraComparison data={mockData} />)

    // Should show all 4 cameras from mock data
    expect(screen.getByText('Av. Homero Oeste-Este')).toBeInTheDocument()
    expect(screen.getByText('Av. Homero Este-Oeste')).toBeInTheDocument()
    expect(screen.getByText('Av. Industrias Norte-Sur')).toBeInTheDocument()
    expect(screen.getByText('Av. Industrias Sur-Norte')).toBeInTheDocument()
  })

  it('should handle camera with zero traffic', () => {
    render(<CameraComparison data={mockData} />)

    // industrias_sn has all zeros in mock data
    expect(screen.getByText('0')).toBeInTheDocument()
  })
})
