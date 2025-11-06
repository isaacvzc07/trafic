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
  const hoverClass = hover ? 'hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/50' : '';
  
  return (
    <motion.div
      whileHover={hover ? { y: -2, scale: 1.01 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`
        bg-slate-900 border border-slate-700 rounded-lg p-6
        ${glowClass} ${hoverClass} ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
