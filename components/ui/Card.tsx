import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'blue' | 'green' | 'red';
}

export function Card({ children, className = '', hover = false, glow }: CardProps) {
  const glowClass = glow ? `shadow-glow-${glow}` : '';
  const hoverClass = hover ? 'hover:bg-gray-50 hover:shadow-lg hover:shadow-gray-200/50' : '';
  
  return (
    <motion.div
      whileHover={hover ? { y: -2, scale: 1.01 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`
        bg-white border border-gray-200 rounded-lg p-6
        ${glowClass} ${hoverClass} ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
