import {
  Camera,
  LiveCount,
  VehicleEvent,
  CountingLine,
  HourlyStatistic,
  SummaryStatistics,
} from '@/types/api';

const API_BASE_URL = 'https://api.trafic.mx/api/v1';

export const api = {
  // Get all cameras
  async getCameras(): Promise<Camera[]> {
    const response = await fetch(`${API_BASE_URL}/cameras`, {
      next: { revalidate: 60 }, // Cache for 60 seconds
    });
    if (!response.ok) throw new Error('Failed to fetch cameras');
    return response.json();
  },

  // Get live counts (last 5 minutes by default)
  async getLiveCounts(minutes?: number): Promise<LiveCount[]> {
    const url = minutes
      ? `${API_BASE_URL}/live/counts?minutes=${minutes}`
      : `${API_BASE_URL}/live/counts`;
    const response = await fetch(url, {
      cache: 'no-store', // Always fresh data for live counts
    });
    if (!response.ok) throw new Error('Failed to fetch live counts');
    return response.json();
  },

  // Get live counts for specific camera
  async getLiveCountsByCamera(cameraId: string): Promise<LiveCount> {
    const response = await fetch(`${API_BASE_URL}/live/counts/${cameraId}`, {
      cache: 'no-store',
    });
    if (!response.ok) throw new Error('Failed to fetch camera counts');
    return response.json();
  },

  // Get vehicle events
  async getEvents(params?: {
    limit?: number;
    camera_id?: string;
    vehicle_type?: string;
    direction?: string;
  }): Promise<VehicleEvent[]> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.camera_id) queryParams.append('camera_id', params.camera_id);
    if (params?.vehicle_type) queryParams.append('vehicle_type', params.vehicle_type);
    if (params?.direction) queryParams.append('direction', params.direction);

    const url = `${API_BASE_URL}/events${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await fetch(url, {
      next: { revalidate: 10 },
    });
    if (!response.ok) throw new Error('Failed to fetch events');
    return response.json();
  },

  // Get all counting lines
  async getLines(params?: {
    camera_id?: string;
    enabled_only?: boolean;
  }): Promise<CountingLine[]> {
    const queryParams = new URLSearchParams();
    if (params?.camera_id) queryParams.append('camera_id', params.camera_id);
    if (params?.enabled_only) queryParams.append('enabled_only', 'true');

    const url = `${API_BASE_URL}/lines${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await fetch(url, {
      next: { revalidate: 300 }, // Lines don't change often
    });
    if (!response.ok) throw new Error('Failed to fetch lines');
    return response.json();
  },

  // Get hourly statistics (last 24 hours)
  async getHourlyStatistics(): Promise<HourlyStatistic[]> {
    const response = await fetch(`${API_BASE_URL}/statistics/hourly`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });
    if (!response.ok) throw new Error('Failed to fetch hourly statistics');
    return response.json();
  },

  // Get summary statistics
  async getSummary(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<SummaryStatistics> {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);

    const url = `${API_BASE_URL}/statistics/summary${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await fetch(url, {
      next: { revalidate: 300 },
    });
    if (!response.ok) throw new Error('Failed to fetch summary');
    return response.json();
  },
};
