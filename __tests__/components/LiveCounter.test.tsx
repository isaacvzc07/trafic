import { render, screen } from '@/__tests__/utils/test-utils'
import LiveCounter from '@/components/LiveCounter'
import { createMockLiveCount } from '../utils/mockData'

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn(() => '5 minutes ago'),
}))

describe('LiveCounter Component', () => {
  const mockData = createMockLiveCount()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render camera information correctly', () => {
    render(<LiveCounter data={mockData} />)

    expect(screen.getByText('Test Camera')).toBeInTheDocument()
    expect(screen.getByText('test_camera')).toBeInTheDocument()
  })

  it('should display vehicle counts correctly', () => {
    render(<LiveCounter data={mockData} />)

    expect(screen.getByText('10')).toBeInTheDocument() // total_in
    expect(screen.getByText('8')).toBeInTheDocument() // total_out
  })

  it('should show low congestion level for normal traffic', () => {
    const lowTrafficData = createMockLiveCount({
      counts: { car_in: 5, car_out: 3, bus_in: 1, bus_out: 0, truck_in: 0, truck_out: 0 },
      total_in: 6,
      total_out: 3,
    })

    render(<LiveCounter data={lowTrafficData} />)

    const container = screen.getByText('Test Camera').closest('div')
    expect(container).toHaveClass('bg-green-50', 'border-green-200')
  })

  it('should show medium congestion level for moderate traffic', () => {
    const mediumTrafficData = createMockLiveCount({
      counts: { car_in: 10, car_out: 8, bus_in: 2, bus_out: 1, truck_in: 1, truck_out: 0 },
      total_in: 13,
      total_out: 9,
    })

    render(<LiveCounter data={mediumTrafficData} />)

    const container = screen.getByText('Test Camera').closest('div')
    expect(container).toHaveClass('bg-yellow-50', 'border-yellow-200')
  })

  it('should show high congestion level for heavy traffic', () => {
    const highTrafficData = createMockLiveCount({
      counts: { car_in: 20, car_out: 15, bus_in: 5, bus_out: 3, truck_in: 3, truck_out: 2 },
      total_in: 28,
      total_out: 20,
    })

    render(<LiveCounter data={highTrafficData} />)

    const container = screen.getByText('Test Camera').closest('div')
    expect(container).toHaveClass('bg-red-50', 'border-red-200')
  })

  it('should display net flow correctly when accumulating', () => {
    const accumulatingData = createMockLiveCount({
      total_in: 15,
      total_out: 5,
    })

    render(<LiveCounter data={accumulatingData} />)

    expect(screen.getByText('+10')).toBeInTheDocument()
    expect(screen.getByText('Acumulación')).toBeInTheDocument()
  })

  it('should display net flow correctly when dispersing', () => {
    const dispersingData = createMockLiveCount({
      total_in: 5,
      total_out: 15,
    })

    render(<LiveCounter data={dispersingData} />)

    expect(screen.getByText('-10')).toBeInTheDocument()
    expect(screen.getByText('Dispersión')).toBeInTheDocument()
  })

  it('should show balanced flow when equal', () => {
    const balancedData = createMockLiveCount({
      total_in: 10,
      total_out: 10,
    })

    render(<LiveCounter data={balancedData} />)

    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('Balanceado')).toBeInTheDocument()
  })

  it('should display individual vehicle type counts', () => {
    render(<LiveCounter data={mockData} />)

    expect(screen.getByText('10')).toBeInTheDocument() // car_in
    expect(screen.getByText('8')).toBeInTheDocument() // car_out
    expect(screen.getByText('2')).toBeInTheDocument() // bus_in
    expect(screen.getByText('1')).toBeInTheDocument() // bus_out
    expect(screen.getByText('1')).toBeInTheDocument() // truck_in
    expect(screen.getByText('0')).toBeInTheDocument() // truck_out
  })

  it('should handle missing vehicle type counts gracefully', () => {
    const dataWithMissingCounts = createMockLiveCount({
      counts: { car_in: 5, car_out: 3 }, // missing bus and truck counts
      total_in: 5,
      total_out: 3,
    })

    render(<LiveCounter data={dataWithMissingCounts} />)

    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('should display timestamp information', () => {
    render(<LiveCounter data={mockData} />)

    expect(screen.getByText('5 minutes ago')).toBeInTheDocument()
  })

  it('should have proper accessibility attributes', () => {
    render(<LiveCounter data={mockData} />)

    // Check for proper heading structure
    expect(screen.getByRole('heading', { name: 'Test Camera' })).toBeInTheDocument()
  })

  it('should handle mounting state correctly', () => {
    render(<LiveCounter data={mockData} />)

    // Component should render without errors
    expect(screen.getByText('Test Camera')).toBeInTheDocument()
  })
})
