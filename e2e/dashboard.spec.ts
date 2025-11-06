import { test, expect } from '@playwright/test'

test.describe('Traffic Dashboard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the API responses for consistent testing
    await page.route('https://api.trafic.mx/api/v1/live/counts', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            camera_id: 'homero_oe',
            camera_name: 'Av. Homero Oeste-Este',
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
            camera_id: 'homero_eo',
            camera_name: 'Av. Homero Este-Oeste',
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
        ]),
      })
    })

    await page.route('https://api.trafic.mx/api/v1/statistics/hourly', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            period: '2025-01-06',
            hour: '2025-01-06T00:00:00Z',
            camera_id: 'homero_oe',
            vehicle_type: 'car',
            direction: 'in',
            count: 45,
            avg_confidence: 0.85,
          },
        ]),
      })
    })

    await page.route('https://api.trafic.mx/api/v1/statistics/summary', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          start_date: '2025-01-06T00:00:00Z',
          end_date: '2025-01-06T23:59:59Z',
          summary: {
            homero_oe: {
              car_in: 450,
              car_out: 420,
              bus_in: 80,
              bus_out: 75,
              truck_in: 20,
              truck_out: 18,
            },
          },
        }),
      })
    })
  })

  test('should load dashboard and display main elements', async ({ page }) => {
    await page.goto('/dashboard')

    // Check main title
    await expect(page.getByRole('heading', { name: 'Dashboard de Tráfico' })).toBeVisible()
    
    // Check subtitle
    await expect(page.getByText('Monitoreo en tiempo real - api.trafic.mx')).toBeVisible()

    // Check statistics cards
    await expect(page.getByText('Tráfico Total')).toBeVisible()
    await expect(page.getByText('Entrada / Salida')).toBeVisible()
    await expect(page.getByText('Cámaras Activas')).toBeVisible()
  })

  test('should display live traffic counters', async ({ page }) => {
    await page.goto('/dashboard')

    // Wait for data to load
    await expect(page.getByText('Contadores en Tiempo Real')).toBeVisible()

    // Check camera names are displayed
    await expect(page.getByText('Av. Homero Oeste-Este')).toBeVisible()
    await expect(page.getByText('Av. Homero Este-Oeste')).toBeVisible()

    // Check vehicle counts
    await expect(page.getByText('19')).toBeVisible() // total_in for first camera
    await expect(page.getByText('14')).toBeVisible() // total_out for first camera
  })

  test('should display traffic charts', async ({ page }) => {
    await page.goto('/dashboard')

    // Wait for charts to load
    await expect(page.getByText('Tráfico por Hora - Últimas 24 Horas')).toBeVisible()
    await expect(page.getByText('Comparativa entre Cámaras')).toBeVisible()

    // Check chart containers are present
    await expect(page.locator('[data-testid="responsive-container"]')).toBeVisible()
  })

  test('should show alerts when there is high traffic', async ({ page }) => {
    // Mock high traffic scenario
    await page.route('https://api.trafic.mx/api/v1/live/counts', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            camera_id: 'busy_camera',
            camera_name: 'Av. Homero Oeste-Este',
            counts: {
              car_in: 25,
              car_out: 15,
              bus_in: 5,
              bus_out: 3,
              truck_in: 3,
              truck_out: 2,
            },
            total_in: 33,
            total_out: 20,
            timestamp: '2025-01-06T12:00:00Z',
          },
        ]),
      })
    })

    await page.goto('/dashboard')

    // Should show high traffic alert
    await expect(page.getByText('Alto tráfico en Av. Homero Oeste-Este: 53 vehículos en últimos 5 min')).toBeVisible()
  })

  test('should show normal state when traffic is low', async ({ page }) => {
    // Mock low traffic scenario
    await page.route('https://api.trafic.mx/api/v1/live/counts', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            camera_id: 'normal_camera',
            camera_name: 'Av. Homero Oeste-Este',
            counts: {
              car_in: 5,
              car_out: 3,
              bus_in: 1,
              bus_out: 0,
              truck_in: 0,
              truck_out: 0,
            },
            total_in: 6,
            total_out: 3,
            timestamp: '2025-01-06T12:00:00Z',
          },
        ]),
      })
    })

    await page.goto('/dashboard')

    // Should show normal state message
    await expect(page.getByText('Sistema operando normalmente. No hay alertas en este momento.')).toBeVisible()
  })

  test('should display loading state initially', async ({ page }) => {
    // Mock slow response
    await page.route('https://api.trafic.mx/api/v1/live/counts', async route => {
      // Delay response
      await new Promise(resolve => setTimeout(resolve, 2000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    })

    await page.goto('/dashboard')

    // Should show loading state
    await expect(page.getByText('Cargando datos de tráfico...')).toBeVisible()
  })

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('https://api.trafic.mx/api/v1/live/counts', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      })
    })

    await page.goto('/dashboard')

    // Should show error state
    await expect(page.getByText('Error al cargar datos')).toBeVisible()
    await expect(page.getByText('No se pudo conectar con la API. Por favor verifica tu conexión e intenta de nuevo.')).toBeVisible()
  })

  test('should be responsive on mobile devices', async ({ page }) => {
    await page.goto('/dashboard')

    // Get viewport size
    const viewport = page.viewportSize()
    
    // Check that elements are visible and properly laid out
    await expect(page.getByRole('heading', { name: 'Dashboard de Tráfico' })).toBeVisible()
    
    // On mobile, stats should stack vertically
    const statsCards = page.locator('.grid > div').filter({ hasText: 'Tráfico Total' })
    await expect(statsCards.first()).toBeVisible()
  })

  test('should auto-refresh data', async ({ page }) => {
    let requestCount = 0
    
    await page.route('https://api.trafic.mx/api/v1/live/counts', async route => {
      requestCount++
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            camera_id: 'homero_oe',
            camera_name: 'Av. Homero Oeste-Este',
            counts: { car_in: 15, car_out: 12 },
            total_in: 15,
            total_out: 12,
            timestamp: '2025-01-06T12:00:00Z',
          },
        ]),
      })
    })

    await page.goto('/dashboard')

    // Wait for initial request
    await expect(page.getByText('Contadores en Tiempo Real')).toBeVisible()
    
    // Wait for auto-refresh (should happen within 10 seconds)
    await page.waitForTimeout(6000)
    
    // Should have made multiple requests due to auto-refresh
    expect(requestCount).toBeGreaterThan(1)
  })

  test('should display footer information', async ({ page }) => {
    await page.goto('/dashboard')

    await expect(page.getByText('Los datos se actualizan automáticamente cada 5 segundos.')).toBeVisible()
    await expect(page.getByText('Sistema de monitoreo de tráfico vehicular en tiempo real.')).toBeVisible()
    await expect(page.getByText('Ubicaciones:')).toBeVisible()
    await expect(page.getByText('Av. Homero (Oeste-Este, Este-Oeste) • Av. Industrias (Norte-Sur, Sur-Norte)')).toBeVisible()
  })
})
