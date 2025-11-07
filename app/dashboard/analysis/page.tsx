'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatMexicoCityTime, getMexicoCityTime, toMexicoCityTime, getMexicoCityHourKey } from '@/lib/timezone';
import {
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
  Cell,
  BarChart,
  Bar
} from 'recharts';
import {
  ArrowLeft,
  Download,
  TrendingUp,
  Activity,
  AlertTriangle,
  Brain,
  Target,
  Globe
} from 'lucide-react';
import Link from 'next/link';
import { AITrafficInsights } from '@/components/AITrafficInsights';
import { TrafficChat } from '@/components/TrafficChat';
import { AICostSavings } from '@/components/AICostSavings';

interface AnalysisData {
  hour: string;
  time: string;
  cars: number;
  buses: number;
  trucks: number;
  total: number;
  hour_of_day: number;
  day_of_week: string;
  is_weekend: boolean;
  peak_hour: boolean;
  traffic_level: 'BAJO' | 'MEDIO' | 'ALTO' | 'CRÍTICO';
}

interface CameraInsights {
  camera_id: string;
  total_vehicles: number;
  peak_hour: string;
  peak_count: number;
  avg_hourly: number;
  efficiency: number;
  congestion_level: 'FLUIDO' | 'MODERADO' | 'CONGESTIONADO' | 'CRÍTICO';
  dominant_direction: 'in' | 'out';
  flow_ratio: number;
}

interface TrafficPattern {
  hour: string;
  inbound: number;
  outbound: number;
  net_flow: number;
  flow_pattern: 'SALIDA' | 'ENTRADA' | 'EQUILIBRADO';
  congestion_index: number;
}

const COLORS = {
  cars: '#3b82f6',
  buses: '#10b981', 
  trucks: '#f59e0b',
  total: '#ef4444',
  inbound: '#8b5cf6',
  outbound: '#ec4899',
  net: '#06b6d4'
};

const TRAFFIC_LEVELS = {
  BAJO: { color: '#10b981', threshold: 500 },
  MEDIO: { color: '#f59e0b', threshold: 1000 },
  ALTO: { color: '#ef4444', threshold: 1500 },
  CRÍTICO: { color: '#991b1b', threshold: 9999 }
};

