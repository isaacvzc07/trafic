import OpenAI from 'openai';

// Check if API key is available
const openaiApiKey = process.env.OPENAI_API_KEY;
if (!openaiApiKey) {
  console.warn('OpenAI API key not found. AI features will be disabled.');
}

const openai = openaiApiKey ? new OpenAI({ 
  apiKey: openaiApiKey,
}) : null;

export interface TrafficInsight {
  insights: string[];
  recommendations: string[];
  prediction: string;
  costImpact: {
    fuelSavings: string;
    timeSavings: string;
    emissionsReduction: string;
  };
}

export async function generateTrafficInsights(
  liveData: any[], 
  historicalData: any[]
): Promise<string> {
  try {
    if (!openai) {
      return "❌ Funciones de IA no disponibles. Por favor configure la clave de API de OpenAI.";
    }

    const prompt = `
Analiza estos datos de tráfico para funcionarios municipales de Chihuahua:

DATOS ACTUALES:
${JSON.stringify(liveData.slice(0, 10), null, 2)}

PATRONES HISTÓRICOS:
${JSON.stringify(historicalData.slice(0, 20), null, 2)}

Proporciona un resumen ejecutivo en español con:
1. 3 insights clave sobre las condiciones actuales de tráfico
2. 2 recomendaciones específicas para acción inmediata
3. 1 predicción para las próximas 2 horas
4. Análisis de impacto económico (combustible, tiempo, emisiones)

Sé específico con números y proporciona insights accionables.
Usa un tono profesional pero accesible.
Incluye emojis relevantes para mayor claridad.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1000,
    });

    return response.choices[0].message.content || 'No se pudo generar el análisis';
  } catch (error) {
    console.error('Error generating traffic insights:', error);
    throw new Error('Error al generar insights de tráfico con IA');
  }
}

export async function generateSmartAlert(alertData: {
  camera_id: string;
  current_count: number;
  threshold: number;
  timestamp: string;
}) {
  try {
    if (!openai) {
      return {
        alertTitle: "IA No Disponible",
        recommendation: "Configure la clave de API de OpenAI",
        resolutionTime: "N/A",
        alternativeRoutes: [],
        urgency: "baja"
      };
    }

    const prompt = `
Genera una alerta inteligente para tráfico en Chihuahua:

DATOS:
- Cámara: ${alertData.camera_id}
- Umbral: ${alertData.threshold}
- Hora: ${alertData.timestamp}
- Vehículos actuales: ${alertData.current_count}

Genera una respuesta JSON con:
{
  "alertTitle": "Título de alerta (máx 5 palabras)",
  "recommendation": "Recomendación específica (1 oración)",
  "resolutionTime": "Tiempo estimado de resolución",
  "alternativeRoutes": ["Ruta alternativa 1", "Ruta alternativa 2"],
  "urgency": "alta|media|baja"
}

Sé específico y accionable.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Error generating smart alert:', error);
    throw new Error('Error al generar alerta inteligente');
  }
}

export async function calculateAICostSavings(trafficData: any[]) {
  try {
    if (!openai) {
      return {
        dailyFuelSavings: "No disponible",
        timeSavingsHours: "No disponible",
        co2ReductionKg: "No disponible",
        optimizationRecommendations: ["Configure la API de OpenAI"],
        roiProjection: "No disponible",
        weeklySavings: "No disponible"
      };
    }

    const prompt = `
Calcula el impacto económico para la ciudad de Chihuahua basado en:

Datos de tráfico: ${JSON.stringify(trafficData.slice(0, 15), null, 2)}

Proporciona en formato JSON:
{
  "dailyFuelSavings": "Ahorro potencial en combustible (MXN)",
  "timeSavingsHours": "Ahorro de tiempo para ciudadanos (horas)",
  "co2ReductionKg": "Reducción estimada de CO2 (kg)",
  "optimizationRecommendations": ["Recomendación 1", "Recomendación 2", "Recomendación 3"],
  "roiProjection": "Proyección de ROI para optimización de semáforos",
  "weeklySavings": "Ahorro semanal estimado (MXN)"
}

Usa pesos mexicanos y unidades métricas. Sé específico con números y basado en datos reales.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Error calculating cost savings:', error);
    throw new Error('Error al calcular ahorros con IA');
  }
}

export async function answerTrafficQuery(query: string, availableData: {
  liveData: any[];
  historicalData: any[];
  cameraInsights: any[];
}) {
  try {
    if (!openai) {
      return "❌ Funciones de IA no disponibles. Por favor configure la clave de API de OpenAI para poder responder preguntas sobre el tráfico.";
    }

    const prompt = `
Eres un asistente de análisis de tráfico IA para la ciudad de Chihuahua.

Pregunta: "${query}"

Datos disponibles:
- Datos en vivo: ${JSON.stringify(availableData.liveData.slice(0, 5), null, 2)}
- Datos históricos: ${JSON.stringify(availableData.historicalData.slice(0, 10), null, 2)}
- Insights por cámara: ${JSON.stringify(availableData.cameraInsights.slice(0, 3), null, 2)}

Responde en español con:
1. Respuesta directa a la pregunta
2. Datos específicos y números relevantes
3. 1-2 recomendaciones accionables
4. Tono profesional pero accesible

Sé específico y basado en los datos proporcionados.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 800,
    });

    return response.choices[0].message.content || 'No pude procesar tu pregunta';
  } catch (error) {
    console.error('Error answering traffic query:', error);
    throw new Error('Error al procesar pregunta de tráfico');
  }
}
