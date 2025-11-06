'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { HourlyStatistic } from '@/types/api';
import { formatMexicoCityTime } from '@/lib/timezone';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  ArrowLeft, 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Car, 
  Bus, 
  Truck,
  Activity,
  Database,
  Zap,
  Camera,
  BarChart3,
  PieChart as PieChartIcon,
  MapPin,
  Clock
} from 'lucide-react';
import Link from 'next/link';

interface AnalysisData {
  hour: string;
  time: string;
  cars: number;
  buses: number;
  trucks: number;
  total: number;
}

interface TrendData {
  date: string;
  total: number;
  trend: number;
}

interface VehicleDistribution {
  name: string;
  value: number;
  percentage: number;
  [key: string]: any; // Add index signature for ChartDataInput compatibility
}

export default function TrafficAnalysis() {
  const [historyData, setHistoryData] = useState<HourlyStatistic[]>([]);
  const [summaryStats, setSummaryStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [vehicleType, setVehicleType] = useState<'all' | 'car' | 'bus' | 'truck'>('all');

  useEffect(() => {
    fetchHistoryData();
  }, [timeRange]);

  const fetchHistoryData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch data from multiple sources
      const [apiData, supabaseData, liveData, summaryData] = await Promise.allSettled([
        api.getHourlyStatistics(),
        fetch('/api/history/hourly').then(res => res.json()).catch(() => ({ data: [] })),
        api.getLiveCounts(60), // Last hour of live data
        api.getSummary() // Summary statistics
      ]);
      
      console.log('API hourly data:', apiData.status === 'fulfilled' ? apiData.value.length : 'failed');
      console.log('Supabase data:', supabaseData.status === 'fulfilled' ? supabaseData.value?.data?.length || 0 : 'failed');
      console.log('Live data:', liveData.status === 'fulfilled' ? liveData.value.length : 'failed');
      console.log('Summary data:', summaryData.status === 'fulfilled' ? 'success' : 'failed');
      
      // Process API data
      let apiArray: any[] = [];
      if (apiData.status === 'fulfilled') {
        apiArray = Array.isArray(apiData.value) ? apiData.value.map(item => ({...item, source: 'api'})) : [];
      }
      
      // Process Supabase data
      let supabaseArray: any[] = [];
      if (supabaseData.status === 'fulfilled' && supabaseData.value?.data) {
        // Flatten Supabase grouped data
        supabaseArray = supabaseData.value.data.flatMap((hourGroup: any) => 
          hourGroup.data.map((record: any) => ({
            ...record,
            hour: hourGroup.hour,
            source: 'supabase'
          }))
        );
      }
      
      // Process live data into hourly format
      let liveArray: any[] = [];
      if (liveData.status === 'fulfilled' && Array.isArray(liveData.value)) {
        // Convert live counts to hourly format
        const currentHour = new Date().toISOString().slice(0, 13) + ':00:00Z';
        liveArray = liveData.value.map((camera: any) => ({
          hour: currentHour,
          camera_id: camera.camera_id,
          vehicle_type: 'car', // Live data doesn't specify vehicle type, assume car
          direction: 'in',
          count: camera.total_in || 0,
          avg_confidence: 0.8, // Default confidence
          source: 'live'
        })).concat(liveData.value.map((camera: any) => ({
          hour: currentHour,
          camera_id: camera.camera_id,
          vehicle_type: 'car',
          direction: 'out',
          count: camera.total_out || 0,
          avg_confidence: 0.8,
          source: 'live'
        })));
      }
      
      // Combine all datasets
      const combinedData = [...apiArray, ...supabaseArray, ...liveArray];
      console.log('Total combined data length:', combinedData.length);
      
      setHistoryData(combinedData);
      
      // Store summary data if available
      if (summaryData.status === 'fulfilled') {
        setSummaryStats(summaryData.value);
      }
    } catch (err) {
      console.error('Error fetching history data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch history data');
      setHistoryData([]);
    } finally {
      setLoading(false);
    }
  };

  // Process data for charts - improved to handle real API data
  const processedData: AnalysisData[] = historyData.reduce((acc: AnalysisData[], stat) => {
    try {
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
    } catch (err) {
      console.warn('Error processing stat:', stat, err);
    }
    
    return acc;
  }, []);

  console.log('Processed data:', processedData);
  console.log('Processed data length:', processedData.length);

  // Calculate comprehensive statistics
  const totalVehicles = processedData.reduce((sum, entry) => sum + entry.total, 0);
  const avgHourly = processedData.length > 0 ? Math.round(totalVehicles / processedData.length) : 0;
  const peakHour = processedData.reduce((max, entry) => 
    entry.total > max.total ? entry : max, 
    processedData[0] || { total: 0, time: 'N/A' }
  );

  // Vehicle distribution
  const totalCars = processedData.reduce((sum, entry) => sum + Math.abs(entry.cars), 0);
  const totalBuses = processedData.reduce((sum, entry) => sum + Math.abs(entry.buses), 0);
  const totalTrucks = processedData.reduce((sum, entry) => sum + Math.abs(entry.trucks), 0);
  
  const vehicleDistribution: VehicleDistribution[] = [
    { name: 'Cars', value: totalCars, percentage: totalVehicles > 0 ? (totalCars / totalVehicles) * 100 : 0 },
    { name: 'Buses', value: totalBuses, percentage: totalVehicles > 0 ? (totalBuses / totalVehicles) * 100 : 0 },
    { name: 'Trucks', value: totalTrucks, percentage: totalVehicles > 0 ? (totalTrucks / totalVehicles) * 100 : 0 }
  ];

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  // Generate trend data from real data
  const trendData: TrendData[] = processedData.reduce((acc: TrendData[], entry, index) => {
    if (index % Math.ceil(processedData.length / 7) === 0) { // Sample 7 data points
      acc.push({
        date: entry.time,
        total: entry.total,
        trend: acc.length > 0 ? (entry.total > acc[acc.length - 1].total ? 1 : -1) : 1
      });
    }
    return acc;
  }, []);

  // Data source statistics
  const dataSourceStats = {
    apiRecords: historyData.filter(d => d.source === 'api').length,
    supabaseRecords: historyData.filter(d => d.source === 'supabase').length,
    liveRecords: historyData.filter(d => d.source === 'live').length,
    totalRecords: historyData.length,
    uniqueCameras: [...new Set(historyData.map(d => d.camera_id))].length,
    timeRange: {
      start: processedData.length > 0 ? processedData[0].hour : 'N/A',
      end: processedData.length > 0 ? processedData[processedData.length - 1].hour : 'N/A'
    }
  };

  // If no real data, show empty state
  if (processedData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Traffic Analysis</h1>
              <p className="text-gray-600">In-depth traffic patterns and trends</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Activity className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-600">No traffic data available</p>
              <p className="text-sm text-gray-500 mt-2">Please check back later when data is collected</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Traffic Analysis</h1>
              <p className="text-gray-600">In-depth traffic patterns and trends</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Activity className="w-8 h-8 mx-auto mb-2 text-blue-400 animate-pulse" />
              <p className="text-gray-600">Loading traffic analysis...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Traffic Analysis</h1>
              <p className="text-gray-600">In-depth traffic patterns and trends</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Activity className="w-8 h-8 mx-auto mb-2 text-red-400" />
              <p className="text-red-600">Error: {error}</p>
              <Button onClick={fetchHistoryData} className="mt-2" size="sm">
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Traffic Analysis</h1>
              <p className="text-gray-600">In-depth traffic patterns and trends</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Time range selector */}
            <div className="flex bg-white rounded-lg p-1 border border-gray-200">
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
            
            <Button variant="ghost" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Data Sources Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">API Records</p>
                <p className="text-2xl font-bold text-blue-600">{dataSourceStats.apiRecords}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Supabase Records</p>
                <p className="text-2xl font-bold text-green-600">{dataSourceStats.supabaseRecords}</p>
              </div>
              <Database className="w-8 h-8 text-green-600" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Live Records</p>
                <p className="text-2xl font-bold text-orange-600">{dataSourceStats.liveRecords}</p>
              </div>
              <Zap className="w-8 h-8 text-orange-600" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Cameras</p>
                <p className="text-2xl font-bold text-purple-600">{dataSourceStats.uniqueCameras}</p>
              </div>
              <Camera className="w-8 h-8 text-purple-600" />
            </div>
          </Card>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Vehicles</p>
                <p className="text-2xl font-bold text-gray-900">{totalVehicles.toLocaleString()}</p>
              </div>
              <Car className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Hourly</p>
                <p className="text-2xl font-bold text-gray-900">{avgHourly.toLocaleString()}</p>
              </div>
              <Clock className="w-8 h-8 text-green-600" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Peak Hour</p>
                <p className="text-lg font-bold text-gray-900">{peakHour.time}</p>
                <p className="text-sm text-gray-600">{peakHour.total} vehicles</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Data Points</p>
                <p className="text-2xl font-bold text-gray-900">{processedData.length}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </Card>
        </div>

        {/* Traffic by Hour Chart - Full Width */}
        <Card className="p-6 mb-8">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Traffic by Hour</h3>
            <p className="text-gray-600">Detailed hourly traffic patterns for all vehicle types</p>
          </div>
          
          <div className="h-[600px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={800}>
              <LineChart data={processedData} margin={{ top: 40, right: 60, left: 120, bottom: 120 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="time" 
                  stroke="#6b7280"
                  tick={{ fill: '#6b7280', fontSize: 14 }}
                  angle={-45}
                  textAnchor="end"
                  height={120}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="#6b7280"
                  tick={{ fill: '#6b7280', fontSize: 14 }}
                  domain={[0, 'dataMax + 500']}
                  allowDataOverflow={false}
                  label={{
                    value: 'Vehicles',
                    angle: -90,
                    position: 'insideLeft',
                    offset: 40,
                    fill: '#6b7280',
                    style: { fontSize: 16, fontWeight: 'bold' }
                  }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#1f2937',
                    fontSize: '14px'
                  }}
                  labelStyle={{ color: '#1f2937', fontWeight: 'bold' }}
                />
                <Legend 
                  verticalAlign="top"
                  height={50}
                  wrapperStyle={{ paddingBottom: '30px', fontSize: '14px' }}
                  iconSize={20}
                />
                
                {(vehicleType === 'all' || vehicleType === 'car') && (
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#ef4444" 
                    strokeWidth={4}
                    dot={false}
                    name="Total"
                    strokeDasharray="8 4"
                  />
                )}
                
                {(vehicleType === 'all' || vehicleType === 'car') && (
                  <Line 
                    type="monotone" 
                    dataKey="cars" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={false}
                    name="Cars"
                  />
                )}
                
                {(vehicleType === 'all' || vehicleType === 'bus') && (
                  <Line 
                    type="monotone" 
                    dataKey="buses" 
                    stroke="#10b981" 
                    strokeWidth={2.5}
                    dot={false}
                    name="Buses"
                  />
                )}
                
                {(vehicleType === 'all' || vehicleType === 'truck') && (
                  <Line 
                    type="monotone" 
                    dataKey="trucks" 
                    stroke="#f59e0b" 
                    strokeWidth={2.5}
                    dot={false}
                    name="Trucks"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Second Row - Trend Analysis and Vehicle Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Trend Analysis */}
          <Card className="p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">7-Day Trend</h3>
              <p className="text-gray-600">Weekly traffic trends and patterns</p>
            </div>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 20, right: 30, left: 60, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
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
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Vehicle Distribution */}
          <Card className="p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Vehicle Distribution</h3>
              <p className="text-gray-600">Breakdown by vehicle type</p>
            </div>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={vehicleDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: any) => {
                      const { name, percentage } = props;
                      return `${name}: ${typeof percentage === 'number' ? percentage.toFixed(1) : '0'}%`;
                    }}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {vehicleDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      color: '#1f2937'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Peak Hour Analysis */}
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Peak Hour Analysis</h3>
            <p className="text-gray-600">Most congested hours and recommendations</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-red-600" />
                <h4 className="font-semibold text-red-900">Peak Hour</h4>
              </div>
              <p className="text-2xl font-bold text-red-900">{peakHour.time}</p>
              <p className="text-red-700">{peakHour.total} vehicles</p>
              <p className="text-sm text-red-600 mt-2">Consider traffic management during this time</p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <h4 className="font-semibold text-yellow-900">Average</h4>
              </div>
              <p className="text-2xl font-bold text-yellow-900">{avgHourly}</p>
              <p className="text-yellow-700">vehicles per hour</p>
              <p className="text-sm text-yellow-600 mt-2">Normal traffic flow baseline</p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-green-900">Recommendation</h4>
              </div>
              <p className="text-green-900 font-medium">Optimize signal timing</p>
              <p className="text-green-700">during peak hours</p>
              <p className="text-sm text-green-600 mt-2">Could reduce congestion by 15-20%</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
