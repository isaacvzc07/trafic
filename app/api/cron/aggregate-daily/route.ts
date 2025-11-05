import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const fetchTime = new Date().toISOString();

  try {
    // Get date parameter or use yesterday as default
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get('date');

    const targetDate = dateParam
      ? new Date(dateParam)
      : new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday

    const dateStr = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD

    // Query hourly stats for the target date
    const { data: hourlyData, error: queryError } = await supabase
      .from('traffic_hourly_stats')
      .select('*')
      .gte('hour', `${dateStr}T00:00:00Z`)
      .lt('hour', `${dateStr}T24:00:00Z`);

    if (queryError) {
      throw queryError;
    }

    if (!hourlyData || hourlyData.length === 0) {
      await supabase.from('api_fetch_log').insert({
        fetch_time: fetchTime,
        endpoint: '/api/cron/aggregate-daily',
        status: 'success',
        records_fetched: 0,
        records_inserted: 0,
        response_time_ms: Date.now() - startTime,
      });

      return NextResponse.json({
        message: `No hourly data available for ${dateStr}`,
        date: dateStr,
        summaries_created: 0,
      });
    }

    // Group by camera_id
    const cameraGroups = hourlyData.reduce((acc, record) => {
      if (!acc[record.camera_id]) {
        acc[record.camera_id] = [];
      }
      acc[record.camera_id].push(record);
      return acc;
    }, {} as Record<string, typeof hourlyData>);

    const summaries = [];

    for (const [cameraId, cameraRecords] of Object.entries(cameraGroups)) {
      const records = cameraRecords;
      // Aggregate by vehicle type and direction
      const aggregates = records.reduce(
        (acc, record) => {
          const key = `${record.vehicle_type}_${record.direction}` as keyof typeof acc;
          if (acc[key] !== undefined) {
            acc[key] += record.count;
          }
          return acc;
        },
        {
          car_in: 0,
          car_out: 0,
          bus_in: 0,
          bus_out: 0,
          truck_in: 0,
          truck_out: 0,
        }
      );

      // Calculate totals
      const totalIn =
        aggregates.car_in + aggregates.bus_in + aggregates.truck_in;
      const totalOut =
        aggregates.car_out + aggregates.bus_out + aggregates.truck_out;

      // Find peak hours
      const hourlyTotalsIn = records.reduce((acc, record) => {
        const hour = new Date(record.hour).getHours();
        if (record.direction === 'in') {
          acc[hour] = (acc[hour] || 0) + record.count;
        }
        return acc;
      }, {} as Record<number, number>);

      const hourlyTotalsOut = records.reduce((acc, record) => {
        const hour = new Date(record.hour).getHours();
        if (record.direction === 'out') {
          acc[hour] = (acc[hour] || 0) + record.count;
        }
        return acc;
      }, {} as Record<number, number>);

      const peakHourIn = Object.entries(hourlyTotalsIn).reduce(
        (max, [hour, count]) => (count > max.count ? { hour: +hour, count } : max),
        { hour: 0, count: 0 }
      );

      const peakHourOut = Object.entries(hourlyTotalsOut).reduce(
        (max, [hour, count]) => (count > max.count ? { hour: +hour, count } : max),
        { hour: 0, count: 0 }
      );

      // Calculate quality metrics
      const confidenceScores = records
        .filter(r => r.avg_confidence !== null)
        .map(r => r.avg_confidence);

      const avgConfidence =
        confidenceScores.length > 0
          ? confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length
          : null;

      // Count unique hours with data
      const uniqueHours = new Set(
        records.map(r => new Date(r.hour).getHours())
      ).size;

      const dataCompleteness = (uniqueHours / 24) * 100;

      summaries.push({
        date: dateStr,
        camera_id: cameraId,
        car_in_total: aggregates.car_in,
        car_out_total: aggregates.car_out,
        bus_in_total: aggregates.bus_in,
        bus_out_total: aggregates.bus_out,
        truck_in_total: aggregates.truck_in,
        truck_out_total: aggregates.truck_out,
        total_in: totalIn,
        total_out: totalOut,
        peak_hour_in: peakHourIn.hour,
        peak_hour_out: peakHourOut.hour,
        peak_hour_value: Math.max(peakHourIn.count, peakHourOut.count),
        avg_confidence: avgConfidence,
        hours_with_data: uniqueHours,
        data_completeness: dataCompleteness,
      });
    }

    // Insert daily summaries
    const { error: insertError } = await supabase
      .from('traffic_daily_summary')
      .upsert(summaries, {
        onConflict: 'date,camera_id',
        ignoreDuplicates: false,
      });

    if (insertError) {
      console.error('Supabase error:', insertError);

      await supabase.from('api_fetch_log').insert({
        fetch_time: fetchTime,
        endpoint: '/api/cron/aggregate-daily',
        status: 'error',
        records_fetched: hourlyData.length,
        records_inserted: 0,
        records_failed: summaries.length,
        response_time_ms: Date.now() - startTime,
        error_message: insertError.message,
        error_details: insertError,
      });

      return NextResponse.json(
        { error: 'Database error', details: insertError.message },
        { status: 500 }
      );
    }

    // Log successful aggregation
    await supabase.from('api_fetch_log').insert({
      fetch_time: fetchTime,
      endpoint: '/api/cron/aggregate-daily',
      status: 'success',
      records_fetched: hourlyData.length,
      records_inserted: summaries.length,
      response_time_ms: Date.now() - startTime,
    });

    // Refresh materialized view for hourly patterns
    try {
      await supabase.rpc('refresh_hourly_patterns');
    } catch (viewError) {
      console.warn('Could not refresh materialized view:', viewError);
      // Non-critical, don't fail the request
    }

    return NextResponse.json({
      message: 'Daily summaries created successfully',
      date: dateStr,
      summaries_created: summaries.length,
      hourly_records_processed: hourlyData.length,
      response_time_ms: Date.now() - startTime,
    });
  } catch (error) {
    console.error('Error in aggregate-daily:', error);

    await supabase.from('api_fetch_log').insert({
      fetch_time: fetchTime,
      endpoint: '/api/cron/aggregate-daily',
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
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
