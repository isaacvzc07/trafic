'use client';

import { motion } from 'framer-motion';
import { useLiveCounts, useHourlyStatistics, useSummaryStatistics } from '@/hooks/useTrafficDataQuery';
import { Card } from '@/components/ui/Card';
import { MetricCard } from '@/components/MetricCard';
import { DataTable } from '@/components/DataTable';
import { TrafficHeatmap } from '@/components/TrafficHeatmap';
import TrafficChartVisx from '@/components/TrafficChartVisx';
import TrafficMap from '@/components/TrafficMap';
import { Activity, TrendingUp, Camera, Car, AlertCircle, Clock } from 'lucide-react';

export default function Dashboard() {
  const { liveCounts, isLoading: loadingLive, isError: errorLive } = useLiveCounts(5000);
  const { hourlyStats, isLoading: loadingHourly, isError: errorHourly } = useHourlyStatistics(60000);
  const { summary, isLoading: loadingSummary, isError: errorSummary } = useSummaryStatistics(60000);

  if (errorLive || errorHourly || errorSummary) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md border-red-600">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <h2 className="text-red-400 font-bold text-lg">Error al cargar datos</h2>
          </div>
          <p className="text-slate-300">
            No se pudo conectar con la API. Por favor verifica tu conexión e intenta de nuevo.
          </p>
        </Card>
      </div>
    );
  }

  const isLoading = loadingLive || loadingHourly || loadingSummary;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-slate-300 font-medium">Cargando datos de tráfico...</p>
        </div>
      </div>
    );
  }

  // Calculate total traffic across all cameras
  const totalTraffic = liveCounts?.reduce((sum, count) => sum + count.total_in + count.total_out, 0) || 0;
  const totalIn = liveCounts?.reduce((sum, count) => sum + count.total_in, 0) || 0;
  const totalOut = liveCounts?.reduce((sum, count) => sum + count.total_out, 0) || 0;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-3xl font-bold text-white mb-2"
              >
                Dashboard de Tráfico
              </motion.h1>
              <p className="text-slate-400">Monitoreo en tiempo real - api.trafic.mx</p>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-blue-400">{totalTraffic}</div>
                <div className="text-sm text-slate-400">Vehículos (5 min)</div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-green-400">{liveCounts?.length || 0}</div>
                <div className="text-sm text-slate-400">Cámaras Activas</div>
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <MetricCard
            title="Tráfico Total"
            value={totalTraffic}
            change={12.5}
            trend="up"
            changeLabel="vs. hora anterior"
            icon={<Activity className="w-6 h-6" />}
            format="number"
          />
          
          <MetricCard
            title="Entrada / Salida"
            value={`${totalIn} / ${totalOut}`}
            change={totalIn - totalOut > 0 ? (totalIn - totalOut) : -(totalIn - totalOut)}
            trend={totalIn - totalOut > 0 ? 'up' : 'down'}
            changeLabel={`Balance: ${totalIn - totalOut > 0 ? '+' : ''}${totalIn - totalOut}`}
            icon={<TrendingUp className="w-6 h-6" />}
          />
          
          <MetricCard
            title="Cámaras Activas"
            value={liveCounts?.length || 0}
            change={0}
            trend="neutral"
            changeLabel="Monitoreando 2 avenidas"
            icon={<Camera className="w-6 h-6" />}
          />
        </motion.div>

        {/* Live Data Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Datos en Tiempo Real</h2>
          {liveCounts && (
            <DataTable
              data={liveCounts.map(count => ({
                ...count,
                efficiency: count.total_in > 0 ? Math.round((count.total_out / count.total_in) * 100) : 0,
                timestamp: new Date(count.timestamp).toLocaleTimeString('es-MX')
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
                    <span className={`font-medium ${value > 80 ? 'text-green-400' : value > 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {value}%
                    </span>
                  )
                },
                { key: 'timestamp', label: 'Última Actualización', sortable: true },
              ]}
            />
          )}
        </motion.div>

        {/* Charts and Visualizations */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <h3 className="text-xl font-semibold text-white mb-4">Tráfico por Hora</h3>
              {hourlyStats && <TrafficChartVisx data={hourlyStats} />}
            </Card>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <h3 className="text-xl font-semibold text-white mb-4">Mapa de Tráfico</h3>
              {liveCounts && <TrafficMap cameras={liveCounts} />}
            </Card>
          </motion.div>
        </div>

        {/* Traffic Heatmap */}
        {hourlyStats && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <TrafficHeatmap 
              data={hourlyStats.map(stat => ({
                hour: new Date(stat.hour).getHours().toString(),
                location: stat.camera_id,
                intensity: stat.total_in + stat.total_out,
                count: stat.total_in + stat.total_out
              }))}
            />
          </motion.div>
        )}

        {/* Footer Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <div className="text-center text-sm text-slate-400">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <p>
                  Los datos se actualizan automáticamente cada 5 segundos.
                </p>
              </div>
              <p>
                <span className="font-semibold text-slate-300">Ubicaciones:</span> Av. Homero (Oeste-Este, Este-Oeste) • Av. Industrias (Norte-Sur, Sur-Norte)
              </p>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
