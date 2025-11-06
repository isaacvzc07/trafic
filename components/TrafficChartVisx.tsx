'use client';

import { useState } from 'react';
import { HourlyStatistic } from '@/types/api';
import { useHistoricalData } from '@/hooks/useTrafficDataQuery';
import { subDays, startOfDay, endOfDay, format } from 'date-fns';
import { Group } from '@visx/group';
import { scaleTime, scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows, GridColumns } from '@visx/grid';
import { LinePath } from '@visx/shape';
import { Tooltip, useTooltip } from '@visx/tooltip';
import { getMexicoCityTime } from '@/lib/timezone';

type TimeRange = '24h' | 'today' | 'yesterday' | '7d';

interface TrafficChartProps {
  data?: HourlyStatistic[];
}

interface ChartData {
  date: Date;
  total: number;
  cars: number;
  buses: number;
  trucks: number;
}

export default function TrafficChartVisx({ data: propData }: TrafficChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const { historicalData, isLoading, isError } = useHistoricalData();

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
  const { historicalData: data } = useHistoricalData(dateRange.start, dateRange.end);

  // Process data for chart
  const processData = (rawData: HourlyStatistic[]): ChartData[] => {
    const groupedByHour = rawData.reduce((acc: Record<string, ChartData>, stat) => {
      const hour = stat.hour;
      if (!acc[hour]) {
        acc[hour] = {
          date: new Date(hour),
          total: 0,
          cars: 0,
          buses: 0,
          trucks: 0,
        };
      }

      const count = stat.count || 0;
      acc[hour].total += count;

      if (stat.vehicle_type === 'car') {
        acc[hour].cars += count;
      } else if (stat.vehicle_type === 'bus') {
        acc[hour].buses += count;
      } else if (stat.vehicle_type === 'truck') {
        acc[hour].trucks += count;
      }

      return acc;
    }, {});

    return Object.values(groupedByHour).sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const chartData = processData(data || []);

  // Chart dimensions
  const width = 800;
  const height = 400;
  const margin = { top: 20, right: 50, bottom: 50, left: 60 };
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  // Scales
  const mexicoCityNow = getMexicoCityTime();
  const dateScale = scaleTime<number>({
    range: [0, xMax],
    domain: chartData.length > 0 
      ? [Math.min(...chartData.map(d => d.date.getTime())), Math.max(...chartData.map(d => d.date.getTime()))]
      : [mexicoCityNow.getTime() - 24 * 60 * 60 * 1000, mexicoCityNow.getTime()],
  });

  const totalScale = scaleLinear<number>({
    range: [yMax, 0],
    domain: chartData.length > 0 
      ? [0, Math.max(...chartData.map(d => d.total))]
      : [0, 100],
    nice: true,
  });

  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip<ChartData>();

  // Tooltip content
  const getTooltipContent = () => {
    if (!tooltipData) return null;
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
        <p className="font-semibold text-gray-900 mb-2">{format(tooltipData.date, 'dd MMM yyyy HH:mm', { timeZone: 'America/Mexico_City' })}</p>
        <p className="text-blue-600 text-sm">Total: {tooltipData.total}</p>
        <p className="text-green-600 text-sm">Autos: {tooltipData.cars}</p>
        <p className="text-purple-600 text-sm">Autobuses: {tooltipData.buses}</p>
        <p className="text-orange-600 text-sm">Camiones: {tooltipData.trucks}</p>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="mb-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || chartData.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tráfico por Hora (Últimas 24h)</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          No hay datos disponibles
        </div>
      </div>
    );
  }

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
                className={`px-3 py-1 text-sm font-medium rounded-lg Transition-colors ${
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

      <div className="relative">
        <svg width={width} height={height} className="w-full h-auto">
          <Group left={margin.left} top={margin.top}>
            {/* Grid */}
            <GridRows
              scale={totalScale}
              width={xMax}
              strokeDasharray="2,2"
              stroke="#f1f3f5"
            />
            <GridColumns
              scale={dateScale}
              height={yMax}
              strokeDasharray="2,2"
              stroke="#f1f3f5"
            />

            {/* Axes */}
            <AxisLeft
              scale={totalScale}
              stroke="#9ca3af"
              tickStroke="#9ca3af"
              tickLabelProps={() => ({
                fill: '#6b7280',
                fontSize: 12,
                textAnchor: 'end',
                dy: '0.33em',
              })}
            />
            <AxisBottom
              scale={dateScale}
              stroke="#9ca3af"
              tickStroke="#9ca3af"
              tickLabelProps={() => ({
                fill: '#6b7280',
                fontSize: 12,
                textAnchor: 'middle',
              })}
              tickFormat={(date) => format(new Date(date as number), 'HH:mm', { timeZone: 'America/Mexico_City' })}
            />

            {/* Total line */}
            <LinePath<ChartData>
              data={chartData}
              x={(d) => dateScale(d.date.getTime()) || 0}
              y={(d) => totalScale(d.total) || 0}
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="0"
              onMouseMove={(event: React.MouseEvent<SVGPathElement>) => {
                const point = event.currentTarget.getBoundingClientRect();
                const dataIndex = chartData.findIndex(d => 
                  dateScale(d.date.getTime()) === event.currentTarget.getPointAtLength(0).x
                );
                const data = chartData[dataIndex] || chartData[0];
                showTooltip({
                  tooltipData: data,
                  tooltipLeft: point.left,
                  tooltipTop: point.top,
                });
              }}
              onMouseLeave={hideTooltip}
            />

            {/* Cars line */}
            <LinePath<ChartData>
              data={chartData}
              x={(d) => dateScale(d.date.getTime()) || 0}
              y={(d) => totalScale(d.cars) || 0}
              stroke="#10b981"
              strokeWidth={2}
              strokeOpacity={0.7}
              onMouseMove={(event: React.MouseEvent<SVGPathElement>) => {
                const point = event.currentTarget.getBoundingClientRect();
                const dataIndex = chartData.findIndex(d => 
                  dateScale(d.date.getTime()) === event.currentTarget.getPointAtLength(0).x
                );
                const data = chartData[dataIndex] || chartData[0];
                showTooltip({
                  tooltipData: data,
                  tooltipLeft: point.left,
                  tooltipTop: point.top,
                });
              }}
              onMouseLeave={hideTooltip}
            />

            {/* Buses line */}
            <LinePath<ChartData>
              data={chartData}
              x={(d) => dateScale(d.date.getTime()) || 0}
              y={(d) => totalScale(d.buses) || 0}
              stroke="#8b5cf6"
              strokeWidth={2}
              strokeOpacity={0.7}
              onMouseMove={(event: React.MouseEvent<SVGPathElement>) => {
                const point = event.currentTarget.getBoundingClientRect();
                const dataIndex = chartData.findIndex(d => 
                  dateScale(d.date.getTime()) === event.currentTarget.getPointAtLength(0).x
                );
                const data = chartData[dataIndex] || chartData[0];
                showTooltip({
                  tooltipData: data,
                  tooltipLeft: point.left,
                  tooltipTop: point.top,
                });
              }}
              onMouseLeave={hideTooltip}
            />
          </Group>
        </svg>

        {/* Tooltip */}
        {tooltipOpen && (
          <div
            style={{
              position: 'absolute',
              left: tooltipLeft || 0,
              top: tooltipTop || 0,
              pointerEvents: 'none',
            }}
          >
            {getTooltipContent()}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-blue-600 rounded"></div>
          <span className="text-sm text-gray-700 font-medium">Total</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-green-600 rounded"></div>
          <span className="text-sm text-gray-700 font-medium">Cars</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-purple-600 rounded"></div>
          <span className="text-sm text-gray-700 font-medium">Buses</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-orange-600 rounded"></div>
          <span className="text-sm text-gray-700 font-medium">Trucks</span>
        </div>
      </div>
    </div>
  );
}
