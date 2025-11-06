'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DateRangeSchema, TimeRangeSchema, CameraFilterSchema } from '@/lib/validations';
import { Calendar, Filter, Download, X } from 'lucide-react';

// Form schema combining date range, time range, and camera filters
const FilterFormSchema = z.object({
  dateRange: DateRangeSchema,
  timeRange: TimeRangeSchema,
  cameraFilter: CameraFilterSchema,
  exportFormat: z.enum(['csv', 'json', 'pdf']).optional(),
});

type FilterFormData = z.infer<typeof FilterFormSchema>;

interface TrafficFilterFormProps {
  onFiltersChange: (filters: FilterFormData) => void;
  onExport?: (format: 'csv' | 'json' | 'pdf') => void;
  availableCameras?: Array<{ id: string; name: string }>;
}

export default function TrafficFilterForm({ 
  onFiltersChange, 
  onExport, 
  availableCameras = []
}: TrafficFilterFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<FilterFormData>({
    resolver: zodResolver(FilterFormSchema),
    defaultValues: {
      dateRange: {
        start: undefined,
        end: undefined,
      },
      timeRange: '24h',
      cameraFilter: {
        cameraIds: [],
        vehicleTypes: [],
        directions: [],
      },
      exportFormat: 'csv',
    },
  });

  // Watch for changes and emit them
  const watchedValues = watch();
  
  React.useEffect(() => {
    if (isDirty) {
      onFiltersChange(watchedValues);
    }
  }, [watchedValues, isDirty, onFiltersChange]);

  const handleReset = () => {
    reset();
    onFiltersChange({
      dateRange: { start: undefined, end: undefined },
      timeRange: '24h',
      cameraFilter: { cameraIds: [], vehicleTypes: [], directions: [] },
      exportFormat: 'csv',
    });
  };

  const handleExport = (format: 'csv' | 'json' | 'pdf') => {
    onExport?.(format);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Traffic Filters</h3>
        </div>
        <button
          onClick={handleReset}
          className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
        >
          <X className="w-4 h-4" />
          Clear Filters
        </button>
      </div>

      <form onSubmit={handleSubmit(() => {})} className="space-y-6">
        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Start Date
            </label>
            <input
              type="datetime-local"
              {...register('dateRange.start')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.dateRange?.start && (
              <p className="text-red-500 text-xs mt-1">{errors.dateRange.start.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              End Date
            </label>
            <input
              type="datetime-local"
              {...register('dateRange.end')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.dateRange?.end && (
              <p className="text-red-500 text-xs mt-1">{errors.dateRange.end.message}</p>
            )}
          </div>
        </div>

        {/* Time Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Time Range
          </label>
          <div className="flex flex-wrap gap-2">
            {['24h', 'today', 'yesterday', '7d', '30d'].map((range) => (
              <label key={range} className="flex items-center">
                <input
                  type="radio"
                  value={range}
                  {...register('timeRange')}
                  className="mr-2"
                />
                <span className="text-sm">
                  {range === '24h' && 'Last 24 Hours'}
                  {range === 'today' && 'Today'}
                  {range === 'yesterday' && 'Yesterday'}
                  {range === '7d' && 'Last 7 Days'}
                  {range === '30d' && 'Last 30 Days'}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Camera Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cameras
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {availableCameras.map((camera) => (
              <label key={camera.id} className="flex items-center">
                <input
                  type="checkbox"
                  value={camera.id}
                  {...register('cameraFilter.cameraIds')}
                  className="mr-2"
                />
                <span className="text-sm">{camera.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Vehicle Types */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vehicle Types
          </label>
          <div className="flex flex-wrap gap-4">
            {['car', 'bus', 'truck'].map((type) => (
              <label key={type} className="flex items-center">
                <input
                  type="checkbox"
                  value={type}
                  {...register('cameraFilter.vehicleTypes')}
                  className="mr-2"
                />
                <span className="text-sm capitalize">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Directions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Traffic Direction
          </label>
          <div className="flex gap-4">
            {['in', 'out'].map((direction) => (
              <label key={direction} className="flex items-center">
                <input
                  type="checkbox"
                  value={direction}
                  {...register('cameraFilter.directions')}
                  className="mr-2"
                />
                <span className="text-sm capitalize">
                  {direction === 'in' ? 'Incoming' : 'Outgoing'}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Export Options */}
        {onExport && (
          <div className="border-t pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Data
            </label>
            <div className="flex items-center gap-4">
              <select
                {...register('exportFormat')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="pdf">PDF Report</option>
              </select>
              
              <button
                type="button"
                onClick={() => handleExport(watchedValues.exportFormat || 'csv')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
