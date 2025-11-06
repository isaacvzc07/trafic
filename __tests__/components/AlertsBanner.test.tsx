import { render, screen } from '@/__tests__/utils/test-utils'
import AlertsBanner from '@/components/AlertsBanner'
import { createMockLiveCount } from '../utils/mockData'

describe('AlertsBanner Component', () => {
  it('should show normal state when no alerts', () => {
    const normalData = [
      createMockLiveCount({
        camera_id: 'camera1',
        camera_name: 'Camera 1',
        total_in: 5,
        total_out: 3,
      }),
      createMockLiveCount({
        camera_id: 'camera2',
        camera_name: 'Camera 2',
        total_in: 8,
        total_out: 6,
      }),
    ]

    render(<AlertsBanner liveCounts={normalData} />)

    expect(screen.getByText('Sistema operando normalmente. No hay alertas en este momento.')).toBeInTheDocument()
  })

  it('should show high traffic alert', () => {
    const highTrafficData = [
      createMockLiveCount({
        camera_id: 'camera1',
        camera_name: 'Av. Homero Oeste-Este',
        total_in: 20,
        total_out: 15,
      }),
    ]

    render(<AlertsBanner liveCounts={highTrafficData} />)

    expect(screen.getByText('Alto tráfico en Av. Homero Oeste-Este: 35 vehículos en últimos 5 min')).toBeInTheDocument()
  })

  it('should show congestion alert', () => {
    const congestionData = [
      createMockLiveCount({
        camera_id: 'camera1',
        camera_name: 'Av. Industrias Norte-Sur',
        total_in: 25,
        total_out: 10,
      }),
    ]

    render(<AlertsBanner liveCounts={congestionData} />)

    expect(screen.getByText('Congestión detectada en Av. Industrias Norte-Sur: 15 vehículos acumulándose')).toBeInTheDocument()
  })

  it('should show no traffic alert', () => {
    const noTrafficData = [
      createMockLiveCount({
        camera_id: 'camera1',
        camera_name: 'Camera 1',
        total_in: 0,
        total_out: 0,
      }),
      createMockLiveCount({
        camera_id: 'camera2',
        camera_name: 'Camera 2',
        total_in: 0,
        total_out: 0,
      }),
    ]

    render(<AlertsBanner liveCounts={noTrafficData} />)

    expect(screen.getByText('Sin tráfico detectado en 2 cámara(s) en los últimos 5 minutos')).toBeInTheDocument()
  })

  it('should show multiple alerts', () => {
    const multipleAlertsData = [
      createMockLiveCount({
        camera_id: 'camera1',
        camera_name: 'High Traffic Camera',
        total_in: 25,
        total_out: 10,
      }),
      createMockLiveCount({
        camera_id: 'camera2',
        camera_name: 'No Traffic Camera',
        total_in: 0,
        total_out: 0,
      }),
    ]

    render(<AlertsBanner liveCounts={multipleAlertsData} />)

    expect(screen.getByText('Alto tráfico en High Traffic Camera: 35 vehículos en últimos 5 min')).toBeInTheDocument()
    expect(screen.getByText('Congestión detectada en High Traffic Camera: 15 vehículos acumulándose')).toBeInTheDocument()
    expect(screen.getByText('Sin tráfico detectado en 1 cámara(s) en los últimos 5 minutos')).toBeInTheDocument()
  })

  it('should show warning icon for high traffic alerts', () => {
    const highTrafficData = [
      createMockLiveCount({
        camera_id: 'camera1',
        camera_name: 'High Traffic Camera',
        total_in: 20,
        total_out: 15,
      }),
    ]

    render(<AlertsBanner liveCounts={highTrafficData} />)

    const warningIcon = document.querySelector('svg')
    expect(warningIcon).toBeInTheDocument()
  })

  it('should show info icon for no traffic alerts', () => {
    const noTrafficData = [
      createMockLiveCount({
        camera_id: 'camera1',
        camera_name: 'Camera 1',
        total_in: 0,
        total_out: 0,
      }),
    ]

    render(<AlertsBanner liveCounts={noTrafficData} />)

    const infoIcon = document.querySelector('svg')
    expect(infoIcon).toBeInTheDocument()
  })

  it('should show check icon for normal state', () => {
    const normalData = [
      createMockLiveCount({
        camera_id: 'camera1',
        camera_name: 'Camera 1',
        total_in: 5,
        total_out: 3,
      }),
    ]

    render(<AlertsBanner liveCounts={normalData} />)

    const checkIcon = document.querySelector('svg')
    expect(checkIcon).toBeInTheDocument()
  })

  it('should handle empty live counts array', () => {
    render(<AlertsBanner liveCounts={[]} />)

    expect(screen.getByText('Sin tráfico detectado en 0 cámara(s) en los últimos 5 minutos')).toBeInTheDocument()
  })

  it('should apply correct styling for warning alerts', () => {
    const highTrafficData = [
      createMockLiveCount({
        camera_id: 'camera1',
        camera_name: 'High Traffic Camera',
        total_in: 20,
        total_out: 15,
      }),
    ]

    render(<AlertsBanner liveCounts={highTrafficData} />)

    const alertContainer = screen.getByText('Alto tráfico en High Traffic Camera: 35 vehículos en últimos 5 min').closest('div')
    expect(alertContainer).toHaveClass('bg-yellow-50', 'border-yellow-200')
  })

  it('should apply correct styling for info alerts', () => {
    const noTrafficData = [
      createMockLiveCount({
        camera_id: 'camera1',
        camera_name: 'Camera 1',
        total_in: 0,
        total_out: 0,
      }),
    ]

    render(<AlertsBanner liveCounts={noTrafficData} />)

    const alertContainer = screen.getByText('Sin tráfico detectado en 1 cámara(s) en los últimos 5 minutos').closest('div')
    expect(alertContainer).toHaveClass('bg-blue-50', 'border-blue-200')
  })

  it('should apply correct styling for normal state', () => {
    const normalData = [
      createMockLiveCount({
        camera_id: 'camera1',
        camera_name: 'Camera 1',
        total_in: 5,
        total_out: 3,
      }),
    ]

    render(<AlertsBanner liveCounts={normalData} />)

    const normalContainer = screen.getByText('Sistema operando normalmente. No hay alertas en este momento.').closest('div')
    expect(normalContainer).toHaveClass('bg-green-50', 'border-green-200')
  })

  it('should handle edge case of exactly 30 vehicles (threshold)', () => {
    const thresholdData = [
      createMockLiveCount({
        camera_id: 'camera1',
        camera_name: 'Threshold Camera',
        total_in: 20,
        total_out: 10,
      }),
    ]

    render(<AlertsBanner liveCounts={thresholdData} />)

    // 30 vehicles should trigger high traffic alert
    expect(screen.getByText('Alto tráfico en Threshold Camera: 30 vehículos en últimos 5 min')).toBeInTheDocument()
  })

  it('should handle edge case of exactly 10 net flow (threshold)', () => {
    const thresholdData = [
      createMockLiveCount({
        camera_id: 'camera1',
        camera_name: 'Threshold Camera',
        total_in: 15,
        total_out: 5,
      }),
    ]

    render(<AlertsBanner liveCounts={thresholdData} />)

    // 10 net flow should trigger congestion alert
    expect(screen.getByText('Congestión detectada en Threshold Camera: 10 vehículos acumulándose')).toBeInTheDocument()
  })
})
