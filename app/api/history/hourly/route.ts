import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Get date range from query params (expected in ISO format or YYYY-MM-DD)
    const startDate = searchParams.get('start'); // e.g., "2025-01-01" or "2025-01-01T00:00:00Z"
    const endDate = searchParams.get('end');     // e.g., "2025-01-02" or "2025-01-02T23:59:59Z"

    // Build query
    let query = supabase
      .from('traffic_hourly_stats')
      .select('*')
      .order('hour', { ascending: true });

    // Apply date filters if provided
    if (startDate) {
      query = query.gte('hour', startDate);
    }

    if (endDate) {
      query = query.lte('hour', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json(
        { error: 'Database query error', details: error.message },
        { status: 500 }
      );
    }

    // Group data by hour for easier frontend consumption
    const groupedData = (data || []).reduce((acc, record) => {
      const existing = acc.find((item) => item.hour === record.hour);

      if (existing) {
        existing.data.push({
          camera_id: record.camera_id,
          vehicle_type: record.vehicle_type,
          direction: record.direction,
          count: record.count,
          avg_confidence: record.avg_confidence,
        });
      } else {
        acc.push({
          hour: record.hour,
          data: [{
            camera_id: record.camera_id,
            vehicle_type: record.vehicle_type,
            direction: record.direction,
            count: record.count,
            avg_confidence: record.avg_confidence,
          }],
        });
      }

      return acc;
    }, [] as Array<{
      hour: string;
      data: Array<{
        camera_id: string;
        vehicle_type: string;
        direction: string;
        count: number;
        avg_confidence: number;
      }>;
    }>);

    return NextResponse.json({
      period: startDate && endDate
        ? `${startDate} to ${endDate}`
        : 'all available data',
      count: groupedData.length,
      data: groupedData,
    });

  } catch (error) {
    console.error('Error in history/hourly:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
