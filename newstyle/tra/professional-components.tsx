// =============================================================================
// TRAFFICMX PROFESSIONAL COMPONENTS
// Quick-Start Examples for TradingView-Style Redesign
// =============================================================================

import { Activity, TrendingUp, Camera, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';

// =============================================================================
// 1. PROFESSIONAL METRIC CARD
// =============================================================================

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  changeLabel?: string;
  icon?: React.ReactNode;
  format?: 'number' | 'currency' | 'percentage';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  trend = 'neutral',
  changeLabel,
  icon,
  format = 'number'
}) => {
  const trendColors = {
    up: 'text-green-700 bg-green-50',
    down: 'text-red-700 bg-red-50',
    neutral: 'text-gray-700 bg-gray-50'
  };

  const trendIcons = {
    up: <ArrowUp className="w-3 h-3" />,
    down: <ArrowDown className="w-3 h-3" />,
    neutral: null
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
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
        {typeof value === 'number' ? value.toLocaleString() : value}
        {format === 'percentage' && '%'}
      </div>
      
      {(change !== undefined || changeLabel) && (
        <div className="flex items-center gap-2">
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${trendColors[trend]}`}>
            {trendIcons[trend]}
            {change !== undefined && `${change > 0 ? '+' : ''}${change}%`}
          </div>
          {changeLabel && (
            <span className="text-xs text-gray-600">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  );
};

// =============================================================================
// 2. PROFESSIONAL DATA TABLE
// =============================================================================

interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onSort?: (key: keyof T) => void;
  sortKey?: keyof T;
  sortDirection?: 'asc' | 'desc';
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  onSort,
  sortKey,
  sortDirection
}: DataTableProps<T>) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={`px-4 py-3 text-${column.align || 'left'} text-xs font-semibold text-gray-600 uppercase tracking-wider`}
                onClick={() => column.sortable && onSort?.(column.key)}
                style={{ cursor: column.sortable ? 'pointer' : 'default' }}
              >
                <div className="flex items-center gap-1">
                  {column.label}
                  {column.sortable && sortKey === column.key && (
                    <span className="text-blue-600">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50 transition-colors duration-150">
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className={`px-4 py-3.5 text-sm text-gray-900 text-${column.align || 'left'}`}
                >
                  {column.render
                    ? column.render(row[column.key], row)
                    : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// =============================================================================
// 3. PROFESSIONAL BUTTON COMPONENTS
// =============================================================================

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  onClick,
  disabled = false,
  className = ''
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm hover:shadow-md',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
      {children}
    </button>
  );
};

// =============================================================================
// 4. PROFESSIONAL BADGE/PILL COMPONENT
// =============================================================================

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'green' | 'red' | 'amber' | 'gray' | 'purple';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gray',
  size = 'md',
  icon
}) => {
  const variants = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    red: 'bg-red-50 text-red-700',
    amber: 'bg-amber-50 text-amber-700',
    gray: 'bg-gray-100 text-gray-700',
    purple: 'bg-purple-50 text-purple-700'
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm'
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${variants[variant]} ${sizes[size]}`}>
      {icon}
      {children}
    </span>
  );
};

// =============================================================================
// 5. PROFESSIONAL CARD COMPONENT
// =============================================================================

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  action,
  className = '',
  padding = 'lg'
}) => {
  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}>
      {(title || subtitle || action) && (
        <div className={`flex items-start justify-between border-b border-gray-100 ${padding === 'none' ? 'p-6' : paddings[padding]}`}>
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={paddings[padding]}>
        {children}
      </div>
    </div>
  );
};

// =============================================================================
// 6. PROFESSIONAL NAVIGATION BAR
// =============================================================================

interface NavLink {
  label: string;
  href: string;
  active?: boolean;
}

interface NavigationProps {
  logo: React.ReactNode;
  links: NavLink[];
  actions?: React.ReactNode;
}

export const Navigation: React.FC<NavigationProps> = ({
  logo,
  links,
  actions
}) => {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 font-semibold text-gray-900">
              {logo}
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              {links.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    link.active
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          
          {actions && (
            <div className="flex items-center gap-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

// =============================================================================
// 7. STATUS INDICATOR
// =============================================================================

interface StatusProps {
  status: 'active' | 'inactive' | 'warning' | 'error';
  label?: string;
  showDot?: boolean;
}

export const Status: React.FC<StatusProps> = ({
  status,
  label,
  showDot = true
}) => {
  const statusConfig = {
    active: { color: 'bg-green-500', textColor: 'text-green-700', bgColor: 'bg-green-50', text: 'Active' },
    inactive: { color: 'bg-gray-400', textColor: 'text-gray-700', bgColor: 'bg-gray-50', text: 'Inactive' },
    warning: { color: 'bg-amber-500', textColor: 'text-amber-700', bgColor: 'bg-amber-50', text: 'Warning' },
    error: { color: 'bg-red-500', textColor: 'text-red-700', bgColor: 'bg-red-50', text: 'Error' }
  };

  const config = statusConfig[status];

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.textColor} ${config.bgColor}`}>
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${config.color}`} />
      )}
      {label || config.text}
    </div>
  );
};

