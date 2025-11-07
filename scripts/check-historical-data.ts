import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: '.env.local' });

// Supabase configuration using the anon key (should work for read operations)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

console.log('🔧 Testing database connection...');
console.log('Supabase URL:', supabaseUrl);
console.log('Anon Key exists:', !!supabaseAnonKey);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAndCleanupData() {
  try {
    // First, let's see what data exists
    console.log('📊 Fetching current data...');
    
    const { data: currentData, error: fetchError } = await supabase
      .from('traffic_hourly_stats')
      .select('hour, camera_id, count, created_at')
      .order('hour', { ascending: false })
      .limit(20);
    
    if (fetchError) {
      console.error('❌ Error fetching data:', fetchError);
      return;
    }
    
    console.log(`📊 Found ${currentData.length} recent records:`);
    currentData.forEach((record, index) => {
      console.log(`${index + 1}. ${record.camera_id} - ${record.hour} - ${record.count} vehicles`);
    });
    
    // Check if there's data before November 6, 2025
    const cutoffDate = '2025-11-06T00:00:00.000Z';
    
    const { data: oldData, error: oldFetchError } = await supabase
      .from('traffic_hourly_stats')
      .select('hour, camera_id, count, created_at')
      .lt('hour', cutoffDate)
      .order('hour', { ascending: false })
      .limit(5);
    
    if (oldFetchError) {
      console.error('❌ Error fetching old data:', oldFetchError);
      return;
    }
    
    console.log(`\n🗑️  Found ${oldData.length} old records (before Nov 6, 2025):`);
    oldData.forEach((record, index) => {
      console.log(`${index + 1}. ${record.camera_id} - ${record.hour} - ${record.count} vehicles`);
    });
    
    if (oldData.length > 0) {
      console.log('\n⚠️  Old data found. You need service role permissions to delete.');
      console.log('Please run the cleanup with service role key or use Supabase dashboard.');
    } else {
      console.log('\n✅ No old data found. Database is already clean!');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the check
checkAndCleanupData();
