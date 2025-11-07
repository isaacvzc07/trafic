'use client';

import { useState } from 'react';
import { HourlyStatistic } from '@/types/api';
import { useHistoricalData } from '@/hooks/useTrafficDataQuery';
import { subDays, startOfDay, endOfDay } from 'date-fns';
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
import { getMexicoCityTime, formatMexicoCityTime, toMexicoCityTime } from '@/lib/timezone';

type TimeRange = '24h' | 'today' | 'yesterday' | '7d';

interface ChartData {
  hour: string;
  time: string;
  cars: number;
}

export default function TrafficChartVisx() {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');

  // Calculate date range based on selected filter
  const getDateRange = (range: TimeRange) => {
    const now = getMexicoCityTime();

    switch (range) {
      case '24h':
        return { start: undefined, end: undefined };
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
  // Reduce refresh interval to 10 seconds for more frequent updates
  const { historicalData: data, isLoading, isError } = useHistoricalData(
    dateRange.start, 
    dateRange.end, 
    10000 // 10 seconds instead of 60
  );

  // Process data for chart - only cars since that's what Jetson Nano measures
  const processData = (rawData: HourlyStatistic[]): ChartData[] => {
    const groupedByHour = rawData.reduce((acc: Record<string, ChartData>, stat) => {
      const hour = stat.hour || '';
      if (!acc[hour]) {
        const mexicoCityTime = toMexicoCityTime(hour);
        
        acc[hour] = {
          hour: hour,
          time: formatMexicoCityTime(mexicoCityTime, { hour: '2-digit', minute: '2-digit', hour12: false }),
          cars: 0,
        };
      }

      // Only count cars - Jetson Nano only detects cars
      if (stat.vehicle_type === 'car') {
        const count = stat.count || 0;
        acc[hour].cars += count;
      }

      return acc;
    }, {});

    return Object.values(groupedByHour).sort((a, b) => 
      new Date(a.hour).getTime() - new Date(b.hour).getTime()
    );
  };

  const chartData = processData(data || []);

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="mb-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-[400px] bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || chartData.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {timeRange === '24h' && 'Tráfico por Hora (Últimas 24h)'}
            {timeRange === 'today' && 'Tráfico por Hora (Hoy)'}
            {timeRange === 'yesterday' && 'Tráfico por Hora (Ayer)'}
            {timeRange === '7d' && 'Tráfico por Hora (Últimos 7 días)'}
          </h3>
          <div className="flex gap-2">
            {(['24h', 'today', 'yesterday', '7d'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {range === '24h' && '24h'}
                {range === 'today' && 'Hoy'}
                {range === 'yesterday' && 'Ayer'}
                {range === '7d' && '7d'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center h-[400px] text-gray-500">
          No hay datos disponibles
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {timeRange === '24h' && 'Tráfico por Hora (Últimas 24h)'}
            {timeRange === 'today' && 'Tráfico por Hora (Hoy)'}
            {timeRange === 'yesterday' && 'Tráfico por Hora (Ayer)'}
            {timeRange === '7d' && 'Tráfico por Hora (Últimos 7 días)'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Hora local (CST) • Actualiza cada 10 segundos • Solo vehículos detectados
          </p>
        </div>
        <div className="flex gap-2">
          {(['24h', 'today', 'yesterday', '7d'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range === '24h' && '24h'}
              {range === 'today' && 'Hoy'}
              {range === 'yesterday' && 'Ayer'}
              {range === '7d' && '7d'}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="hour"
              stroke="#6b7280"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
              interval={Math.floor(chartData.length / 10) || 0}
              tickFormatter={(hour) => {
                const mexicoCityTime = toMexicoCityTime(hour);
                return formatMexicoCityTime(mexicoCityTime, { hour: '2-digit', minute: '2-digit', hour12: false });
              }}
            />
            <YAxis
              stroke="#6b7280"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              label={{
                value: 'Vehículos',
                angle: -90,
                position: 'insideLeft',
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
              labelFormatter={(hour) => {
                const mexicoCityTime = toMexicoCityTime(hour as string);
                return `Hora: ${formatMexicoCityTime(mexicoCityTime, { hour: '2-digit', minute: '2-digit', hour12: false })}`;
              }}
            />
            <Legend
              verticalAlign="top"
              height={40}
              wrapperStyle={{ paddingBottom: '20px' }}
            />
            <Line
              type="monotone"
              dataKey="cars"
              stroke="#3b82f6"
              strokeWidth={3}
              name="Vehículos"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
