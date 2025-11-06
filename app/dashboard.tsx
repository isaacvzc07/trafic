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
import { Activity, TrendingUp, Camera, AlertCircle, Clock, BarChart3, ArrowLeft } from 'lucide-react';
import { LiveCount, HourlyStatistic } from '@/types/api';
import { formatMexicoCityTime, MEXICO_CITY_TIMEZONE } from '@/lib/timezone';

export default function Dashboard() {
  const { liveCounts, isLoading: loadingLive, isError: errorLive } = useLiveCounts(5000);
  const { hourlyStats, isLoading: loadingHourly, isError: errorHourly } = useHourlyStatistics(60000);
  const { summary, isLoading: loadingSummary, isError: errorSummary } = useSummaryStatistics(60000);

  if (errorLive || errorHourly || errorSummary) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full p-6 rounded-xl border border-red-200 bg-red-50">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h2 className="text-red-600 font-bold text-lg">Error loading data</h2>
          </div>
          <p className="text-red-600 text-sm">
            Unable to connect to the API. Please check your connection and try again.
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
            className="w-12 h-12 border-3 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 font-medium">Loading traffic data...</p>
        </div>
      </div>
    );
  }

  // Calculate total traffic across all cameras
  const liveCountsData = liveCounts as LiveCount[] | undefined;
  const totalTraffic = liveCountsData?.reduce((sum: number, count: LiveCount) => sum + count.total_in + count.total_out, 0) || 0;
  const totalIn = liveCountsData?.reduce((sum: number, count: LiveCount) => sum + count.total_in, 0) || 0;
  const totalOut = liveCountsData?.reduce((sum: number, count: LiveCount) => sum + count.total_out, 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Traffic Dashboard</h1>
                <p className="text-sm text-gray-600">Real-time monitoring</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{totalTraffic}</div>
                <div className="text-xs text-gray-600">Vehicles (5 min)</div>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{liveCountsData?.length || 0}</div>
                <div className="text-xs text-gray-600">Active Cameras</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Metrics */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <MetricCard
            title="Total Traffic"
            value={totalTraffic}
            change={12.5}
            trend="up"
            changeLabel="vs. last hour"
            icon={<Activity className="w-5 h-5" />}
            format="number"
          />
          
          <MetricCard
            title="In / Out"
            value={`${totalIn} / ${totalOut}`}
            change={totalIn - totalOut > 0 ? (totalIn - totalOut) : -(totalIn - totalOut)}
            trend={totalIn - totalOut > 0 ? 'up' : 'down'}
            changeLabel={`Balance: ${totalIn - totalOut > 0 ? '+' : ''}${totalIn - totalOut}`}
            icon={<TrendingUp className="w-5 h-5" />}
          />
          
          <MetricCard
            title="Active Cameras"
            value={liveCountsData?.length || 0}
            change={0}
            trend="neutral"
            changeLabel="Monitoring 2 avenues"
            icon={<Camera className="w-5 h-5" />}
          />
        </motion.div>

        {/* Live Data Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Live Data</h2>
            <p className="text-sm text-gray-600">Real-time traffic counts from all cameras</p>
          </div>
          {liveCountsData && liveCountsData.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <DataTable
                data={liveCountsData.map((count: LiveCount) => ({
                  ...count,
                  efficiency: count.total_in > 0 ? Math.round((count.total_out / count.total_in) * 100) : 0,
                  timestamp: formatMexicoCityTime(count.timestamp)
                }))}
                columns={[
                  { key: 'camera_id', label: 'Camera', sortable: true },
                  { key: 'direction', label: 'Direction', sortable: true },
                  { key: 'total_in', label: 'In', sortable: true },
                  { key: 'total_out', label: 'Out', sortable: true },
                  { 
                    key: 'efficiency', 
                    label: 'Efficiency', 
                    sortable: true,
                    render: (value) => (
                      <span className={`font-medium text-sm ${value > 80 ? 'text-green-600' : value > 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {value}%
                      </span>
                    )
                  },
                  { key: 'timestamp', label: 'Last Updated', sortable: true },
                ]}
              />
            </div>
          )}
        </motion.div>

        {/* Charts and Visualizations */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Traffic by Hour</h3>
            {hourlyStats && <TrafficChartVisx data={hourlyStats} />}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
          >
            <TrafficMap 
              cameras={liveCountsData || []} 
              showHistory={true}
            />
          </motion.div>
        </div>

        {/* Traffic Heatmap */}
        {hourlyStats && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Traffic Heatmap</h3>
            <TrafficHeatmap 
              data={Array.isArray(hourlyStats) ? hourlyStats.map((stat: HourlyStatistic) => {
                // Convert to Mexico City timezone to get correct hour
                const date = new Date(stat.hour);
                const mexicoCityHour = new Date(date.toLocaleString('en-US', { timeZone: MEXICO_CITY_TIMEZONE })).getHours();
                return {
                  hour: mexicoCityHour.toString().padStart(2, '0'),
                  location: stat.camera_id,
                  intensity: stat.count,
                  count: stat.count
                };
              }) : []}
            />
          </motion.div>
        )}

        {/* Footer Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
        >
          <div className="text-center text-sm text-gray-600">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Clock className="w-4 h-4 text-blue-600" />
              <p>
                Data updates automatically every 5 seconds.
              </p>
            </div>
            <p className="text-xs">
              <span className="font-semibold text-gray-900">Location:</span> 28.712335611426948, -106.10549703573227
            </p>
            <p className="text-xs mt-2">
              <span className="font-semibold text-gray-900">Cameras:</span> cam_01 (Main) • cam_02 (North) • cam_03 (South) • cam_04 (East)
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
