// Utility function to filter historical data to show only recent entries
// This can be used in the UI components to filter data client-side

export function filterRecentData(data: any[], cutoffDate: string = '2025-11-06T00:00:00.000Z') {
  if (!data || !Array.isArray(data)) return [];
  
  return data.filter(record => {
    const recordDate = new Date(record.hour || record.timestamp || record.created_at);
    const cutoff = new Date(cutoffDate);
    return recordDate >= cutoff;
  });
}

// For the historical data hook, we can modify it to filter server-side
export function getRecentDataParams() {
  return {
    start: '2025-11-06T00:00:00.000Z',
    end: new Date().toISOString()
  };
}

// Example usage in components:
// const recentData = filterRecentData(allData);
// const { historicalData } = useHistoricalData('2025-11-06T00:00:00.000Z');
