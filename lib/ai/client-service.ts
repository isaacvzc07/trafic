// Client-side AI service that calls the API route
export async function callAIService(action: string, data: any) {
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, data }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'AI service error');
    }

    return result.data;
  } catch (error) {
    console.error('AI Service Error:', error);
    throw error;
  }
}

// Specific AI functions for client components
export async function generateTrafficInsightsClient(liveData: any[], historicalData: any[]) {
  return await callAIService('generateInsights', { liveData, historicalData });
}

export async function generateSmartAlertClient(alertData: any) {
  return await callAIService('generateAlert', { alertData });
}

export async function calculateAICostSavingsClient(trafficData: any[]) {
  return await callAIService('calculateSavings', { trafficData });
}

export async function answerTrafficQueryClient(query: string, availableData: any) {
  return await callAIService('answerQuery', { query, availableData });
}
