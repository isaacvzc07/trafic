'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Card } from './ui/Card';

interface HeatmapData {
  hour: string;
  location: string;
  intensity: number;
  count: number;
}

interface TrafficHeatmapProps {
  data: HeatmapData[];
  className?: string;
}

export function TrafficHeatmap({ data, className = '' }: TrafficHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<HeatmapData | null>(null);
  
  // Get unique hours and locations for grid
  const hours = [...new Set(data.map(d => d.hour))].sort();
  const locations = [...new Set(data.map(d => d.location))].sort();
  
  // Get intensity range for color scaling
  const maxIntensity = Math.max(...data.map(d => d.intensity));
  
  const getIntensityColor = (intensity: number) => {
    const ratio = intensity / maxIntensity;
    if (ratio > 0.8) return 'bg-red-600';
    if (ratio > 0.6) return 'bg-orange-600';
    if (ratio > 0.4) return 'bg-yellow-600';
    if (ratio > 0.2) return 'bg-blue-600';
    return 'bg-green-600';
  };

  const getIntensityOpacity = (intensity: number) => {
    const ratio = intensity / maxIntensity;
    return 0.3 + (ratio * 0.7); // Range from 0.3 to 1.0
  };

  return (
    <Card className={className}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Traffic Intensity Heatmap
          </h3>
          <p className="text-sm text-slate-400">
            Visual representation of traffic patterns by hour and location
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Header row */}
            <div className="flex items-center mb-2">
              <div className="w-24 h-8 flex-shrink-0" />
              {hours.map((hour, index) => (
                <motion.div
                  key={hour}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="flex-1 h-8 flex items-center justify-center text-xs text-slate-400 font-medium"
                >
                  {hour}
                </motion.div>
              ))}
            </div>
            
            {/* Data rows */}
            {locations.map((location, locationIndex) => (
              <div key={location} className="flex items-center mb-1">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: locationIndex * 0.05 }}
                  className="w-24 h-12 flex-shrink-0 flex items-center text-xs text-slate-400 font-medium truncate pr-2"
                >
                  {location}
                </motion.div>
                
                {hours.map((hour, hourIndex) => {
                  const cellData = data.find(d => d.hour === hour && d.location === location);
                  const intensity = cellData?.intensity || 0;
                  const count = cellData?.count || 0;
                  
                  return (
                    <motion.div
                      key={`${location}-${hour}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ 
                        delay: (locationIndex * 0.05) + (hourIndex * 0.01),
                        type: 'spring',
                        stiffness: 200,
                        damping: 15
                      }}
                      className="flex-1 h-12 mx-0.5 rounded cursor-pointer relative group"
                      style={{
                        backgroundColor: intensity > 0 ? `rgba(239, 68, 68, ${getIntensityOpacity(intensity)})` : 'rgba(71, 85, 105, 0.3)'
                      }}
                      onMouseEnter={() => setHoveredCell(cellData || null)}
                      onMouseLeave={() => setHoveredCell(null)}
                      whileHover={{ scale: 1.05, zIndex: 10 }}
                    >
                      {count > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-medium text-white">
                            {count}
                          </span>
                        </div>
                      )}
                      
                      {hoveredCell === cellData && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-50 whitespace-nowrap"
                        >
                          <div className="text-xs text-white">
                            <div className="font-semibold">{location} - {hour}</div>
                            <div>Intensity: {intensity}</div>
                            <div>Vehicles: {count}</div>
                          </div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800" />
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-700">
          <div className="text-xs text-slate-400">
            Traffic Intensity
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-600 rounded" />
              <span className="text-xs text-slate-400">Low</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-600 rounded" />
              <span className="text-xs text-slate-400">Moderate</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-600 rounded" />
              <span className="text-xs text-slate-400">High</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-600 rounded" />
              <span className="text-xs text-slate-400">Very High</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-600 rounded" />
              <span className="text-xs text-slate-400">Critical</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
