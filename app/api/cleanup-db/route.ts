import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Starting database cleanup via API...');
    
    // Delete all data before November 6, 2025
    const cutoffDate = '2025-11-06T00:00:00.000Z';
    
    // First, show what we're deleting
    const { data: oldData, error: fetchError } = await supabase
      .from('traffic_hourly_stats')
      .select('hour, camera_id, count, created_at')
      .lt('hour', cutoffDate)
      .order('hour', { ascending: false });
    
    if (fetchError) {
      console.error('❌ Error fetching old data:', fetchError);
      return NextResponse.json({ 
        success: false, 
        error: 'Error fetching old data: ' + fetchError.message 
      }, { status: 500 });
    }
    
    console.log(`📊 Found ${oldData.length} records to delete:`, oldData);
    
    // Delete the old data
    const { error: deleteError } = await supabase
      .from('traffic_hourly_stats')
      .delete()
      .lt('hour', cutoffDate);
    
    if (deleteError) {
      console.error('❌ Error deleting old data:', deleteError);
      return NextResponse.json({ 
        success: false, 
        error: 'Error deleting old data: ' + deleteError.message 
      }, { status: 500 });
    }
    
    // Verify what remains
    const { data: remainingData, error: remainingError } = await supabase
      .from('traffic_hourly_stats')
      .select('hour, camera_id, count, created_at')
      .gte('hour', cutoffDate)
      .order('hour', { ascending: false })
      .limit(10);
    
    if (remainingError) {
      console.error('❌ Error fetching remaining data:', remainingError);
      return NextResponse.json({ 
        success: false, 
        error: 'Error fetching remaining data: ' + remainingError.message 
      }, { status: 500 });
    }
    
    console.log(`✅ Cleanup completed. Remaining records: ${remainingData.length}`);
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully deleted ${oldData.length} old records`,
      deletedRecords: oldData,
      remainingRecords: remainingData.length,
      sampleRemaining: remainingData
    });
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
