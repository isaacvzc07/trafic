'use client';

import { useLiveCounts, useHourlyStatistics, useSummaryStatistics } from '@/hooks/useTrafficData';
import LiveCounter from '@/components/LiveCounter';
import TrafficChart from '@/components/TrafficChart';
import CameraComparison from '@/components/CameraComparison';
import AlertsBanner from '@/components/AlertsBanner';
import { Activity, TrendingUp, Camera } from 'lucide-react';

export default function Dashboard() {
  const { liveCounts, isLoading: loadingLive, isError: errorLive } = useLiveCounts(5000);
  const { hourlyStats, isLoading: loadingHourly, isError: errorHourly } = useHourlyStatistics(60000);
  const { summary, isLoading: loadingSummary, isError: errorSummary } = useSummaryStatistics(60000);

  if (errorLive || errorHourly || errorSummary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-bold text-lg mb-2">Error al cargar datos</h2>
          <p className="text-red-600">
            No se pudo conectar con la API. Por favor verifica tu conexión e intenta de nuevo.
          </p>
        </div>
      </div>
    );
  }

  const isLoading = loadingLive || loadingHourly || loadingSummary;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando datos de tráfico...</p>
        </div>
      </div>
    );
  }

  // Calculate total traffic across all cameras
  const totalTraffic = liveCounts?.reduce((sum, count) => sum + count.total_in + count.total_out, 0) || 0;
  const totalIn = liveCounts?.reduce((sum, count) => sum + count.total_in, 0) || 0;
  const totalOut = liveCounts?.reduce((sum, count) => sum + count.total_out, 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard de Tráfico</h1>
              <p className="text-blue-100">Monitoreo en tiempo real - api.trafic.mx</p>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold">{totalTraffic}</div>
                <div className="text-sm text-blue-100">Vehículos (5 min)</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{liveCounts?.length || 0}</div>
                <div className="text-sm text-blue-100">Cámaras Activas</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Tráfico Total</p>
                <p className="text-3xl font-bold text-gray-900">{totalTraffic}</p>
                <p className="text-xs text-gray-500 mt-1">Últimos 5 minutos</p>
              </div>
              <Activity className="h-12 w-12 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Entrada / Salida</p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalIn} / {totalOut}
                </p>
                <p className="text-xs text-gray-500 mt-1">Balance: {totalIn - totalOut > 0 ? '+' : ''}{totalIn - totalOut}</p>
              </div>
              <TrendingUp className="h-12 w-12 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Cámaras Activas</p>
                <p className="text-3xl font-bold text-gray-900">{liveCounts?.length || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Monitoreando 2 avenidas</p>
              </div>
              <Camera className="h-12 w-12 text-green-600" />
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        {liveCounts && (
          <div className="mb-8">
            <AlertsBanner liveCounts={liveCounts} />
          </div>
        )}

        {/* Live Counters Grid */}
        {liveCounts && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contadores en Tiempo Real</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {liveCounts.map((count) => (
                <LiveCounter key={count.camera_id} data={count} />
              ))}
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Hourly Traffic Chart */}
          {hourlyStats && (
            <div className="xl:col-span-2">
              <TrafficChart data={hourlyStats} />
            </div>
          )}

          {/* Camera Comparison */}
          {summary && (
            <div className="xl:col-span-2">
              <CameraComparison data={summary} />
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="bg-white rounded-lg shadow-md p-6 text-center text-sm text-gray-600">
          <p>
            Los datos se actualizan automáticamente cada 5 segundos.
            Sistema de monitoreo de tráfico vehicular en tiempo real.
          </p>
          <p className="mt-2">
            <span className="font-semibold">Ubicaciones:</span> Av. Homero (Oeste-Este, Este-Oeste) • Av. Industrias (Norte-Sur, Sur-Norte)
          </p>
        </div>
      </div>
    </div>
  );
}
