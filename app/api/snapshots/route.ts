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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { camera_id, incident_type, description, snapshot_url } = body;
    
    // Connect to Supabase
    const supabaseUrl = 'https://ehkdfrbzkqcjyfekehyi.supabase.co';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!supabaseKey) {
      throw new Error('Supabase key not configured');
    }
    
    const snapshotData = {
      camera_id,
      incident_type: incident_type || null,
      description: description || null,
      snapshot_url: snapshot_url || null,
      timestamp: new Date().toISOString()
    };
    
    const response = await fetch(`${supabaseUrl}/rest/v1/traffic_camera_snapshots`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(snapshotData)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Supabase error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }
    
    // Handle empty response body
    const responseText = await response.text();
    let savedSnapshot;
    
    try {
      savedSnapshot = responseText ? JSON.parse(responseText) : snapshotData;
    } catch (parseError) {
      savedSnapshot = snapshotData;
    }
    
    return NextResponse.json({
      success: true,
      data: savedSnapshot,
      message: 'Snapshot guardado exitosamente'
    });
    
  } catch (error) {
    console.error('Error saving snapshot:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const snapshotId = searchParams.get('snapshot_id');
    
    if (!snapshotId) {
      throw new Error('snapshot_id parameter is required');
    }
    
    // Connect to Supabase
    const supabaseUrl = 'https://ehkdfrbzkqcjyfekehyi.supabase.co';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!supabaseKey) {
      throw new Error('Supabase key not configured');
    }
    
    const response = await fetch(`${supabaseUrl}/rest/v1/traffic_camera_snapshots?id=eq.${snapshotId}`, {
      method: 'DELETE',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Supabase error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Snapshot eliminado exitosamente'
    });
    
  } catch (error) {
    console.error('Error deleting snapshot:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
