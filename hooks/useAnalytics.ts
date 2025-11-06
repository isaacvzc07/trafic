'use client';

import { useEffect, useCallback } from 'react';
import { analytics } from '@/providers/PostHogProvider';

export function useAnalytics() {
  // Track session start on mount
  useEffect(() => {
    analytics.trackSessionStart();
    
    // Track session end on unmount
    const startTime = Date.now();
    
    return () => {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      analytics.trackSessionEnd(duration);
    };
  }, []);

  // Track dashboard interactions
  const trackFilterChange = useCallback((filterType: string, value: string) => {
    analytics.trackFilterChange(filterType, value);
  }, []);

  const trackCameraClick = useCallback((cameraId: string, cameraName: string) => {
    analytics.trackCameraClick(cameraId, cameraName);
  }, []);

  const trackTimeRangeChange = useCallback((timeRange: string) => {
    analytics.trackTimeRangeChange(timeRange);
  }, []);

  const trackDataRefresh = useCallback((method: 'manual' | 'auto') => {
    analytics.trackDataRefresh(method);
  }, []);

  const trackFeatureUsage = useCallback((feature: string, action: string) => {
    analytics.trackFeatureUsage(feature, action);
  }, []);

  const trackError = useCallback((error: string, context?: Record<string, any>) => {
    analytics.trackError(error, context);
  }, []);

  const trackExport = useCallback((format: string, dataRange: string) => {
    analytics.trackExport(format, dataRange);
  }, []);

  return {
    trackFilterChange,
    trackCameraClick,
    trackTimeRangeChange,
    trackDataRefresh,
    trackFeatureUsage,
    trackError,
    trackExport,
  };
}

// Hook for tracking component lifecycle
export function useComponentAnalytics(componentName: string) {
  useEffect(() => {
    analytics.trackFeatureUsage(componentName, 'mounted');
    
    return () => {
      analytics.trackFeatureUsage(componentName, 'unmounted');
    };
  }, [componentName]);
}

// Hook for tracking real-time data updates
export function useRealtimeAnalytics() {
  const trackDataUpdate = useCallback((source: 'websocket' | 'polling', cameraCount: number) => {
    analytics.trackFeatureUsage('realtime_data', 'updated');
    
    // Track data source preference
    if (source === 'websocket') {
      analytics.trackFeatureUsage('websocket', 'active');
    } else {
      analytics.trackFeatureUsage('polling', 'active');
    }
    
    // Track camera count
    analytics.trackFilterChange('camera_count', cameraCount.toString());
  }, []);

  return { trackDataUpdate };
}
