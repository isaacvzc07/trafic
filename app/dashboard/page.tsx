'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLiveCounts, useHourlyStatistics, useSummaryStatistics } from '@/hooks/useTrafficDataQuery';
import { Card } from '@/components/ui/Card';
import { MetricCard } from '@/components/MetricCard';
import { DataTable } from '@/components/DataTable';
import { TrafficHeatmap } from '@/components/TrafficHeatmap';
import TrafficChartVisx from '@/components/TrafficChartVisx';
import TrafficMap from '@/components/TrafficMap';
import { Button } from '@/components/ui/Button';
import { Activity, TrendingUp, Camera, AlertCircle, Clock, BarChart3, ArrowLeft, Shield, Settings, Bell, User, Car, Zap } from 'lucide-react';
import { LiveCount, HourlyStatistic } from '@/types/api';
import { formatMexicoCityTime, MEXICO_CITY_TIMEZONE } from '@/lib/timezone';
import CameraSnapshots from '@/components/CameraSnapshots';
import SnapshotHistory from '@/components/SnapshotHistory';

export default function Dashboard() {
  const { liveCounts, isLoading: loadingLive, isError: errorLive } = useLiveCounts(5000);
  const { hourlyStats, isLoading: loadingHourly, isError: errorHourly } = useHourlyStatistics(60000);
  const { summary, isLoading: loadingSummary, isError: errorSummary } = useSummaryStatistics(60000);

  if (errorLive || errorHourly || errorSummary) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full p-6 rounded-xl border border-error bg-error-light">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="w-6 h-6 text-error" />
            <h2 className="text-error font-bold text-lg">Error al cargar datos</h2>
          </div>
          <p className="text-error text-sm">
            No se puede conectar a la API. Verifique su conexión e inténtelo de nuevo.
          </p>
        </div>
      </div>
    );
  }

  const isLoading = loadingLive || loadingHourly || loadingSummary;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-3 border-primary-200 border-t-primary-600 rounded-full mx-auto mb-4"
          />
          <p className="text-neutral-600 font-medium">Cargando datos de tráfico...</p>
        </div>
      </div>
    );
  }

  // Calculate total traffic across all cameras
  const liveCountsData = liveCounts as LiveCount[] | undefined;
  const totalTraffic = liveCountsData?.reduce((sum: number, count: LiveCount) => sum + (count.total_in || 0) + (count.total_out || 0), 0) || 0;
  const totalIn = liveCountsData?.reduce((sum: number, count: LiveCount) => sum + (count.total_in || 0), 0) || 0;
  const totalOut = liveCountsData?.reduce((sum: number, count: LiveCount) => sum + (count.total_out || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border border-neutral-200 shadow-soft">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-neutral-900">TrafficMX</span>
              </Link>
              <div className="hidden md:block text-sm text-neutral-500">
                Monitoreo en Tiempo Real
              </div>
              <Link 
                href="/dashboard/analysis"
                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                Análisis
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="p-2 text-neutral-600 hover:text-primary-600 transition-colors">
                <Bell className="w-4 h-4" />
              </button>
              <button className="p-2 text-neutral-600 hover:text-primary-600 transition-colors">
                <Settings className="w-4 h-4" />
              </button>
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-600" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Métricas Clave */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <MetricCard
            title="Tráfico Total"
            value={totalTraffic}
            change={12.5}
            trend="up"
            changeLabel="vs. última hora"
            icon={<Activity className="w-5 h-5" />}
            format="number"
          />
          
          <MetricCard
            title="Entrada / Salida"
            value={`${totalIn} / ${totalOut}`}
            change={totalIn - totalOut > 0 ? (totalIn - totalOut) : -(totalIn - totalOut)}
            trend={totalIn - totalOut > 0 ? 'up' : 'down'}
            changeLabel={`Balance: ${totalIn - totalOut > 0 ? '+' : ''}${totalIn - totalOut}`}
            icon={<TrendingUp className="w-5 h-5" />}
          />
          
          <MetricCard
            title="Cámaras Activas"
            value={liveCountsData?.length || 0}
            change={0}
            trend="neutral"
            changeLabel="Monitoreando 2 avenidas"
            icon={<Camera className="w-5 h-5" />}
          />
        </motion.div>

        {/* Tabla de Datos en Vivo */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">Datos en Vivo</h2>
            <p className="text-sm text-neutral-600">Conteos de tráfico en tiempo real de todas las cámaras</p>
          </div>
          {liveCountsData && liveCountsData.length > 0 && (
            <div className="card overflow-hidden">
              <DataTable
                data={liveCountsData.map((count: LiveCount) => ({
                  ...count,
                  efficiency: (count.total_in || 0) > 0 ? Math.round(((count.total_out || 0) / (count.total_in || 0)) * 100) : 0,
                  timestamp: count.timestamp ? formatMexicoCityTime(count.timestamp) : 'N/A'
                }))}
                columns={[
                  { key: 'camera_id', label: 'Cámara', sortable: true },
                  { key: 'direction', label: 'Dirección', sortable: true },
                  { key: 'total_in', label: 'Entrada', sortable: true },
                  { key: 'total_out', label: 'Salida', sortable: true },
                  { 
                    key: 'efficiency', 
                    label: 'Eficiencia', 
                    sortable: true,
                    render: (value) => (
                      <span className={`font-medium text-sm ${value > 80 ? 'text-success' : value > 50 ? 'text-warning' : 'text-error'}`}>
                        {value}%
                      </span>
                    )
                  },
                  { key: 'timestamp', label: 'Última Actualización', sortable: true },
                ]}
              />
            </div>
          )}
        </motion.div>

        {/* Mapa de Tráfico - Full Width */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card overflow-hidden mb-8"
        >
          <TrafficMap 
            cameras={liveCountsData || []} 
            showHistory={false}
          />
        </motion.div>

        {/* Tráfico por Hora - Full Width with Analysis Link */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6 mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-neutral-900">Tráfico por Hora</h3>
            <Link href="/dashboard/analysis">
              <Button variant="primary" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                Ver Análisis Completo
              </Button>
            </Link>
          </div>
          {hourlyStats && <TrafficChartVisx />}
        </motion.div>

        {/* Snapshots de Cámaras */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <CameraSnapshots cameras={['cam_01', 'cam_02', 'cam_03', 'cam_04']} />
        </motion.div>

        {/* Historial de Snapshots */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <SnapshotHistory />
        </motion.div>

        {/* Mapa de Calor de Tráfico */}
        {hourlyStats && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-neutral-900 mb-6">Mapa de Calor de Tráfico</h3>
            <TrafficHeatmap 
              data={Array.isArray(hourlyStats) ? hourlyStats.map((stat: HourlyStatistic) => {
                // Convert to Mexico City timezone to get correct hour
                const date = new Date(stat.hour || '');
                const mexicoCityHour = new Date(date.toLocaleString('en-US', { timeZone: MEXICO_CITY_TIMEZONE })).getHours();
                return {
                  hour: mexicoCityHour.toString().padStart(2, '0'),
                  location: stat.camera_id || 'Unknown',
                  intensity: stat.count || 0,
                  count: stat.count || 0
                };
              }) : []}
            />
          </motion.div>
        )}

        {/* Información del Footer */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="card p-6"
        >
          <div className="text-center text-sm text-neutral-600">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Clock className="w-4 h-4 text-primary-600" />
              <p>
                Los datos se actualizan automáticamente cada 5 segundos.
              </p>
            </div>
            <p className="text-xs">
              <span className="font-semibold text-neutral-900">Ubicación:</span> 28.712335611426948, -106.10549703573227
            </p>
            <p className="text-xs mt-2">
              <span className="font-semibold text-neutral-900">Cámaras:</span> cam_01 (Principal) • cam_02 (Norte) • cam_03 (Sur) • cam_04 (Este)
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
