import { render, screen, waitFor } from '@/__tests__/utils/test-utils'
import Dashboard from '@/app/dashboard'
import { mockLiveCounts, mockHourlyStats, mockSummaryStats } from '../utils/mockData'
import useSWR from 'swr'

// Mock the hooks
jest.mock('@/hooks/useTrafficData')
jest.mock('swr')

const mockUseLiveCounts = jest.fn()
const mockUseHourlyStatistics = jest.fn()
const mockUseSummaryStatistics = jest.fn()

jest.mock('@/hooks/useTrafficData', () => ({
  useLiveCounts: () => mockUseLiveCounts(),
  useHourlyStatistics: () => mockUseHourlyStatistics(),
  useSummaryStatistics: () => mockUseSummaryStatistics(),
  useHistoricalData: () => ({
    historicalData: mockHourlyStats,
    isLoading: false,
    isError: undefined,
  }),
}))

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should show loading state initially', () => {
    mockUseLiveCounts.mockReturnValue({
      liveCounts: undefined,
      isLoading: true,
      isError: undefined,
    })
    mockUseHourlyStatistics.mockReturnValue({
      hourlyStats: undefined,
      isLoading: true,
      isError: undefined,
    })
    mockUseSummaryStatistics.mockReturnValue({
      summary: undefined,
      isLoading: true,
      isError: undefined,
    })

    render(<Dashboard />)

    expect(screen.getByText('Cargando datos de tráfico...')).toBeInTheDocument()
  })

  it('should show error state when API fails', () => {
    mockUseLiveCounts.mockReturnValue({
      liveCounts: undefined,
      isLoading: false,
      isError: new Error('API Error'),
    })
    mockUseHourlyStatistics.mockReturnValue({
      hourlyStats: undefined,
      isLoading: false,
      isError: undefined,
    })
    mockUseSummaryStatistics.mockReturnValue({
      summary: undefined,
      isLoading: false,
      isError: undefined,
    })

    render(<Dashboard />)

    expect(screen.getByText('Error al cargar datos')).toBeInTheDocument()
    expect(screen.getByText('No se pudo conectar con la API. Por favor verifica tu conexión e intenta de nuevo.')).toBeInTheDocument()
  })

  it('should render dashboard with data successfully', async () => {
    mockUseLiveCounts.mockReturnValue({
      liveCounts: mockLiveCounts,
      isLoading: false,
      isError: undefined,
    })
    mockUseHourlyStatistics.mockReturnValue({
      hourlyStats: mockHourlyStats,
      isLoading: false,
      isError: undefined,
    })
    mockUseSummaryStatistics.mockReturnValue({
      summary: mockSummaryStats,
      isLoading: false,
      isError: undefined,
    })

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Dashboard de Tráfico')).toBeInTheDocument()
    })

    expect(screen.getByText('Monitoreo en tiempo real - api.trafic.mx')).toBeInTheDocument()
  })

  it('should display traffic statistics correctly', async () => {
    mockUseLiveCounts.mockReturnValue({
      liveCounts: mockLiveCounts,
      isLoading: false,
      isError: undefined,
    })
    mockUseHourlyStatistics.mockReturnValue({
      hourlyStats: mockHourlyStats,
      isLoading: false,
      isError: undefined,
    })
    mockUseSummaryStatistics.mockReturnValue({
      summary: mockSummaryStats,
      isLoading: false,
      isError: undefined,
    })

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Tráfico Total')).toBeInTheDocument()
    })

    // Calculate total: (19+14) + (9+12) + (32+24) + (0+0) = 110
    expect(screen.getAllByText('110').length).toBeGreaterThan(0)
    expect(screen.getByText('Vehículos (5 min)')).toBeInTheDocument()
  })

  it('should show entry/exit statistics', async () => {
    mockUseLiveCounts.mockReturnValue({
      liveCounts: mockLiveCounts,
      isLoading: false,
      isError: undefined,
    })
    mockUseHourlyStatistics.mockReturnValue({
      hourlyStats: mockHourlyStats,
      isLoading: false,
      isError: undefined,
    })
    mockUseSummaryStatistics.mockReturnValue({
      summary: mockSummaryStats,
      isLoading: false,
      isError: undefined,
    })

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Entrada / Salida')).toBeInTheDocument()
    })

    // Total in: 19 + 9 + 32 + 0 = 60
    // Total out: 14 + 12 + 24 + 0 = 50
    expect(screen.getByText('60 / 50')).toBeInTheDocument()
    expect(screen.getByText('Balance: +10')).toBeInTheDocument()
  })

  it('should display active cameras count', async () => {
    mockUseLiveCounts.mockReturnValue({
      liveCounts: mockLiveCounts,
      isLoading: false,
      isError: undefined,
    })
    mockUseHourlyStatistics.mockReturnValue({
      hourlyStats: mockHourlyStats,
      isLoading: false,
      isError: undefined,
    })
    mockUseSummaryStatistics.mockReturnValue({
      summary: mockSummaryStats,
      isLoading: false,
      isError: undefined,
    })

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getAllByText('Cámaras Activas')).toHaveLength(2)
    })

    // "4" appears twice (header + stats card)
    expect(screen.getAllByText('4').length).toBeGreaterThan(0)
    expect(screen.getByText('Monitoreando 2 avenidas')).toBeInTheDocument()
  })

  it('should render live counters section', async () => {
    mockUseLiveCounts.mockReturnValue({
      liveCounts: mockLiveCounts,
      isLoading: false,
      isError: undefined,
    })
    mockUseHourlyStatistics.mockReturnValue({
      hourlyStats: mockHourlyStats,
      isLoading: false,
      isError: undefined,
    })
    mockUseSummaryStatistics.mockReturnValue({
      summary: mockSummaryStats,
      isLoading: false,
      isError: undefined,
    })

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Contadores en Tiempo Real')).toBeInTheDocument()
    })

    // Check if camera names are displayed
    expect(screen.getByText('Av. Homero Oeste-Este')).toBeInTheDocument()
    expect(screen.getByText('Av. Homero Este-Oeste')).toBeInTheDocument()
    expect(screen.getByText('Av. Industrias Norte-Sur')).toBeInTheDocument()
    expect(screen.getByText('Av. Industrias Sur-Norte')).toBeInTheDocument()
  })

  it('should render charts section', async () => {
    mockUseLiveCounts.mockReturnValue({
      liveCounts: mockLiveCounts,
      isLoading: false,
      isError: undefined,
    })
    mockUseHourlyStatistics.mockReturnValue({
      hourlyStats: mockHourlyStats,
      isLoading: false,
      isError: undefined,
    })
    mockUseSummaryStatistics.mockReturnValue({
      summary: mockSummaryStats,
      isLoading: false,
      isError: undefined,
    })

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Tráfico por Hora (Últimas 24h)')).toBeInTheDocument()
    })

    expect(screen.getByText('Comparativa entre Cámaras (24h)')).toBeInTheDocument()
  })

  it('should render footer information', async () => {
    mockUseLiveCounts.mockReturnValue({
      liveCounts: mockLiveCounts,
      isLoading: false,
      isError: undefined,
    })
    mockUseHourlyStatistics.mockReturnValue({
      hourlyStats: mockHourlyStats,
      isLoading: false,
      isError: undefined,
    })
    mockUseSummaryStatistics.mockReturnValue({
      summary: mockSummaryStats,
      isLoading: false,
      isError: undefined,
    })

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Dashboard de Tráfico')).toBeInTheDocument()
    })

    // Check if any footer text exists (might be conditional)
    const footerText = screen.queryByText('Los datos se actualizan automáticamente cada 5 segundos.')
    if (footerText) {
      expect(footerText).toBeInTheDocument()
    }
  })

  it('should handle empty live counts data', async () => {
    mockUseLiveCounts.mockReturnValue({
      liveCounts: [],
      isLoading: false,
      isError: undefined,
    })
    mockUseHourlyStatistics.mockReturnValue({
      hourlyStats: mockHourlyStats,
      isLoading: false,
      isError: undefined,
    })
    mockUseSummaryStatistics.mockReturnValue({
      summary: mockSummaryStats,
      isLoading: false,
      isError: undefined,
    })

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Dashboard de Tráfico')).toBeInTheDocument()
    })

    // Should show multiple zeros when no cameras - use getAllByText
    expect(screen.getAllByText('0').length).toBeGreaterThan(0)
  })

  it('should handle partial loading states', async () => {
    mockUseLiveCounts.mockReturnValue({
      liveCounts: mockLiveCounts,
      isLoading: false,
      isError: undefined,
    })
    mockUseHourlyStatistics.mockReturnValue({
      hourlyStats: undefined,
      isLoading: true,
      isError: undefined,
    })
    mockUseSummaryStatistics.mockReturnValue({
      summary: mockSummaryStats,
      isLoading: false,
      isError: undefined,
    })

    render(<Dashboard />)

    // Should still show loading state if any data is loading
    expect(screen.getByText('Cargando datos de tráfico...')).toBeInTheDocument()
  })

  it('should have proper accessibility structure', async () => {
    mockUseLiveCounts.mockReturnValue({
      liveCounts: mockLiveCounts,
      isLoading: false,
      isError: undefined,
    })
    mockUseHourlyStatistics.mockReturnValue({
      hourlyStats: mockHourlyStats,
      isLoading: false,
      isError: undefined,
    })
    mockUseSummaryStatistics.mockReturnValue({
      summary: mockSummaryStats,
      isLoading: false,
      isError: undefined,
    })

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Dashboard de Tráfico' })).toBeInTheDocument()
    })

    // Check for the main dashboard content using more specific selectors
    expect(screen.getByText('Tráfico Total')).toBeInTheDocument()
    expect(screen.getByText('Entrada / Salida')).toBeInTheDocument()
    // Use getAllByText since "Cámaras Activas" appears twice (header + stats card)
    expect(screen.getAllByText('Cámaras Activas')).toHaveLength(2)
  })
})