export default function AnalysisPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData[]>([]);
  const [cameraInsights, setCameraInsights] = useState<CameraInsights[]>([]);
  const [trafficPatterns, setTrafficPatterns] = useState<TrafficPattern[]>([]);
  const [timeRange, setTimeRange] = useState<'6h' | '12h' | '24h' | '48h'>('24h');

  // Fetch real data from API
  const fetchAnalysisData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Obteniendo datos reales de API para análisis gubernamental...');
      
      const [hourlyResponse, liveResponse, summaryResponse] = await Promise.allSettled([
        fetch('https://api.trafic.mx/api/v1/statistics/hourly'),
        fetch('https://api.trafic.mx/api/v1/live/counts'),
        fetch('https://api.trafic.mx/api/v1/statistics/summary')
      ]);
      
      let hourlyData: Record<string, unknown>[] = [];
      let liveData: Record<string, unknown>[] = [];
      let summaryData: Record<string, unknown> = {};
      
      if (hourlyResponse.status === 'fulfilled') {
        const result = await hourlyResponse.value.json();
        console.log('🔍 Hourly API Response:', result);
        console.log('🔍 Hourly API Response type:', typeof result);
        console.log('🔍 Hourly API Response isArray:', Array.isArray(result));
        
        if (result && result.data) {
          console.log('🔍 Hourly API Response.data:', result.data);
          console.log('🔍 Hourly API Response.data type:', typeof result.data);
          console.log('🔍 Hourly API Response.data isArray:', Array.isArray(result.data));
        }
        
        hourlyData = Array.isArray(result) ? result : (result.data || []);
        console.log(`✅ Datos horarios: ${hourlyData.length} registros`);
        console.log('🔍 First hourly record:', hourlyData[0]);
      } else {
        console.error('❌ Error en datos horarios:', hourlyResponse.reason);
      }
      
      if (liveResponse.status === 'fulfilled') {
        const result = await liveResponse.value.json();
        console.log('🔍 Live API Response:', result);
        liveData = Array.isArray(result) ? result : [];
        console.log(`✅ Datos en vivo: ${liveData.length} registros`);
      } else {
        console.error('❌ Error en datos en vivo:', liveResponse.reason);
      }
      
      if (summaryResponse.status === 'fulfilled') {
        const result = await summaryResponse.value.json();
        console.log('🔍 Summary API Response:', result);
        summaryData = result;
        console.log('✅ Datos de resumen obtenidos');
      } else {
        console.error('❌ Error en resumen:', summaryResponse.reason);
      }
      
      // Process data
      const processedAnalysisData = processAnalysisData(hourlyData);
      const processedCameraInsights = generateCameraInsights(hourlyData);
      const processedTrafficPatterns = analyzeTrafficPatterns(hourlyData);
      
      console.log('🔍 FINAL PROCESSED DATA:');
      console.log('Analysis data length:', processedAnalysisData.length);
      console.log('Camera insights length:', processedCameraInsights.length);
      console.log('Traffic patterns length:', processedTrafficPatterns.length);
      
      setAnalysisData(processedAnalysisData);
      setCameraInsights(processedCameraInsights);
      setTrafficPatterns(processedTrafficPatterns);
      
    } catch (err) {
      console.error('❌ Error general al obtener datos de análisis:', err);
      setError(err instanceof Error ? err.message : 'Error al obtener datos de análisis');
    } finally {
      setLoading(false);
    }
  };

  // Fetch snapshots data
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [loadingSnapshots, setLoadingSnapshots] = useState(false);

  const fetchSnapshots = async () => {
    try {
      setLoadingSnapshots(true);
      const response = await fetch('/api/snapshots?limit=20');
      const data = await response.json();
      
      if (data.success) {
        setSnapshots(data.data || []);
        console.log('✅ Snapshots loaded:', data.count);
      } else {
        console.error('❌ Error loading snapshots:', data.error);
      }
    } catch (error) {
      console.error('❌ Error fetching snapshots:', error);
    } finally {
      setLoadingSnapshots(false);
    }
  };

  // Load snapshots on component mount
  useEffect(() => {
    fetchSnapshots();
  }, []);

  // Process raw data into analysis-ready format
  const processAnalysisData = (rawData: Record<string, unknown>[]): AnalysisData[] => {
    const hourlyMap = new Map<string, AnalysisData>();
    
    console.log('🔍 TIMEZONE DEBUG: processAnalysisData');
    console.log('Raw data sample:', rawData.slice(0, 2));
    console.log('Current Mexico City Time:', getMexicoCityTime());
    
    rawData.forEach(record => {
      const utcHour = record.hour as string;
      const mexicoCityTime = toMexicoCityTime(utcHour);
      const mexicoCityHourKey = getMexicoCityHourKey(utcHour);
      const hourOfDay = mexicoCityTime.getHours();
      const dayOfWeek = formatMexicoCityTime(mexicoCityTime, { weekday: 'long' });
      const isWeekend = [0, 6].includes(mexicoCityTime.getDay());
      
      // Debug first few records
      if (hourlyMap.size < 3) {
        console.log(`Record ${hourlyMap.size + 1}:`, {
          utcHour,
          mexicoCityTime: mexicoCityTime.toISOString(),
          mexicoCityHourKey,
          formattedTime: formatMexicoCityTime(mexicoCityTime, { hour: '2-digit', minute: '2-digit' })
        });
      }
      
      if (!hourlyMap.has(mexicoCityHourKey)) {
        // Use direct time formatting instead of locale-dependent formatting
        const hours = mexicoCityTime.getHours().toString().padStart(2, '0');
        const minutes = mexicoCityTime.getMinutes().toString().padStart(2, '0');
        const formattedTime = `${hours}:${minutes}`;
        
        console.log(`🕐 TIME FORMATTING DEBUG for ${mexicoCityHourKey}:`, {
          originalHour: utcHour,
          mexicoCityTime: mexicoCityTime.toISOString(),
          hours: mexicoCityTime.getHours(),
          minutes: mexicoCityTime.getMinutes(),
          formattedTime,
          total: 0
        });
        
        hourlyMap.set(mexicoCityHourKey, {
          hour: mexicoCityHourKey,
          time: formattedTime,
          cars: 0,
          buses: 0,
          trucks: 0,
          total: 0,
          hour_of_day: hourOfDay,
          day_of_week: dayOfWeek.toUpperCase(),
          is_weekend: isWeekend,
          peak_hour: false,
          traffic_level: 'BAJO'
        });
      }
      
      const data = hourlyMap.get(mexicoCityHourKey)!;
      const count = Number(record.count) || 0;
      const vehicleType = record.vehicle_type as string;
      
      if (vehicleType === 'car') data.cars += count;
      else if (vehicleType === 'bus') data.buses += count;
      else if (vehicleType === 'truck') data.trucks += count;
      
      data.total = data.cars + data.buses + data.trucks;
      
      // Determine traffic level
      if (data.total >= TRAFFIC_LEVELS.CRÍTICO.threshold) data.traffic_level = 'CRÍTICO';
      else if (data.total >= TRAFFIC_LEVELS.ALTO.threshold) data.traffic_level = 'ALTO';
      else if (data.total >= TRAFFIC_LEVELS.MEDIO.threshold) data.traffic_level = 'MEDIO';
      else data.traffic_level = 'BAJO';
    });
    
    // Mark peak hours
    const totals = Array.from(hourlyMap.values()).map(d => d.total);
    const avgTotal = totals.reduce((a, b) => a + b, 0) / totals.length;
    const threshold = avgTotal * 1.5;
    
    hourlyMap.forEach(data => {
      data.peak_hour = data.total >= threshold;
    });
    
    const result = Array.from(hourlyMap.values()).sort((a, b) => 
      new Date(a.hour).getTime() - new Date(b.hour).getTime()
    );
    
    console.log('Processed data sample:', result.slice(0, 3));
    console.log('Latest processed hour:', result[result.length - 1]);
    
    return result;
  };

  // Generate camera-specific insights
  const generateCameraInsights = (rawData: Record<string, unknown>[]): CameraInsights[] => {
    const cameraMap = new Map<string, Record<string, unknown>[]>();
    
    // Group by camera
    rawData.forEach(record => {
      const cameraId = record.camera_id as string;
      if (!cameraMap.has(cameraId)) {
        cameraMap.set(cameraId, []);
      }
      cameraMap.get(cameraId)!.push(record);
    });
    
    const insights: CameraInsights[] = [];
    
    cameraMap.forEach((records, cameraId) => {
      const hourlyTotals = new Map<string, number>();
      const utcHourToMexicoCityHour = new Map<string, string>();
      let totalVehicles = 0;
      let inboundTotal = 0;
      let outboundTotal = 0;
      
      records.forEach(record => {
        const utcHour = record.hour as string;
        const mexicoCityHourKey = getMexicoCityHourKey(utcHour);
        const count = Number(record.count) || 0;
        
        // Store mapping from UTC hour to Mexico City hour for later lookup
        utcHourToMexicoCityHour.set(utcHour, mexicoCityHourKey);
        
        if (!hourlyTotals.has(mexicoCityHourKey)) {
          hourlyTotals.set(mexicoCityHourKey, 0);
        }
        hourlyTotals.set(mexicoCityHourKey, hourlyTotals.get(mexicoCityHourKey)! + count);
        
        totalVehicles += count;
        if (record.direction === 'in') inboundTotal += count;
        else outboundTotal += count;
      });
      
      // Find peak hour (using Mexico City hour keys)
      let peakHourMexicoCityKey = '';
      let peakCount = 0;
      hourlyTotals.forEach((count, hour) => {
        if (count > peakCount) {
          peakCount = count;
          peakHourMexicoCityKey = hour;
        }
      });
      
      // Find the original UTC hour that corresponds to the peak Mexico City hour
      let originalUtcPeakHour = '';
      utcHourToMexicoCityHour.forEach((mexicoCityHour, utcHour) => {
        if (mexicoCityHour === peakHourMexicoCityKey) {
          originalUtcPeakHour = utcHour;
        }
      });
      
      console.log(`🔍 Camera ${cameraId} hourly totals:`, Object.fromEntries(hourlyTotals));
      console.log(`🔍 Camera ${cameraId} peak hour found:`, { 
        peakHourMexicoCityKey, 
        originalUtcPeakHour,
        peakCount 
      });
      
      const avgHourly = totalVehicles / hourlyTotals.size;
      const flowRatio = inboundTotal / (outboundTotal || 1);
      const dominantDirection = inboundTotal > outboundTotal ? 'in' : 'out';
      
      // Calculate efficiency (inverse of peak-to-average ratio)
      const efficiency = Math.min(100, (avgHourly / (peakCount || 1)) * 100);
      
      // Determine congestion level
      let congestionLevel: CameraInsights['congestion_level'] = 'FLUIDO';
      if (peakCount >= 2000) congestionLevel = 'CRÍTICO';
      else if (peakCount >= 1500) congestionLevel = 'CONGESTIONADO';
      else if (peakCount >= 1000) congestionLevel = 'MODERADO';
      
      // Format peak hour properly using the original UTC hour
      let formattedPeakHour = 'N/A';
      if (originalUtcPeakHour) {
        try {
          const peakHourDate = toMexicoCityTime(originalUtcPeakHour);
          formattedPeakHour = formatMexicoCityTime(peakHourDate, { hour: '2-digit', minute: '2-digit' });
        } catch (error) {
          console.error(`Error formatting peak hour for camera ${cameraId}:`, error);
          formattedPeakHour = 'Error';
        }
      }
      
      console.log(`🔍 Camera ${cameraId} insights:`, {
        peakHourMexicoCityKey,
        originalUtcPeakHour,
        formattedPeakHour,
        peakCount,
        hourlyTotalsSize: hourlyTotals.size,
        avgHourly: Math.round(avgHourly),
        efficiency: Math.round(efficiency)
      });
      
      insights.push({
        camera_id: cameraId,
        total_vehicles: totalVehicles,
        peak_hour: formattedPeakHour,
        peak_count: peakCount,
        avg_hourly: Math.round(avgHourly),
        efficiency: Math.round(efficiency),
        congestion_level: congestionLevel,
        dominant_direction: dominantDirection,
        flow_ratio: Math.round(flowRatio * 100) / 100
      });
    });
    
    return insights.sort((a, b) => b.total_vehicles - a.total_vehicles);
  };

  // Analyze traffic patterns
  const analyzeTrafficPatterns = (rawData: Record<string, unknown>[]): TrafficPattern[] => {
    const patternMap = new Map<string, TrafficPattern>();
    
    rawData.forEach(record => {
      const utcHour = record.hour as string;
      const mexicoCityHourKey = getMexicoCityHourKey(utcHour);
      
      if (!patternMap.has(mexicoCityHourKey)) {
        patternMap.set(mexicoCityHourKey, {
          hour: mexicoCityHourKey,
          inbound: 0,
          outbound: 0,
          net_flow: 0,
          flow_pattern: 'EQUILIBRADO',
          congestion_index: 0
        });
      }
      
      const pattern = patternMap.get(mexicoCityHourKey)!;
      const count = Number(record.count) || 0;
      
      if (record.direction === 'in') pattern.inbound += count;
      else pattern.outbound += count;
    });
    
    // Calculate patterns
    patternMap.forEach(pattern => {
      pattern.net_flow = pattern.inbound - pattern.outbound;
      
      if (pattern.net_flow > 100) pattern.flow_pattern = 'ENTRADA';
      else if (pattern.net_flow < -100) pattern.flow_pattern = 'SALIDA';
      else pattern.flow_pattern = 'EQUILIBRADO';
      
      pattern.congestion_index = (pattern.inbound + pattern.outbound) / 2;
    });
    
    return Array.from(patternMap.values()).sort((a, b) => 
      new Date(a.hour).getTime() - new Date(b.hour).getTime()
    );
  };

  useEffect(() => {
    fetchAnalysisData();
  }, [timeRange]);

  // Filter data based on time range
  const hoursMap = { '6h': 6, '12h': 12, '24h': 24, '48h': 48 };
  
  const getFilteredData = () => {
    const now = getMexicoCityTime(); // Use Mexico City time
    const cutoffHours = hoursMap[timeRange];
    const cutoffTime = new Date(now.getTime() - cutoffHours * 60 * 60 * 1000);
    
    console.log('🔍 FILTER DEBUG: getFilteredData');
    console.log('Current Mexico City Time:', now.toISOString());
    console.log('Time range:', timeRange, 'Cutoff hours:', cutoffHours);
    console.log('Cutoff time:', cutoffTime.toISOString());
    
    const filtered = analysisData.filter(d => new Date(d.hour) >= cutoffTime);
    
    console.log('Total analysis data:', analysisData.length);
    console.log('Filtered data count:', filtered.length);
    console.log('Filtered data sample:', filtered.slice(0, 3));
    console.log('Latest filtered hour:', filtered[filtered.length - 1]);
    
    return filtered;
  };

  const filteredData = getFilteredData();

  // Calculate summary statistics
  const totalVehicles = analysisData.reduce((sum, d) => sum + d.total, 0);
  const avgHourly = analysisData.length > 0 ? Math.round(totalVehicles / analysisData.length) : 0;
  const criticalHours = analysisData.filter(d => d.traffic_level === 'CRÍTICO').length;
  
  // Calculate peak hour from FILTERED data (not full analysis data)
  const peakHourData = filteredData.length > 0 
    ? filteredData.reduce((max, d) => d.total > max.total ? d : max, filteredData[0])
    : { total: 0, time: '00:00' };
  
  // Vehicle distribution
  const totalCars = analysisData.reduce((sum, d) => sum + d.cars, 0);
  const totalBuses = analysisData.reduce((sum, d) => sum + d.buses, 0);
  const totalTrucks = analysisData.reduce((sum, d) => sum + d.trucks, 0);
  
  const vehicleDistribution = [
    { name: 'AUTOS', value: totalCars, percentage: Math.round((totalCars / totalVehicles) * 100) },
    { name: 'AUTOBUSES', value: totalBuses, percentage: Math.round((totalBuses / totalVehicles) * 100) },
    { name: 'CAMIONES', value: totalTrucks, percentage: Math.round((totalTrucks / totalVehicles) * 100) }
  ];
  const filteredPatterns = trafficPatterns.filter(p => {
    const now = getMexicoCityTime();
    const cutoffTime = new Date(now.getTime() - (hoursMap[timeRange] * 60 * 60 * 1000));
    return new Date(p.hour) >= cutoffTime;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando análisis de tráfico...</p>
            <Brain className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-pulse" />
            <p className="text-xl text-gray-700 font-semibold">Procesando datos de tráfico...</p>
            <p className="text-gray-500 mt-2">Analizando patrones para la toma de decisiones</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Análisis de Tráfico Urbano</h1>
              <p className="text-gray-600">Sistema Inteligente de Monitoreo Vial</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <p className="text-xl text-red-600 font-semibold">Error en el Sistema</p>
              <p className="text-gray-500 mt-2">{error}</p>
              <Button onClick={fetchAnalysisData} className="mt-4">
                <Activity className="w-4 h-4 mr-2" />
                Reintentar Análisis
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Análisis de Tráfico Urbano</h1>
              <p className="text-gray-600">Sistema Inteligente de Monitoreo Vial para Toma de Decisiones</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Time Range Selector */}
            <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
              {[
                { key: '6h', label: '6H', hours: 6 },
                { key: '12h', label: '12H', hours: 12 },
                { key: '24h', label: '24H', hours: 24 },
                { key: '48h', label: '48H', hours: 48 }
              ].map((range) => (
                <button
                  key={range.key}
                  onClick={() => setTimeRange(range.key as '6h' | '12h' | '24h' | '48h')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    timeRange === range.key
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border">
              <Globe className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">
                {formatMexicoCityTime(new Date(), { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }).toUpperCase()}
              </span>
            </div>
            
            <Button variant="ghost" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar Informe
            </Button>
          </div>
        </div>

        {/* Key Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">VOLUMEN TOTAL</p>
                <p className="text-3xl font-bold">{totalVehicles.toLocaleString()}</p>
                <p className="text-blue-100 text-xs mt-1">Vehículos monitoreados</p>
              </div>
              <Activity className="w-10 h-10 text-blue-200" />
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">PROMEDIO HORARIO</p>
                <p className="text-3xl font-bold">{avgHourly.toLocaleString()}</p>
                <p className="text-green-100 text-xs mt-1">Vehículos por hora</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-200" />
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">HORA PICO</p>
                <p className="text-3xl font-bold">{peakHourData.time}</p>
                <p className="text-orange-100 text-xs mt-1">{peakHourData.total.toLocaleString()} vehículos</p>
                <p className="text-orange-200 text-xs mt-2">
                  DEBUG: Filtered: {filteredData.length} | Raw: {analysisData.length}
                </p>
              </div>
              <Target className="w-10 h-10 text-orange-200" />
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-red-500 to-red-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">HORAS CRÍTICAS</p>
                <p className="text-3xl font-bold">{criticalHours}</p>
                <p className="text-red-100 text-xs mt-1">Requieren atención</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-red-200" />
            </div>
          </Card>
        </div>

        {/* Main Analysis Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Traffic Flow Analysis */}
          <div className="lg:col-span-2">
            <Card className="p-6 h-full">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Análisis de Flujo Vehicular</h3>
                <p className="text-gray-600">Patrones de tráfico por tipo de vehículo y hora del día</p>
              </div>
              
              <div className="h-[500px] w-full min-h-[400px] min-w-[300px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={400}>
                  <AreaChart data={filteredData} margin={{ top: 40, right: 30, left: 60, bottom: 80 }}>
                    <defs>
                      <linearGradient id="colorCars" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.cars} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={COLORS.cars} stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorBuses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.buses} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={COLORS.buses} stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorTrucks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.trucks} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={COLORS.trucks} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="hour" 
                      stroke="#6b7280"
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={Math.floor(filteredData.length / 8) || 0}
                      tickFormatter={(hour) => formatMexicoCityTime(toMexicoCityTime(hour), { hour: '2-digit', minute: '2-digit' })}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      label={{
                        value: 'VÉHICULOS',
                        angle: -90,
                        position: 'insideLeft',
                        offset: 40,
                        fill: '#6b7280',
                        style: { fontSize: 14, fontWeight: 'bold' }
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
                      labelFormatter={(hour) => `Hora: ${formatMexicoCityTime(toMexicoCityTime(hour), { hour: '2-digit', minute: '2-digit' })}`}
                    />
                    <Legend 
                      verticalAlign="top"
                      height={50}
                      wrapperStyle={{ paddingBottom: '20px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="cars" 
                      stroke={COLORS.cars} 
                      fillOpacity={1} 
                      fill="url(#colorCars)"
                      strokeWidth={2}
                      name="AUTOS"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="buses" 
                      stroke={COLORS.buses} 
                      fillOpacity={1} 
                      fill="url(#colorBuses)"
                      strokeWidth={2}
                      name="AUTOBUSES"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="trucks" 
                      stroke={COLORS.trucks} 
                      fillOpacity={1} 
                      fill="url(#colorTrucks)"
                      strokeWidth={2}
                      name="CAMIONES"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Vehicle Distribution */}
          <div>
            <Card className="p-6 h-full">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Distribución Vehicular</h3>
                <p className="text-gray-600">Composición del tráfico total</p>
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={vehicleDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill={COLORS.cars} />
                      <Cell fill={COLORS.buses} />
                      <Cell fill={COLORS.trucks} />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-6 space-y-3">
                {vehicleDistribution.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ 
                          backgroundColor: index === 0 ? COLORS.cars : 
                                         index === 1 ? COLORS.buses : COLORS.trucks 
                        }}
                      />
                      <span className="text-sm font-medium text-gray-700">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{item.value.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{item.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
          </Card>
          </div>
        </div>

        {/* Camera Analysis Section */}
        <div className="mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis por Cámara</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {cameraInsights.map((camera) => (
              <div key={camera.camera_id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-900">{camera.camera_id.toUpperCase()}</h4>
                  <Badge 
                    variant={camera.congestion_level === 'FLUIDO' ? 'green' :
                            camera.congestion_level === 'MODERADO' ? 'yellow' :
                            camera.congestion_level === 'CONGESTIONADO' ? 'orange' : 'red'}
                  >
                    {camera.congestion_level}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-medium">{camera.total_vehicles.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Promedio/h:</span>
                    <span className="font-medium">{camera.avg_hourly.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Hora pico:</span>
                    <span className="font-medium">{camera.peak_hour}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Eficiencia:</span>
                    <span className="font-medium">{camera.efficiency}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Flujo dominante:</span>
                    <span className="font-medium">{camera.dominant_direction === 'in' ? 'ENTRADA' : 'SALIDA'}</span>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-red-500 h-2 rounded-full"
                      style={{ width: `${camera.efficiency}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Índice de eficiencia vial</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        </div>

        {/* Traffic Flow Patterns */}
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Patrones de Flujo Direccional</h3>
            <p className="text-gray-600">Análisis de entrada/salida y congestión por hora</p>
          </div>
          
          <div className="h-80 w-full min-h-[300px] min-w-[300px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={300}>
              <BarChart data={filteredPatterns} margin={{ top: 40, right: 30, left: 60, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="hour" 
                  stroke="#6b7280"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={Math.floor(filteredPatterns.length / 6) || 0}
                  tickFormatter={(hour) => formatMexicoCityTime(toMexicoCityTime(hour), { hour: '2-digit', minute: '2-digit' })}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#1f2937',
                    fontSize: '14px'
                  }}
                  labelFormatter={(hour) => `Hora: ${formatMexicoCityTime(toMexicoCityTime(hour), { hour: '2-digit', minute: '2-digit' })}`}
                />
                <Legend />
                <Bar dataKey="inbound" fill={COLORS.inbound} name="ENTRADA" />
                <Bar dataKey="outbound" fill={COLORS.outbound} name="SALIDA" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Historical Snapshots */}
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Snapshots Históricos</h3>
            <p className="text-gray-600">Registro de imágenes capturadas del sistema de monitoreo</p>
          </div>
          
          {loadingSnapshots ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : snapshots.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay snapshots guardados</p>
              <p className="text-sm text-gray-400 mt-2">Las imágenes capturadas aparecerán aquí después de ser guardadas</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {snapshots.slice(0, 8).map((snapshot) => (
                  <div key={snapshot.id} className="relative group">
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={snapshot.snapshot_url} 
                        alt={`Snapshot ${snapshot.camera_id}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Use a data URL placeholder if image fails to load
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2Y5ZmFhYiIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2YjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPgogICAgSW1hZ2VuIE5vIERpc3BvbmlibGUKICA8L3RleHQ+Cjwvc3ZnPg==';
                        }}
                      />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-white text-xs font-medium">{snapshot.camera_id.toUpperCase()}</p>
                      <p className="text-white/80 text-xs">
                        {formatMexicoCityTime(snapshot.timestamp, { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {snapshot.incident_type && (
                        <Badge variant="orange" className="text-xs">
                          {snapshot.incident_type}
                        </Badge>
                      )}
                    </div>
                    {snapshot.description && (
                      <div className="absolute bottom-8 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-xs bg-black/80 rounded p-1">
                          {snapshot.description}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {snapshots.length > 8 && (
                <div className="text-center">
                  <Button variant="ghost" size="sm">
                    Ver todos los {snapshots.length} snapshots
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* AI Features Section */}
        <div className="border-t-2 border-blue-200 pt-8 mt-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="w-7 h-7 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Inteligencia Artificial de Tráfico</h2>
            </div>
            <p className="text-gray-600 ml-10">
              Análisis avanzado con IA para toma de decisiones municipales
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
              <AITrafficInsights />
            </Card>
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
              <TrafficChat />
            </Card>
          </div>

          <Card className="p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 mt-8">
            <AICostSavings />
          </Card>
        </div>
      </div>
    </div>
    </>
  );
}
