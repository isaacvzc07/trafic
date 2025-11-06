import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
}: ButtonProps) {
  const baseClasses = 'font-medium rounded-lg transition-all duration-200 inline-flex items-center justify-center';
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-600 hover:border-blue-500',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-300 border border-slate-600 hover:border-slate-500',
    danger: 'bg-red-600 hover:bg-red-500 text-white border border-red-600 hover:border-red-500',
    ghost: 'bg-transparent hover:bg-slate-800 text-slate-300 hover:text-white border border-transparent',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${disabledClasses}
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
}
