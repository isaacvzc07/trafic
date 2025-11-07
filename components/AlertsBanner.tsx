'use client';

import { LiveCount } from '@/types/api';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface AlertsBannerProps {
  liveCounts: LiveCount[];
}

export default function AlertsBanner({ liveCounts }: AlertsBannerProps) {
  const alerts: Array<{ type: 'warning' | 'info'; message: string }> = [];

  liveCounts.forEach((count) => {
    const totalVehicles = (count.total_in || 0) + (count.total_out || 0);
    const netFlow = (count.total_in || 0) - (count.total_out || 0);

    // High traffic alert
    if (totalVehicles > 30) {
      alerts.push({
        type: 'warning',
        message: `Alto tráfico en ${count.camera_name}: ${totalVehicles} vehículos en últimos 5 min`,
      });
    }

    // Accumulation alert
    if (netFlow > 10) {
      alerts.push({
        type: 'warning',
        message: `Congestión detectada en ${count.camera_name}: ${netFlow} vehículos acumulándose`,
      });
    }

    // Low confidence warning (if we had that data in live counts)
  });

  // No traffic detected
  const noTraffic = liveCounts.filter(c => c.total_in === 0 && c.total_out === 0);
  if (noTraffic.length > 0) {
    alerts.push({
      type: 'info',
      message: `Sin tráfico detectado en ${noTraffic.length} cámara(s) en los últimos 5 minutos`,
    });
  }

  if (alerts.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
        <p className="text-green-800 font-medium">
          Sistema operando normalmente. No hay alertas en este momento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert, index) => (
        <div
          key={index}
          className={`rounded-lg p-4 flex items-start gap-3 ${
            alert.type === 'warning'
              ? 'bg-orange-50 border border-orange-200'
              : 'bg-blue-50 border border-blue-200'
          }`}
        >
          {alert.type === 'warning' ? (
            <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
          ) : (
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          )}
          <p
            className={`font-medium ${
              alert.type === 'warning' ? 'text-orange-800' : 'text-blue-800'
            }`}
          >
            {alert.message}
          </p>
        </div>
      ))}
    </div>
  );
}
