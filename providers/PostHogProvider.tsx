'use client';

import { PostHogProvider as PHProvider } from 'posthog-js/react';
import posthog from 'posthog-js';
import { ReactNode, useEffect } from 'react';

if (typeof window !== 'undefined') {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  
  if (posthogKey && posthogKey !== 'your-posthog-key') {
    posthog.init(posthogKey, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      loaded: (posthog) => {
        console.log('PostHog loaded successfully');
      },
      capture_pageview: true,
      capture_pageleave: true,
      debug: process.env.NODE_ENV === 'development',
    });
  } else {
    console.warn('PostHog: Missing or invalid NEXT_PUBLIC_POSTHOG_KEY. Analytics disabled.');
  }
}

interface PostHogProviderProps {
  children: ReactNode;
}

export function PostHogProvider({ children }: PostHogProviderProps) {
  return <PHProvider client={posthog}>{children}</PHProvider>;
}

// Custom hook for tracking events
export function usePostHog() {
  return posthog;
}

// Higher-order component for automatic page tracking
export function withPageTracking(Component: React.ComponentType<any>) {
  return function TrackedComponent(props: any) {
    useEffect(() => {
      // Track page view
      posthog.capture('$pageview', {
        path: window.location.pathname,
        search: window.location.search,
      });
    }, []);

    return <Component {...props} />;
  };
}

// Analytics tracking functions
export const analytics = {
  // Check if PostHog is properly initialized
  isInitialized: () => {
    return posthog.__loaded && process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_KEY !== 'your-posthog-key';
  },

  // Track dashboard interactions
  trackFilterChange: (filterType: string, value: string) => {
    if (analytics.isInitialized()) {
      posthog.capture('dashboard_filter_changed', {
        filter_type: filterType,
        filter_value: value,
      });
    }
  },

  // Track camera interactions
  trackCameraClick: (cameraId: string, cameraName: string) => {
    if (analytics.isInitialized()) {
      posthog.capture('camera_clicked', {
        camera_id: cameraId,
        camera_name: cameraName,
      });
    }
  },

  // Track time range changes
  trackTimeRangeChange: (timeRange: string) => {
    if (analytics.isInitialized()) {
      posthog.capture('time_range_changed', {
        time_range: timeRange,
      });
    }
  },

  // Track data refresh
  trackDataRefresh: (method: 'manual' | 'auto') => {
    if (analytics.isInitialized()) {
      posthog.capture('data_refreshed', {
        refresh_method: method,
      });
    }
  },

  // Track feature usage
  trackFeatureUsage: (feature: string, action: string) => {
    if (analytics.isInitialized()) {
      posthog.capture('feature_used', {
        feature_name: feature,
        action: action,
      });
    }
  },

  // Track errors
  trackError: (error: string, context?: Record<string, any>) => {
    if (analytics.isInitialized()) {
      posthog.capture('error_occurred', {
        error_message: error,
        ...context,
      });
    }
  },

  // Track user session
  trackSessionStart: () => {
    if (analytics.isInitialized()) {
      posthog.capture('session_started', {
        timestamp: new Date().toISOString(),
      });
    }
  },

  trackSessionEnd: (duration: number) => {
    if (analytics.isInitialized()) {
      posthog.capture('session_ended', {
        session_duration_seconds: duration,
      });
    }
  },

  // Track export functionality
  trackExport: (format: string, dataRange: string) => {
    if (analytics.isInitialized()) {
      posthog.capture('data_exported', {
        export_format: format,
        data_range: dataRange,
      });
    }
  },
};
