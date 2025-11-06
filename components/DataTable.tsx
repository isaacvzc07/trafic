'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  data: any[];
  columns: Column[];
  className?: string;
  pageSize?: number;
  searchable?: boolean;
}

export function DataTable({ 
  data, 
  columns, 
  className = '',
  pageSize = 10,
  searchable = true 
}: DataTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredData = sortedData.filter(row =>
    Object.values(row).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  const SortIcon = ({ column }: { column: Column }) => {
    if (!column.sortable) return null;
    
    if (sortConfig?.key === column.key) {
      return sortConfig.direction === 'asc' ? 
        <ArrowUp className="w-4 h-4" /> : 
        <ArrowDown className="w-4 h-4" />;
    }
    return <ArrowUpDown className="w-4 h-4 opacity-50" />;
  };

  return (
    <div className={`bg-slate-900 border border-slate-700 rounded-lg overflow-hidden ${className}`}>
      {searchable && (
        <div className="p-4 border-b border-slate-700">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800 border-b border-slate-700">
            <tr>
              {columns.map((column, index) => (
                <motion.th
                  key={column.key}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`
                    px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider
                    ${column.sortable ? 'cursor-pointer hover:bg-slate-700/50' : ''}
                  `}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-2">
                    <span>{column.label}</span>
                    <SortIcon column={column} />
                  </div>
                </motion.th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {paginatedData.map((row, rowIndex) => (
              <motion.tr
                key={rowIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: rowIndex * 0.05 }}
                className={`
                  hover:bg-slate-800/50 transition-colors
                  ${rowIndex % 2 === 0 ? 'bg-slate-900' : 'bg-slate-800/30'}
                `}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700">
          <div className="text-sm text-slate-400">
            Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredData.length)} of {filteredData.length} results
          </div>
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 bg-slate-800 border border-slate-600 rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
            
            <span className="text-sm text-slate-400">
              Page {currentPage} of {totalPages}
            </span>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 bg-slate-800 border border-slate-600 rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
