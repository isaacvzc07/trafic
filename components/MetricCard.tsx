'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

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

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getTrendBadge = () => {
    switch (trend) {
      case 'up': return 'green';
      case 'down': return 'red';
      default: return 'gray';
    }
  };

  const TrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4" />;
      case 'down': return <TrendingDown className="w-4 h-4" />;
      default: return <Minus className="w-4 h-4" />;
    }
  };

  return (
    <Card hover className={className}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {icon && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              className="text-blue-400"
            >
              {icon}
            </motion.div>
          )}
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
            {title}
          </h3>
        </div>
        
        {change !== undefined && (
          <Badge variant={getTrendBadge()} size="sm">
            <div className="flex items-center space-x-1">
              <TrendIcon />
              <span>{Math.abs(change)}%</span>
            </div>
          </Badge>
        )}
      </div>
      
      <div className="space-y-2">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          className="text-3xl font-bold text-white"
        >
          {formatValue(value)}
        </motion.div>
        
        {changeLabel && (
          <div className={`text-sm ${getTrendColor()}`}>
            {changeLabel}
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
      </div>
    </Card>
  );
}
