import { LiveCount, HourlyStatistic } from '@/types/api';

// Export to CSV
export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle nested objects and arrays
        if (typeof value === 'object' && value !== null) {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        // Handle strings with commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  downloadFile(csvContent, `${filename}.csv`, 'text/csv');
}

// Export to JSON
export function exportToJSON(data: any[], filename: string) {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, `${filename}.json`, 'application/json');
}

// Export to PDF (simple text-based PDF)
export function exportToPDF(data: any[], filename: string, title: string = 'Traffic Report') {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Create a simple text report (in a real app, you'd use a PDF library like jsPDF)
  let content = `${title}\n`;
  content += `Generated: ${new Date().toLocaleString()}\n`;
  content += `Total Records: ${data.length}\n\n`;
  
  // Add headers
  const headers = Object.keys(data[0]);
  content += headers.join('\t') + '\n';
  
  // Add separator
  content += headers.map(() => '---').join('\t') + '\n';
  
  // Add data rows
  data.forEach(row => {
    content += headers.map(header => {
      const value = row[header];
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
      }
      return value;
    }).join('\t') + '\n';
  });

  downloadFile(content, `${filename}.txt`, 'text/plain');
}

// Generic file download utility
function downloadFile(content: string, filename: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// Export live counts data
export function exportLiveCounts(data: LiveCount[], format: 'csv' | 'json' | 'pdf') {
  const exportData = data.map(camera => ({
    'Camera ID': camera.camera_id,
    'Camera Name': camera.camera_name,
    'Cars In': camera.counts.car_in,
    'Cars Out': camera.counts.car_out,
    'Buses In': camera.counts.bus_in,
    'Buses Out': camera.counts.bus_out,
    'Trucks In': camera.counts.truck_in,
    'Trucks Out': camera.counts.truck_out,
    'Total In': camera.total_in,
    'Total Out': camera.total_out,
    'Timestamp': camera.timestamp,
  }));

  const filename = `traffic-live-counts-${new Date().toISOString().split('T')[0]}`;

  switch (format) {
    case 'csv':
      exportToCSV(exportData, filename);
      break;
    case 'json':
      exportToJSON(exportData, filename);
      break;
    case 'pdf':
      exportToPDF(exportData, filename, 'Live Traffic Counts Report');
      break;
  }
}

// Export hourly statistics data
export function exportHourlyStats(data: HourlyStatistic[], format: 'csv' | 'json' | 'pdf') {
  const exportData = data.map(stat => ({
    'Period': stat.period,
    'Hour': stat.hour,
    'Camera ID': stat.camera_id,
    'Vehicle Type': stat.vehicle_type,
    'Direction': stat.direction,
    'Count': stat.count,
    'Avg Confidence': stat.avg_confidence,
  }));

  const filename = `traffic-hourly-stats-${new Date().toISOString().split('T')[0]}`;

  switch (format) {
    case 'csv':
      exportToCSV(exportData, filename);
      break;
    case 'json':
      exportToJSON(exportData, filename);
      break;
    case 'pdf':
      exportToPDF(exportData, filename, 'Hourly Traffic Statistics Report');
      break;
  }
}

// Filter data based on criteria
export function filterData<T extends Record<string, any>>(
  data: T[],
  filters: {
    dateRange?: { start?: string; end?: string };
    cameraIds?: string[];
    vehicleTypes?: string[];
    directions?: string[];
  }
): T[] {
  return data.filter(item => {
    // Date range filter
    if (filters.dateRange?.start || filters.dateRange?.end) {
      const itemDate = new Date(item.timestamp || item.hour);
      if (filters.dateRange?.start && itemDate < new Date(filters.dateRange.start)) {
        return false;
      }
      if (filters.dateRange?.end && itemDate > new Date(filters.dateRange.end)) {
        return false;
      }
    }

    // Camera ID filter
    if (filters.cameraIds?.length && !filters.cameraIds.includes(item.camera_id)) {
      return false;
    }

    // Vehicle type filter
    if (filters.vehicleTypes?.length && !filters.vehicleTypes.includes(item.vehicle_type)) {
      return false;
    }

    // Direction filter
    if (filters.directions?.length && !filters.directions.includes(item.direction)) {
      return false;
    }

    return true;
  });
}