// =============================================================================
// 8. USAGE EXAMPLES
// =============================================================================

/*

// Example 1: Dashboard with Metric Cards
export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        logo={<>TrafficMX</>}
        links={[
          { label: 'Dashboard', href: '/dashboard', active: true },
          { label: 'Analytics', href: '/analytics' },
          { label: 'Reports', href: '/reports' }
        ]}
        actions={
          <>
            <Button variant="ghost" size="sm">Sign In</Button>
            <Button variant="primary" size="sm">Get Started</Button>
          </>
        }
      />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Traffic Dashboard</h1>
          <p className="text-gray-600">Real-time monitoring and analytics</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Total Traffic"
            value={561}
            change={12.5}
            trend="up"
            changeLabel="vs. last hour"
            icon={<Activity className="w-5 h-5" />}
          />
          
          <MetricCard
            title="In / Out"
            value="276 / 285"
            change={-3.2}
            trend="down"
            changeLabel="Balance: -9"
            icon={<TrendingUp className="w-5 h-5" />}
          />
          
          <MetricCard
            title="Active Cameras"
            value={4}
            trend="neutral"
            changeLabel="Monitoring 2 avenues"
            icon={<Camera className="w-5 h-5" />}
          />
        </div>
        
        <Card title="Live Data" subtitle="Updated every 5 seconds">
          <DataTable
            data={[
              { camera: 'cam_01', direction: 'North', in: 93, out: 73, status: 'active' },
              { camera: 'cam_02', direction: 'South', in: 77, out: 95, status: 'active' },
              { camera: 'cam_03', direction: 'East', in: 34, out: 27, status: 'active' },
              { camera: 'cam_04', direction: 'West', in: 72, out: 90, status: 'active' }
            ]}
            columns={[
              { key: 'camera', label: 'Camera', sortable: true },
              { key: 'direction', label: 'Direction', sortable: true },
              { key: 'in', label: 'In', sortable: true, align: 'right' },
              { key: 'out', label: 'Out', sortable: true, align: 'right' },
              {
                key: 'status',
                label: 'Status',
                render: (value) => <Status status={value} />
              }
            ]}
          />
        </Card>
      </main>
    </div>
  );
}

// Example 2: Using Badges
<div className="flex gap-2">
  <Badge variant="green">Active</Badge>
  <Badge variant="blue" icon={<Camera className="w-3 h-3" />}>4 Cameras</Badge>
  <Badge variant="amber">High Traffic</Badge>
</div>

// Example 3: Button Group
<div className="flex gap-3">
  <Button variant="primary" icon={<Activity />}>
    Start Monitoring
  </Button>
  <Button variant="secondary">
    View Reports
  </Button>
  <Button variant="ghost" icon={<AlertCircle />}>
    Settings
  </Button>
</div>

*/

// =============================================================================
// 9. CHART STYLING RECOMMENDATIONS
// =============================================================================

/*

For Visx/Recharts/D3 charts, use these color schemes:

export const chartColors = {
  primary: '#3B82F6',      // Blue
  positive: '#22C55E',      // Green
  negative: '#EF4444',      // Red
  neutral: '#71717A',       // Gray
  
  line: '#3B82F6',
  area: 'rgba(59, 130, 246, 0.1)',
  grid: '#F1F3F5',
  axis: '#71717A',
  
  multi: [
    '#3B82F6',  // Blue
    '#22C55E',  // Green
    '#F59E0B',  // Amber
    '#A855F7',  // Purple
    '#06B6D4',  // Cyan
    '#EF4444'   // Red
  ]
};

export const chartConfig = {
  margin: { top: 20, right: 20, bottom: 40, left: 60 },
  
  axis: {
    stroke: '#E4E4E7',
    fontSize: 12,
    fontFamily: 'Inter',
    color: '#71717A'
  },
  
  grid: {
    stroke: '#F1F3F5',
    strokeDasharray: '2,2'
  },
  
  tooltip: {
    background: '#FFFFFF',
    border: '1px solid #E4E4E7',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    borderRadius: '0.5rem',
    padding: '0.75rem'
  }
};

*/

// =============================================================================
// 10. RESPONSIVE UTILITIES
// =============================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

export const useBreakpoint = () => {
  // Implement useMediaQuery hook here
  // Returns current breakpoint: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
};
