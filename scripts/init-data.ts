/**
 * Script to initialize database with current traffic data
 * Run this once to populate the database with the last 24 hours of data
 *
 * Usage: npx tsx scripts/init-data.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface HourlyStatistic {
  hour: string;
  camera_id: string;
  vehicle_type: string;
  direction: string;
  count: number;
  avg_confidence: number;
}

async function initializeData() {
  console.log('🚀 Starting data initialization...\n');

  try {
    // Fetch data from trafic.mx API
    console.log('📡 Fetching data from api.trafic.mx...');
    const response = await fetch('https://api.trafic.mx/api/v1/statistics/hourly');

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const apiData = await response.json();
    const hourlyStats: HourlyStatistic[] = apiData.data || [];

    if (!hourlyStats || hourlyStats.length === 0) {
      console.log('⚠️  No data available from API');
      return;
    }

    console.log(`✅ Received ${hourlyStats.length} records from API\n`);

    // Prepare records for insertion
    const records = hourlyStats.map(stat => ({
      hour: stat.hour,
      camera_id: stat.camera_id,
      vehicle_type: stat.vehicle_type,
      direction: stat.direction,
      count: stat.count,
      avg_confidence: stat.avg_confidence || 0,
    }));

    // Insert data into Supabase
    console.log('💾 Inserting data into Supabase...');
    const { data, error } = await supabase
      .from('traffic_hourly_stats')
      .upsert(records, {
        onConflict: 'hour,camera_id,vehicle_type,direction',
        ignoreDuplicates: false,
      });

    if (error) {
      console.error('❌ Supabase error:', error.message);
      throw error;
    }

    console.log(`✅ Successfully inserted/updated ${records.length} records`);

    // Show summary
    const uniqueHours = new Set(hourlyStats.map(s => s.hour));
    const uniqueCameras = new Set(hourlyStats.map(s => s.camera_id));

    console.log('\n📊 Summary:');
    console.log(`   - Hours covered: ${uniqueHours.size}`);
    console.log(`   - Cameras: ${[...uniqueCameras].join(', ')}`);
    console.log(`   - First hour: ${Math.min(...[...uniqueHours].map(h => new Date(h).getTime()))}`);
    console.log(`   - Last hour: ${Math.max(...[...uniqueHours].map(h => new Date(h).getTime()))}`);
    console.log('\n✨ Initialization complete!');

  } catch (error) {
    console.error('\n❌ Error during initialization:');
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run the script
initializeData();
