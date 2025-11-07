import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: '.env.local' });

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanupHistoricalData() {
  try {
    console.log('🔧 Starting database cleanup...');
    
    // Delete all data before November 6, 2025
    // Keep entries from 2025-11-06 onwards
    const cutoffDate = new Date('2025-11-06T00:00:00.000Z').toISOString();
    
    console.log(`📅 Deleting all entries before: ${cutoffDate}`);
    
    // First, let's see what we're deleting
    const { data: oldData, error: fetchError } = await supabase
      .from('traffic_hourly_stats')
      .select('hour, camera_id, count, created_at')
      .lt('hour', cutoffDate)
      .order('hour', { ascending: false })
      .limit(5);
    
    if (fetchError) {
      console.error('❌ Error fetching old data:', fetchError);
      return;
    }
    
    console.log('📊 Sample of data to be deleted:', oldData);
    
    // Count total records to be deleted
    const { count, error: countError } = await supabase
      .from('traffic_hourly_stats')
      .select('*', { count: 'exact', head: true })
      .lt('hour', cutoffDate);
    
    if (countError) {
      console.error('❌ Error counting records:', countError);
      return;
    }
    
    console.log(`🗑️  Total records to delete: ${count}`);
    
    // Delete the old data
    const { error: deleteError } = await supabase
      .from('traffic_hourly_stats')
      .delete()
      .lt('hour', cutoffDate);
    
    if (deleteError) {
      console.error('❌ Error deleting old data:', deleteError);
      return;
    }
    
    console.log('✅ Successfully deleted old historical data');
    
    // Verify what remains
    const { data: remainingData, error: remainingError } = await supabase
      .from('traffic_hourly_stats')
      .select('hour, camera_id, count, created_at')
      .gte('hour', cutoffDate)
      .order('hour', { ascending: false });
    
    if (remainingError) {
      console.error('❌ Error fetching remaining data:', remainingError);
      return;
    }
    
    console.log(`📊 Remaining records (${remainingData.length}):`, remainingData);
    
    console.log('🎉 Database cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the cleanup
cleanupHistoricalData();
