import { NextRequest, NextResponse } from 'next/server';

/**
 * Unified cron job that runs all data collection tasks
 * This runs every 5 minutes and intelligently decides what to execute
 */
export async function GET(request: NextRequest) {
  const results = {
    live: null as any,
    hourly: null as any,
    daily: null as any,
    timestamp: new Date().toISOString(),
  };

  try {
    const baseUrl = request.nextUrl.origin;

    // 1. ALWAYS fetch live data (every 5 minutes)
    console.log('Fetching live data...');
    const liveResponse = await fetch(`${baseUrl}/api/cron/fetch-live`);
    results.live = await liveResponse.json();

    // 2. Fetch hourly data only on the hour (00 minutes)
    const currentMinute = new Date().getMinutes();
    if (currentMinute < 5) {
      // Run within first 5 minutes of the hour
      console.log('Fetching hourly data...');
      const hourlyResponse = await fetch(`${baseUrl}/api/cron/fetch-data`);
      results.hourly = await hourlyResponse.json();
    } else {
      results.hourly = { skipped: true, reason: 'Not on the hour' };
    }

    // 3. Run daily aggregation only at 1 AM (between 1:00-1:05 AM)
    const currentHour = new Date().getHours();
    if (currentHour === 1 && currentMinute < 5) {
      console.log('Running daily aggregation...');
      const dailyResponse = await fetch(`${baseUrl}/api/cron/aggregate-daily`);
      results.daily = await dailyResponse.json();
    } else {
      results.daily = { skipped: true, reason: 'Not 1 AM' };
    }

    return NextResponse.json({
      success: true,
      results,
      executedAt: results.timestamp,
    });
  } catch (error) {
    console.error('Error in unified cron:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        results,
      },
      { status: 500 }
    );
  }
}
