'use client';

import { LiveCount } from '@/types/api';
import { ArrowDown, ArrowUp, Camera as CameraIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';
import { formatRelativeMexicoCityTime } from '@/lib/timezone';

interface LiveCounterProps {
  data: LiveCount;
}

export default function LiveCounter({ data }: LiveCounterProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);
  const totalVehicles = data.total_in + data.total_out;
  const netFlow = data.total_in - data.total_out;
  const isAccumulating = netFlow > 0;

  // Determine congestion level
  let congestionLevel: 'low' | 'medium' | 'high' = 'low';
  if (totalVehicles > 30) congestionLevel = 'high';
  else if (totalVehicles > 15) congestionLevel = 'medium';

  const bgColor = {
    low: 'bg-green-50 border-green-200',
    medium: 'bg-yellow-50 border-yellow-200',
    high: 'bg-red-50 border-red-200',
  }[congestionLevel];

  const statusColor = {
    low: 'text-green-600',
    medium: 'text-yellow-600',
    high: 'text-red-600',
  }[congestionLevel];

  return (
    <div className={`rounded-lg border-2 p-4 ${bgColor} transition-all duration-300`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <CameraIcon className="h-4 w-4 text-gray-600" />
            <h3 className="font-semibold text-gray-900">{data.camera_name}</h3>
          </div>
          <p className="text-xs text-gray-500">{data.camera_id}</p>
        </div>
        <div className={`text-xs font-medium px-2 py-1 rounded ${statusColor} bg-white`}>
          {congestionLevel === 'high' ? 'Alta' : congestionLevel === 'medium' ? 'Media' : 'Baja'}
        </div>
      </div>

      {/* Main Counters */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <ArrowUp className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-medium text-gray-600">Entrada</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{data.total_in}</div>
        </div>

        <div className="text-center border-x border-gray-300">
          <div className="text-xs font-medium text-gray-600 mb-1">Total</div>
          <div className="text-2xl font-bold text-gray-900">{totalVehicles}</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <ArrowDown className="h-4 w-4 text-purple-600" />
            <span className="text-xs font-medium text-gray-600">Salida</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">{data.total_out}</div>
        </div>
      </div>

      {/* Vehicle Type Breakdown */}
      {Object.keys(data.counts).length > 0 && (
        <div className="border-t border-gray-200 pt-2 mb-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {data.counts.car_in !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-600">🚗 Autos (E):</span>
                <span className="font-semibold">{data.counts.car_in}</span>
              </div>
            )}
            {data.counts.car_out !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-600">🚗 Autos (S):</span>
                <span className="font-semibold">{data.counts.car_out}</span>
              </div>
            )}
            {data.counts.bus_in !== undefined && data.counts.bus_in > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">🚌 Buses (E):</span>
                <span className="font-semibold">{data.counts.bus_in}</span>
              </div>
            )}
            {data.counts.bus_out !== undefined && data.counts.bus_out > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">🚌 Buses (S):</span>
                <span className="font-semibold">{data.counts.bus_out}</span>
              </div>
            )}
            {data.counts.truck_in !== undefined && data.counts.truck_in > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">🚚 Camiones (E):</span>
                <span className="font-semibold">{data.counts.truck_in}</span>
              </div>
            )}
            {data.counts.truck_out !== undefined && data.counts.truck_out > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">🚚 Camiones (S):</span>
                <span className="font-semibold">{data.counts.truck_out}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Net Flow Indicator */}
      {netFlow !== 0 && (
        <div className="flex items-center justify-center gap-2 text-xs font-medium">
          {isAccumulating ? (
            <>
              <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></div>
              <span className="text-orange-600">
                Acumulando: +{netFlow} vehículos
              </span>
            </>
          ) : (
            <>
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-green-600">
                Dispersando: {netFlow} vehículos
              </span>
            </>
          )}
        </div>
      )}

      {/* Timestamp */}
      <div className="text-xs text-gray-400 text-center mt-2">
        {mounted ? (
          <>Actualizado {formatRelativeMexicoCityTime(data.timestamp)}</>
        ) : (
          <>Actualizado recientemente</>
        )}
      </div>
    </div>
  );
}
