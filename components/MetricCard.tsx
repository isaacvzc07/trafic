'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  sparkline?: React.ReactNode;
  className?: string;
  format?: 'number' | 'percentage' | 'currency';
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel,
  trend = 'neutral',
  icon,
  sparkline,
  className = '',
  format = 'number',
}: MetricCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('es-MX', {
          style: 'currency',
          currency: 'MXN',
        }).format(val);
      case 'percentage':
        return `${val}%`;
      default:
        return new Intl.NumberFormat('es-MX').format(val);
    }
  };

  const getTrendColors = () => {
    switch (trend) {
      case 'up': return { bg: 'bg-green-50', text: 'text-green-700', icon: 'text-green-600' };
      case 'down': return { bg: 'bg-red-50', text: 'text-red-700', icon: 'text-red-600' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-700', icon: 'text-gray-600' };
    }
  };

  const TrendIcon = () => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-3 h-3" />;
      case 'down': return <ArrowDown className="w-3 h-3" />;
      default: return <Minus className="w-3 h-3" />;
    }
  };

  const trendColors = getTrendColors();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200 ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-sm font-medium text-gray-600">{title}</span>
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            {icon}
          </div>
        )}
      </div>
      
      <div className="text-3xl font-bold text-gray-900 mb-2">
        {format === 'currency' && '$'}
        {formatValue(value)}
        {format === 'percentage' && '%'}
      </div>
      
      {(change !== undefined || changeLabel) && (
        <div className="flex items-center gap-2">
          {change !== undefined && (
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${trendColors.bg} ${trendColors.text}`}>
              <TrendIcon />
              {change > 0 ? '+' : ''}{change}%
            </div>
          )}
          {changeLabel && (
            <span className="text-xs text-gray-600">{changeLabel}</span>
          )}
        </div>
      )}
      
      {sparkline && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="h-12 mt-4"
        >
          {sparkline}
        </motion.div>
      )}
    </motion.div>
  );
}
