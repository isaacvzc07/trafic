'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { HourlyStatistic } from '@/types/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatMexicoCityTime, formatMexicoCityDateTime, getMexicoCityTime } from '@/lib/timezone';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Car, 
  Bus, 
  Truck,
  ChevronDown,
  ChevronUp,
  Activity
} from 'lucide-react';

interface TrafficHistoryProps {
  cameraId?: string;
  className?: string;
}

interface HistoryData {
  hour: string;
  time: string;
  cars: number;
  buses: number;
  trucks: number;
  total: number;
}

export default function TrafficHistoryExpanded({ cameraId, className }: TrafficHistoryProps) {
  const [historyData, setHistoryData] = useState<HourlyStatistic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [vehicleType, setVehicleType] = useState<'all' | 'car' | 'bus' | 'truck'>('all');
  const [isChartExpanded, setIsChartExpanded] = useState(false);
  const [isStatsExpanded, setIsStatsExpanded] = useState(true);

  useEffect(() => {
    fetchHistoryData();
  }, [timeRange]);

  const fetchHistoryData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getHourlyStatistics();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received');
      }
      
      setHistoryData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch history data');
      setHistoryData([]);
    } finally {
      setLoading(false);
    }
  };

  // Process data for charts
  const processedData: HistoryData[] = historyData.reduce((acc: HistoryData[], stat) => {
    const hour = new Date(stat.hour);
    const timeKey = formatMexicoCityTime(hour, { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    const existingEntry = acc.find(entry => entry.time === timeKey);
    
    if (existingEntry) {
      if (stat.vehicle_type === 'car') {
        existingEntry.cars += stat.direction === 'in' ? stat.count : -stat.count;
      } else if (stat.vehicle_type === 'bus') {
        existingEntry.buses += stat.direction === 'in' ? stat.count : -stat.count;
      } else if (stat.vehicle_type === 'truck') {
        existingEntry.trucks += stat.direction === 'in' ? stat.count : -stat.count;
      }
      existingEntry.total = Math.abs(existingEntry.cars) + Math.abs(existingEntry.buses) + Math.abs(existingEntry.trucks);
    } else {
      const cars = stat.vehicle_type === 'car' ? (stat.direction === 'in' ? stat.count : -stat.count) : 0;
      const buses = stat.vehicle_type === 'bus' ? (stat.direction === 'in' ? stat.count : -stat.count) : 0;
      const trucks = stat.vehicle_type === 'truck' ? (stat.direction === 'in' ? stat.count : -stat.count) : 0;
      
      acc.push({
        hour: stat.hour,
        time: timeKey,
        cars,
        buses,
        trucks,
        total: Math.abs(cars) + Math.abs(buses) + Math.abs(trucks)
      });
    }
    
    return acc;
  }, []);

  // Calculate statistics
  const totalVehicles = processedData.reduce((sum, entry) => sum + entry.total, 0);
  const avgHourly = processedData.length > 0 ? Math.round(totalVehicles / processedData.length) : 0;
  const peakHour = processedData.reduce((max, entry) => 
    entry.total > max.total ? entry : max, 
    processedData[0] || { total: 0, time: 'N/A' }
  );

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="w-8 h-8 mx-auto mb-2 text-blue-400 animate-pulse" />
            <p className="text-gray-600">Loading traffic history...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="w-8 h-8 mx-auto mb-2 text-red-400" />
            <p className="text-red-600">Error: {error}</p>
            <Button onClick={fetchHistoryData} className="mt-2" size="sm">
              Retry
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Traffic History
            {cameraId && <Badge variant="blue">{cameraId}</Badge>}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Historical traffic data and trends
          </p>
        </div>
        
        <div className="flex gap-2">
          {/* Time range selector */}
          <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
            {(['24h', '7d', '30d'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="text-xs"
              >
                {range}
              </Button>
            ))}
          </div>
          
          {/* Vehicle type selector */}
          <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
            {(['all', 'car', 'bus', 'truck'] as const).map((type) => (
              <Button
                key={type}
                variant={vehicleType === type ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setVehicleType(type)}
                className="text-xs capitalize"
              >
                {type}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Statistics Cards - Collapsible */}
      <div className="mb-6">
        <div 
          className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 rounded-lg border border-gray-200"
          onClick={() => setIsStatsExpanded(!isStatsExpanded)}
        >
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            Statistics Overview
          </h4>
          <Button variant="ghost" size="sm">
            {isStatsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
        
        {isStatsExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Vehicles</p>
                  <p className="text-2xl font-bold text-gray-900">{totalVehicles.toLocaleString()}</p>
                </div>
                <Car className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Hourly</p>
                  <p className="text-2xl font-bold text-gray-900">{avgHourly.toLocaleString()}</p>
                </div>
                <Clock className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Peak Hour</p>
                  <p className="text-lg font-bold text-gray-900">{peakHour.time}</p>
                  <p className="text-sm text-gray-600">{peakHour.total} vehicles</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Traffic Chart - Expandable */}
      <div className="mb-6">
        <div 
          className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 rounded-lg border border-gray-200 mb-4"
          onClick={() => setIsChartExpanded(!isChartExpanded)}
        >
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Traffic by Hour - {isChartExpanded ? 'Expanded View' : 'Compact View'}
          </h4>
          <Button variant="ghost" size="sm">
            {isChartExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
        
        <div className={`${isChartExpanded ? 'h-[600px] min-h-[400px]' : 'h-96 min-h-[300px]'} transition-all duration-300 bg-white border border-gray-200 rounded-lg p-4 w-full`}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={undefined}>
            <LineChart data={processedData} margin={{ top: 20, right: 30, left: 100, bottom: 100 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="time" 
                stroke="#6b7280"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis 
                stroke="#6b7280"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                domain={[0, 'dataMax + 500']}
                allowDataOverflow={false}
                label={{
                  value: 'Vehicles',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 20,
                  fill: '#6b7280',
                  style: { fontSize: 14 }
                }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: '#1f2937'
                }}
                labelStyle={{ color: '#1f2937' }}
                cursor={{ crosshair: true }}
              />
              <Legend 
                verticalAlign="top"
                height={36}
                wrapperStyle={{ paddingBottom: '20px' }}
              />
              
              {(vehicleType === 'all' || vehicleType === 'car') && (
                <Line 
                  type="monotone" 
                  dataKey="cars" 
                  stroke="#3b82f6" 
                  strokeWidth={2.5}
                  dot={false}
                  name="Cars"
                />
              )}
              
              {(vehicleType === 'all' || vehicleType === 'bus') && (
                <Line 
                  type="monotone" 
                  dataKey="buses" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={false}
                  name="Buses"
                />
              )}
              
              {(vehicleType === 'all' || vehicleType === 'truck') && (
                <Line 
                  type="monotone" 
                  dataKey="trucks" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  dot={false}
                  name="Trucks"
                />
              )}
              
              {(vehicleType === 'all') && (
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  dot={false}
                  name="Total"
                  strokeDasharray="5 5"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vehicle type distribution */}
      <div className="h-48 min-h-[192px] bg-white border border-gray-200 rounded-lg p-4 w-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={undefined}>
          <BarChart data={processedData.slice(-12)} margin={{ top: 20, right: 30, left: 80, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="time" 
              stroke="#6b7280"
              tick={{ fill: '#6b7280', fontSize: 10 }}
            />
            <YAxis 
              stroke="#6b7280"
              tick={{ fill: '#6b7280', fontSize: 10 }}
              domain={[0, 'dataMax + 100']}
              allowDataOverflow={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#ffffff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                color: '#1f2937'
              }}
              labelStyle={{ color: '#1f2937' }}
            />
            <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        <Activity className="w-3 h-3 inline mr-1 text-blue-400" />
        Last updated: {formatMexicoCityTime(getMexicoCityTime())}
      </div>
    </Card>
  );
}
