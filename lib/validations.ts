import { z } from 'zod';

// Vehicle type validation
export const VehicleTypeSchema = z.enum(['car', 'bus', 'truck']);

// Direction validation
export const DirectionSchema = z.enum(['in', 'out']);

// Live count schema
export const LiveCountSchema = z.object({
  camera_id: z.string().min(1, 'Camera ID is required'),
  camera_name: z.string().min(1, 'Camera name is required'),
  counts: z.object({
    car_in: z.number().optional(),
    car_out: z.number().optional(),
    bus_in: z.number().optional(),
    bus_out: z.number().optional(),
    truck_in: z.number().optional(),
    truck_out: z.number().optional(),
  }),
  total_in: z.number().optional(),
  total_out: z.number().optional(),
  timestamp: z.string().optional(),
});

// Hourly statistic schema
export const HourlyStatisticSchema = z.object({
  period: z.string().optional(),
  hour: z.string().refine((val) => {
    // Try to parse as date - this handles both ISO format and other common datetime formats
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, {
    message: 'Invalid datetime format'
  }).optional(),
  camera_id: z.string().min(1, 'Camera ID is required'),
  vehicle_type: VehicleTypeSchema,
  direction: DirectionSchema,
  count: z.number().int().min(0, 'Count must be non-negative'),
  avg_confidence: z.number().min(0).max(1, 'Confidence must be between 0 and 1').optional(),
});

// Summary statistics schema
export const SummaryStatisticsSchema = z.object({
  start_date: z.string().datetime('Invalid start date format'),
  end_date: z.string().datetime('Invalid end date format'),
  summary: z.record(z.string(), z.object({
    car_in: z.number().int().min(0),
    car_out: z.number().int().min(0),
    bus_in: z.number().int().min(0),
    bus_out: z.number().int().min(0),
    truck_in: z.number().int().min(0),
    truck_out: z.number().int().min(0),
  })),
});

// API response schemas
export const LiveCountsResponseSchema = z.array(LiveCountSchema);

export const HourlyStatisticsResponseSchema = z.object({
  period: z.string(),
  data: z.array(HourlyStatisticSchema),
});

export const HistoricalDataResponseSchema = z.object({
  period: z.string(),
  count: z.number().int().min(0),
  data: z.array(z.object({
    hour: z.string().refine((val) => {
      // Try to parse as date - this handles both ISO format and other common datetime formats
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, {
      message: 'Invalid datetime format'
    }),
    data: z.array(z.object({
      camera_id: z.string(),
      vehicle_type: z.string(),
      direction: z.string(),
      count: z.number().int().min(0),
      avg_confidence: z.number().min(0).max(1),
    })),
  })),
});

// Form validation schemas
export const DateRangeSchema = z.object({
  start: z.string().datetime('Invalid start date').optional(),
  end: z.string().datetime('Invalid end date').optional(),
}).refine(
  (data) => {
    if (data.start && data.end) {
      return new Date(data.start) <= new Date(data.end);
    }
    return true;
  },
  {
    message: 'End date must be after start date',
    path: ['end'],
  }
);

export const CameraFilterSchema = z.object({
  cameraIds: z.array(z.string()).optional(),
  vehicleTypes: z.array(VehicleTypeSchema).optional(),
  directions: z.array(DirectionSchema).optional(),
});

export const TimeRangeSchema = z.enum(['24h', 'today', 'yesterday', '7d', '30d']);

// Export types
export type LiveCount = z.infer<typeof LiveCountSchema>;
export type HourlyStatistic = z.infer<typeof HourlyStatisticSchema>;
export type SummaryStatistics = z.infer<typeof SummaryStatisticsSchema>;
export type DateRange = z.infer<typeof DateRangeSchema>;
export type CameraFilter = z.infer<typeof CameraFilterSchema>;
export type TimeRange = z.infer<typeof TimeRangeSchema>;

// Validation functions
export const validateLiveCount = (data: unknown) => LiveCountSchema.safeParse(data);
export const validateHourlyStatistic = (data: unknown) => HourlyStatisticSchema.safeParse(data);
export const validateSummaryStatistics = (data: unknown) => SummaryStatisticsSchema.safeParse(data);
export const validateDateRange = (data: unknown) => DateRangeSchema.safeParse(data);
export const validateCameraFilter = (data: unknown) => CameraFilterSchema.safeParse(data);

// API response validation
export const validateLiveCountsResponse = (data: unknown) => LiveCountsResponseSchema.safeParse(data);
export const validateHourlyStatisticsResponse = (data: unknown) => HourlyStatisticsResponseSchema.safeParse(data);
export const validateHistoricalDataResponse = (data: unknown) => HistoricalDataResponseSchema.safeParse(data);
