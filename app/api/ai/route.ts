import { NextRequest, NextResponse } from 'next/server';
import { generateTrafficInsights, generateSmartAlert, calculateAICostSavings, answerTrafficQuery } from '@/lib/ai/insights-generator';

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();

    switch (action) {
      case 'generateInsights':
        const insights = await generateTrafficInsights(data.liveData, data.historicalData);
        return NextResponse.json({ success: true, data: insights });

      case 'generateAlert':
        const alert = await generateSmartAlert(data.alertData);
        return NextResponse.json({ success: true, data: alert });

      case 'calculateSavings':
        const savings = await calculateAICostSavings(data.trafficData);
        return NextResponse.json({ success: true, data: savings });

      case 'answerQuery':
        const answer = await answerTrafficQuery(data.query, data.availableData);
        return NextResponse.json({ success: true, data: answer });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('AI API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
