'use client';

import { SummaryStatistics } from '@/types/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CameraComparisonProps {
  data: SummaryStatistics;
}

export default function CameraComparison({ data }: CameraComparisonProps) {
  // Validate data
  if (!data || !data.summary) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Comparativa entre Cámaras (24h)
        </h2>
        <div className="flex items-center justify-center h-[350px] text-gray-500">
          No hay datos disponibles
        </div>
      </div>
    );
  }

  const chartData = Object.entries(data.summary).map(([cameraId, counts]) => {
    const carIn = counts.car_in || 0;
    const carOut = counts.car_out || 0;
    const busIn = counts.bus_in || 0;
    const busOut = counts.bus_out || 0;
    const truckIn = counts.truck_in || 0;
    const truckOut = counts.truck_out || 0;

    const total = carIn + carOut + busIn + busOut + truckIn + truckOut;

    const cameraNames: Record<string, string> = {
      cam_01: 'Homero O-E',
      cam_02: 'Homero E-O',
      cam_03: 'Industrias N-S',
      cam_04: 'Industrias S-N',
    };

    return {
      name: cameraNames[cameraId] || cameraId,
      entrada: carIn + busIn + truckIn,
      salida: carOut + busOut + truckOut,
      total,
    };
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Comparativa entre Cámaras (24h)
      </h2>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis label={{ value: 'Vehículos', angle: -90, position: 'insideLeft' }} />
          <Tooltip
            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px' }}
          />
          <Legend />
          <Bar dataKey="entrada" fill="#3b82f6" name="Entrada" />
          <Bar dataKey="salida" fill="#8b5cf6" name="Salida" />
        </BarChart>
      </ResponsiveContainer>

      {/* Summary Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-2 px-3 font-semibold text-gray-700">Cámara</th>
              <th className="text-right py-2 px-3 font-semibold text-gray-700">Entrada</th>
              <th className="text-right py-2 px-3 font-semibold text-gray-700">Salida</th>
              <th className="text-right py-2 px-3 font-semibold text-gray-700">Total</th>
              <th className="text-right py-2 px-3 font-semibold text-gray-700">Balance</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((row) => {
              const balance = row.entrada - row.salida;
              const balanceColor = balance > 0 ? 'text-orange-600' : balance < 0 ? 'text-green-600' : 'text-gray-600';

              return (
                <tr key={row.name} className="border-b border-gray-100">
                  <td className="py-2 px-3 font-medium text-gray-900">{row.name}</td>
                  <td className="py-2 px-3 text-right text-blue-600 font-semibold">
                    {row.entrada.toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-right text-purple-600 font-semibold">
                    {row.salida.toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-gray-900">
                    {row.total.toLocaleString()}
                  </td>
                  <td className={`py-2 px-3 text-right font-semibold ${balanceColor}`}>
                    {balance > 0 ? '+' : ''}{balance.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
