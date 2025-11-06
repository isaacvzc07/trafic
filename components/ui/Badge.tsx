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
    green: 'bg-green-100 text-green-700 border border-green-200',
    red: 'bg-red-100 text-red-700 border border-red-200',
    blue: 'bg-blue-100 text-blue-700 border border-blue-200',
    yellow: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    orange: 'bg-orange-100 text-orange-700 border border-orange-200',
    gray: 'bg-gray-100 text-gray-700 border border-gray-200',
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
