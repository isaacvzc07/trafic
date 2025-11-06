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
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-700 border border-gray-300 hover:border-gray-300',
    danger: 'bg-red-600 hover:bg-red-500 text-white border border-red-600 hover:border-red-500',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-600 hover:text-gray-900 border border-transparent',
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
