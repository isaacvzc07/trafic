import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface HourlyStatistic {
  hour: string;
  camera_id: string;
  vehicle_type: string;
  direction: string;
  count: number;
  avg_confidence: number;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const fetchTime = new Date().toISOString();

  try {
    // Fetch hourly data from trafic.mx API
    const response = await fetch('https://api.trafic.mx/api/v1/statistics/hourly');

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const apiData = await response.json();
    const hourlyStats: HourlyStatistic[] = apiData.data || [];

    if (!hourlyStats || hourlyStats.length === 0) {
      // Log empty response
      await supabase.from('api_fetch_log').insert({
        fetch_time: fetchTime,
        endpoint: '/api/v1/statistics/hourly',
        status: 'success',
        records_fetched: 0,
        records_inserted: 0,
        response_time_ms: Date.now() - startTime,
      });

      return NextResponse.json({
        message: 'No data available from API',
        inserted: 0
      });
    }

    // Prepare records for insertion
    const records = hourlyStats.map(stat => ({
      hour: stat.hour,
      camera_id: stat.camera_id,
      vehicle_type: stat.vehicle_type,
      direction: stat.direction,
      count: stat.count,
      avg_confidence: stat.avg_confidence || 0,
    }));

    // Insert data into Supabase (using upsert to handle duplicates)
    const { data, error } = await supabase
      .from('traffic_hourly_stats')
      .upsert(records, {
        onConflict: 'hour,camera_id,vehicle_type,direction',
        ignoreDuplicates: false, // Update if exists
      });

    if (error) {
      console.error('Supabase error:', error);

      // Log error
      await supabase.from('api_fetch_log').insert({
        fetch_time: fetchTime,
        endpoint: '/api/v1/statistics/hourly',
        status: 'error',
        records_fetched: hourlyStats.length,
        records_inserted: 0,
        records_failed: records.length,
        response_time_ms: Date.now() - startTime,
        error_message: error.message,
        error_details: error,
      });

      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      );
    }

    // Log successful fetch
    await supabase.from('api_fetch_log').insert({
      fetch_time: fetchTime,
      endpoint: '/api/v1/statistics/hourly',
      status: 'success',
      records_fetched: hourlyStats.length,
      records_inserted: records.length,
      records_updated: 0,
      records_failed: 0,
      response_time_ms: Date.now() - startTime,
    });

    return NextResponse.json({
      message: 'Data fetched and stored successfully',
      inserted: records.length,
      timestamp: fetchTime,
      response_time_ms: Date.now() - startTime,
    });

  } catch (error) {
    console.error('Error in fetch-data:', error);

    // Log error
    await supabase.from('api_fetch_log').insert({
      fetch_time: fetchTime,
      endpoint: '/api/v1/statistics/hourly',
      status: 'error',
      records_fetched: 0,
      records_inserted: 0,
      response_time_ms: Date.now() - startTime,
      error_message: error instanceof Error ? error.message : 'Unknown error',
      error_details: { error: String(error) },
    });

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
