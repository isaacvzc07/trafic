// Types based on api.trafic.mx API responses

export interface Camera {
  id: string;
  name: string;
  active: boolean;
  line_x1: number;
  line_y1: number;
  line_x2: number;
  line_y2: number;
  address: string;
}

export interface LiveCount {
  camera_id: string;
  camera_name: string;
  counts: {
    car_in?: number;
    car_out?: number;
    bus_in?: number;
    bus_out?: number;
    truck_in?: number;
    truck_out?: number;
  };
  total_in: number;
  total_out: number;
  timestamp: string;
}

export interface VehicleEvent {
  id: number;
  timestamp: string;
  camera_id: string;
  line_id: string;
  vehicle_type: 'car' | 'bus' | 'truck';
  tracking_id: number;
  direction: 'in' | 'out';
  confidence: number;
  bbox_x: number;
  bbox_y: number;
  bbox_width: number;
  bbox_height: number;
}

export interface CountingLine {
  id: string;
  camera_id: string;
  name: string;
  line_x1: number;
  line_y1: number;
  line_x2: number;
  line_y2: number;
  direction_x: number;
  direction_y: number;
  enabled: boolean;
  color_r: number;
  color_g: number;
  color_b: number;
}

export interface HourlyStatistic {
  period: string;
  hour: string;
  camera_id: string;
  vehicle_type: 'car' | 'bus' | 'truck';
  direction: 'in' | 'out';
  count: number;
  avg_confidence: number;
}

export interface SummaryStatistics {
  start_date: string;
  end_date: string;
  summary: {
    [cameraId: string]: {
      car_in?: number;
      car_out?: number;
      bus_in?: number;
      bus_out?: number;
      truck_in?: number;
      truck_out?: number;
    };
  };
}
