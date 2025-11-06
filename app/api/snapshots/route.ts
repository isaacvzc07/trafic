import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const cameraId = searchParams.get('camera_id');
    
    // Connect to Supabase
    const supabaseUrl = 'https://ehkdfrbzkqcjyfekehyi.supabase.co';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!supabaseKey) {
      throw new Error('Supabase key not configured');
    }
    
    let query = `${supabaseUrl}/rest/v1/traffic_camera_snapshots?order=timestamp.desc&limit=${limit}`;
    if (cameraId) {
      query += `&camera_id=eq.${cameraId}`;
    }
    
    const response = await fetch(query, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Supabase error: ${response.status} ${response.statusText}`);
    }
    
    const snapshots = await response.json();
    
    return NextResponse.json({
      success: true,
      data: snapshots,
      count: snapshots.length
    });
    
  } catch (error) {
    console.error('Error fetching snapshots:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
