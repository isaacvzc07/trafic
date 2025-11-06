import React from 'react';

interface TrafficIconProps {
  className?: string;
  size?: number;
}

// Individual icon file paths
const getIconSrc = (iconNumber: number) => `/images/icon${iconNumber}.png`;

export const Icon1: React.FC<TrafficIconProps> = ({ className = '', size = 48 }) => (
  <img 
    src={getIconSrc(1)} 
    alt="Icon 1" 
    className={`inline-block ${className}`}
    style={{ width: `${size}px`, height: `${size}px` }}
  />
);

export const Icon2: React.FC<TrafficIconProps> = ({ className = '', size = 48 }) => (
  <img 
    src={getIconSrc(2)} 
    alt="Icon 2" 
    className={`inline-block ${className}`}
    style={{ width: `${size}px`, height: `${size}px` }}
  />
);

export const Icon3: React.FC<TrafficIconProps> = ({ className = '', size = 48 }) => (
  <img 
    src={getIconSrc(3)} 
    alt="Icon 3" 
    className={`inline-block ${className}`}
    style={{ width: `${size}px`, height: `${size}px` }}
  />
);

export const Icon4: React.FC<TrafficIconProps> = ({ className = '', size = 48 }) => (
  <img 
    src={getIconSrc(4)} 
    alt="Icon 4" 
    className={`inline-block ${className}`}
    style={{ width: `${size}px`, height: `${size}px` }}
  />
);

export const Icon5: React.FC<TrafficIconProps> = ({ className = '', size = 48 }) => (
  <img 
    src={getIconSrc(5)} 
    alt="Icon 5" 
    className={`inline-block ${className}`}
    style={{ width: `${size}px`, height: `${size}px` }}
  />
);

export const Icon6: React.FC<TrafficIconProps> = ({ className = '', size = 48 }) => (
  <img 
    src={getIconSrc(6)} 
    alt="Icon 6" 
    className={`inline-block ${className}`}
    style={{ width: `${size}px`, height: `${size}px` }}
  />
);

export const Icon7: React.FC<TrafficIconProps> = ({ className = '', size = 48 }) => (
  <img 
    src={getIconSrc(7)} 
    alt="Icon 7" 
    className={`inline-block ${className}`}
    style={{ width: `${size}px`, height: `${size}px` }}
  />
);

export const Icon8: React.FC<TrafficIconProps> = ({ className = '', size = 48 }) => (
  <img 
    src={getIconSrc(8)} 
    alt="Icon 8" 
    className={`inline-block ${className}`}
    style={{ width: `${size}px`, height: `${size}px` }}
  />
);

export const Icon9: React.FC<TrafficIconProps> = ({ className = '', size = 48 }) => (
  <img 
    src={getIconSrc(9)} 
    alt="Icon 9" 
    className={`inline-block ${className}`}
    style={{ width: `${size}px`, height: `${size}px` }}
  />
);
