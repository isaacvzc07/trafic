import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'green' | 'red' | 'blue' | 'yellow' | 'orange' | 'gray';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({
  children,
  variant = 'gray',
  size = 'md',
  className = '',
}: BadgeProps) {
  const variants = {
    green: 'bg-green-600/20 text-green-400 border border-green-600/30',
    red: 'bg-red-600/20 text-red-400 border border-red-600/30',
    blue: 'bg-blue-600/20 text-blue-400 border border-blue-600/30',
    yellow: 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/30',
    orange: 'bg-orange-600/20 text-orange-400 border border-orange-600/30',
    gray: 'bg-slate-700/50 text-slate-300 border border-slate-600/50',
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };
  
  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
      className={`
        inline-flex items-center rounded-full font-medium
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </motion.span>
  );
}
