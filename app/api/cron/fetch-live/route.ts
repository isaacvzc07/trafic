import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface LiveCount {
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

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const fetchTime = new Date().toISOString();

  try {
    // Fetch live counts from trafic.mx API
    const response = await fetch('https://api.trafic.mx/api/v1/live/counts');

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const liveData: LiveCount[] = await response.json();

    if (!liveData || liveData.length === 0) {
      // Log empty response
      await supabase.from('api_fetch_log').insert({
        fetch_time: fetchTime,
        endpoint: '/api/v1/live/counts',
        status: 'success',
        records_fetched: 0,
        records_inserted: 0,
        response_time_ms: Date.now() - startTime,
      });

      return NextResponse.json({
        message: 'No live data available from API',
        inserted: 0,
      });
    }

    // Update camera metadata with latest names
    const cameraUpdates = liveData.map(item => ({
      camera_id: item.camera_id,
      camera_name: item.camera_name,
      is_active: true,
      updated_at: new Date().toISOString(),
    }));

    await supabase
      .from('camera_metadata')
      .upsert(cameraUpdates, {
        onConflict: 'camera_id',
      });

    // Prepare live snapshot records
    const snapshots = liveData.map(item => ({
      snapshot_time: item.timestamp,
      camera_id: item.camera_id,
      car_in: item.counts.car_in || 0,
      car_out: item.counts.car_out || 0,
      bus_in: item.counts.bus_in || 0,
      bus_out: item.counts.bus_out || 0,
      truck_in: item.counts.truck_in || 0,
      truck_out: item.counts.truck_out || 0,
      total_in: item.total_in,
      total_out: item.total_out,
    }));

    // Insert live snapshots
    const { data: insertedData, error: insertError } = await supabase
      .from('traffic_live_snapshots')
      .upsert(snapshots, {
        onConflict: 'snapshot_time,camera_id',
        ignoreDuplicates: false,
      });

    if (insertError) {
      console.error('Supabase error:', insertError);

      // Log error
      await supabase.from('api_fetch_log').insert({
        fetch_time: fetchTime,
        endpoint: '/api/v1/live/counts',
        status: 'error',
        records_fetched: liveData.length,
        records_inserted: 0,
        records_failed: liveData.length,
        response_time_ms: Date.now() - startTime,
        error_message: insertError.message,
        error_details: insertError,
      });

      return NextResponse.json(
        { error: 'Database error', details: insertError.message },
        { status: 500 }
      );
    }

    // Log successful fetch
    await supabase.from('api_fetch_log').insert({
      fetch_time: fetchTime,
      endpoint: '/api/v1/live/counts',
      status: 'success',
      records_fetched: liveData.length,
      records_inserted: snapshots.length,
      records_updated: 0,
      records_failed: 0,
      response_time_ms: Date.now() - startTime,
    });

    // Check for anomalies (high congestion)
    const anomalies = [];
    for (const snapshot of snapshots) {
      const netFlow = snapshot.total_in - snapshot.total_out;

      // Detect high congestion (net flow > 30)
      if (Math.abs(netFlow) > 30) {
        anomalies.push({
          detected_at: snapshot.snapshot_time,
          camera_id: snapshot.camera_id,
          anomaly_type: netFlow > 0 ? 'congestion' : 'unusual_pattern',
          severity: Math.abs(netFlow) > 50 ? 'high' : 'medium',
          reference_period: snapshot.snapshot_time,
          metric_name: 'net_flow',
          metric_value: netFlow,
          threshold_value: 30,
          deviation_percentage: ((Math.abs(netFlow) - 30) / 30) * 100,
          metadata: {
            total_in: snapshot.total_in,
            total_out: snapshot.total_out,
            car_in: snapshot.car_in,
            car_out: snapshot.car_out,
          },
        });
      }

      // Detect high traffic (total > 100 in 5 minutes)
      if (snapshot.total_in + snapshot.total_out > 100) {
        anomalies.push({
          detected_at: snapshot.snapshot_time,
          camera_id: snapshot.camera_id,
          anomaly_type: 'high_traffic',
          severity: snapshot.total_in + snapshot.total_out > 150 ? 'high' : 'medium',
          reference_period: snapshot.snapshot_time,
          metric_name: 'total_vehicles',
          metric_value: snapshot.total_in + snapshot.total_out,
          threshold_value: 100,
          deviation_percentage:
            ((snapshot.total_in + snapshot.total_out - 100) / 100) * 100,
        });
      }
    }

    // Insert anomalies if detected
    if (anomalies.length > 0) {
      await supabase.from('traffic_anomalies').insert(anomalies);
    }

    return NextResponse.json({
      message: 'Live data fetched and stored successfully',
      snapshots_inserted: snapshots.length,
      cameras_updated: cameraUpdates.length,
      anomalies_detected: anomalies.length,
      timestamp: fetchTime,
      response_time_ms: Date.now() - startTime,
    });
  } catch (error) {
    console.error('Error in fetch-live:', error);

    // Log error
    await supabase.from('api_fetch_log').insert({
      fetch_time: fetchTime,
      endpoint: '/api/v1/live/counts',
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
