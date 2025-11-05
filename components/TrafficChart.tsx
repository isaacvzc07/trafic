'use client';

import { useState } from 'react';
import { HourlyStatistic } from '@/types/api';
import { useHistoricalData } from '@/hooks/useTrafficData';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { subDays, startOfDay, endOfDay } from 'date-fns';

type TimeRange = '24h' | 'today' | 'yesterday' | '7d';

interface TrafficChartProps {
  data?: HourlyStatistic[]; // Make optional since we'll fetch from historical API
}

export default function TrafficChart({ data: propData }: TrafficChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');

  // Calculate date range based on selected filter
  const getDateRange = (range: TimeRange) => {
    const now = new Date();

    switch (range) {
      case '24h':
        return { start: undefined, end: undefined }; // Get all available data
      case 'today':
        return {
          start: startOfDay(now).toISOString(),
          end: endOfDay(now).toISOString(),
        };
      case 'yesterday':
        const yesterday = subDays(now, 1);
        return {
          start: startOfDay(yesterday).toISOString(),
          end: endOfDay(yesterday).toISOString(),
        };
      case '7d':
        return {
          start: subDays(now, 7).toISOString(),
          end: now.toISOString(),
        };
      default:
        return { start: undefined, end: undefined };
    }
  };

  const dateRange = getDateRange(timeRange);
  const { historicalData, isLoading, isError } = useHistoricalData(
    dateRange.start,
    dateRange.end,
    60000
  );

  // Use historical data if available, fallback to prop data
  const data = historicalData || propData;

  // Get title based on selected range
  const getTitle = () => {
    switch (timeRange) {
      case '24h':
        return 'Tráfico por Hora (Últimas 24h)';
      case 'today':
        return 'Tráfico de Hoy';
      case 'yesterday':
        return 'Tráfico de Ayer';
      case '7d':
        return 'Tráfico (Últimos 7 Días)';
      default:
        return 'Tráfico por Hora';
    }
  };

  // Validate data
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">{getTitle()}</h2>
        </div>
        <div className="flex items-center justify-center h-[400px] text-gray-500">
          Cargando datos...
        </div>
      </div>
    );
  }

  if (isError || !data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">{getTitle()}</h2>

          {/* Time range filter buttons */}
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              onClick={() => setTimeRange('24h')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                timeRange === '24h'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Últimas 24h
            </button>
            <button
              onClick={() => setTimeRange('today')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                timeRange === 'today'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Hoy
            </button>
            <button
              onClick={() => setTimeRange('yesterday')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                timeRange === 'yesterday'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Ayer
            </button>
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                timeRange === '7d'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Últimos 7 días
            </button>
          </div>
        </div>
        <div className="flex items-center justify-center h-[400px] text-gray-500">
          No hay datos disponibles para el período seleccionado
        </div>
      </div>
    );
  }

  // Group data by hour and camera, maintaining chronological order
  const chartData = data.reduce((acc, stat) => {
    // Validate stat.hour exists
    if (!stat.hour) {
      console.warn('Skipping record with missing hour:', stat);
      return acc;
    }

    // Convert UTC to CST (UTC-6) - keeping full timestamp
    const utcDate = new Date(stat.hour + 'Z'); // Force UTC interpretation

    // Validate that the date is valid
    if (isNaN(utcDate.getTime())) {
      console.warn('Skipping record with invalid date:', stat.hour, stat);
      return acc;
    }

    const cstTimestamp = utcDate.getTime() - 6 * 60 * 60 * 1000; // Subtract 6 hours in milliseconds

    // Use timestamp as key to preserve chronological order
    const timestampKey = cstTimestamp.toString();
    // Format for display (just the hour) - extract directly from ISO string to avoid timezone issues
    const cstISOString = new Date(cstTimestamp).toISOString();

    // For 7d view, show date + hour; otherwise just hour
    let hourDisplay: string;
    if (timeRange === '7d') {
      hourDisplay = cstISOString.substring(5, 16).replace('T', ' '); // MM-DD HH:mm
    } else {
      hourDisplay = cstISOString.substring(11, 16); // HH:mm
    }

    if (!acc[timestampKey]) {
      acc[timestampKey] = {
        timestamp: cstTimestamp, // For sorting
        hour: hourDisplay,
        cam_01: 0,
        cam_02: 0,
        cam_03: 0,
        cam_04: 0,
      };
    }

    const cameraKey = stat.camera_id as 'cam_01' | 'cam_02' | 'cam_03' | 'cam_04';
    acc[timestampKey][cameraKey] += stat.count;

    return acc;
  }, {} as Record<string, { timestamp: number; hour: string; cam_01: number; cam_02: number; cam_03: number; cam_04: number; }>);

  // Sort by actual timestamp, not by hour string
  const chartArray = Object.values(chartData).sort((a, b) => a.timestamp - b.timestamp);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">{getTitle()}</h2>
        <p className="text-sm text-gray-500 mt-1">
          Hora local (CST) • Datos históricos almacenados en Supabase
        </p>

        {/* Time range filter buttons */}
        <div className="flex flex-wrap gap-2 mt-3">
          <button
            onClick={() => setTimeRange('24h')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              timeRange === '24h'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Últimas 24h
          </button>
          <button
            onClick={() => setTimeRange('today')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              timeRange === 'today'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Hoy
          </button>
          <button
            onClick={() => setTimeRange('yesterday')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              timeRange === 'yesterday'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Ayer
          </button>
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              timeRange === '7d'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Últimos 7 días
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartArray}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="hour"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            label={{ value: 'Vehículos', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px' }}
            labelStyle={{ fontWeight: 'bold' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="cam_01"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Av. Homero O-E"
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="cam_02"
            stroke="#8b5cf6"
            strokeWidth={2}
            name="Av. Homero E-O"
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="cam_03"
            stroke="#10b981"
            strokeWidth={2}
            name="Av. Industrias N-S"
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="cam_04"
            stroke="#f59e0b"
            strokeWidth={2}
            name="Av. Industrias S-N"
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
