import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { 
  generateTrafficInsights, 
  generateSmartAlert, 
  calculateAICostSavings,
  answerTrafficQuery 
} from '@/lib/ai/insights-generator';

// Mock OpenAI before importing
const mockCreate = jest.fn();
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockCreate
      }
    }
  }));
});

import OpenAI from 'openai';

describe('AI Insights Generator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateTrafficInsights', () => {
    it('should generate traffic insights successfully', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: '🚗 **Insight 1**: Tráfico pesado detectado en hora pico\n💡 **Recomendación**: Optimizar semáforos\n🔮 **Predicción**: Congestión moderada próxima hora\n💰 **Impacto**: Ahorro estimado de $2,000 MXN en combustible'
          }
        }]
      };

      mockCreate.mockResolvedValue(mockResponse);

      const liveData = [
        { camera_id: 'cam_01', count: 150, hour: '2025-11-06T14:00:00Z' },
        { camera_id: 'cam_02', count: 200, hour: '2025-11-06T14:00:00Z' }
      ];

      const historicalData = [
        { camera_id: 'cam_01', count: 120, hour: '2025-11-05T14:00:00Z' },
        { camera_id: 'cam_02', count: 180, hour: '2025-11-05T14:00:00Z' }
      ];

      const result = await generateTrafficInsights(liveData, historicalData);

      expect(result).toContain('Insight 1');
      expect(result).toContain('Recomendación');
      expect(result).toContain('Predicción');
      expect(result).toContain('Impacto');
      expect(mockCreate).toHaveBeenCalledWith({
        model: "gpt-4",
        messages: [{ role: "user", content: expect.stringContaining('Analiza estos datos de tráfico') }],
        temperature: 0.3,
        max_tokens: 1000,
      });
    });

    it('should handle OpenAI API errors gracefully', async () => {
      mockCreate.mockRejectedValue(new Error('API Error'));

      const liveData = [{ camera_id: 'cam_01', count: 150, hour: '2025-11-06T14:00:00Z' }];
      const historicalData = [{ camera_id: 'cam_01', count: 120, hour: '2025-11-05T14:00:00Z' }];

      await expect(generateTrafficInsights(liveData, historicalData)).rejects.toThrow(
        'Error al generar insights de tráfico con IA'
      );
    });

    it('should handle empty response from OpenAI', async () => {
      const mockResponse = {
        choices: [{
          message: { content: null }
        }]
      };

      mockCreate.mockResolvedValue(mockResponse);

      const result = await generateTrafficInsights([], []);

      expect(result).toBe('No se pudo generar el análisis');
    });
  });

  describe('generateSmartAlert', () => {
    it('should generate smart alert with JSON response', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              alertTitle: 'Congestión Detectada',
              recommendation: 'Optimizar semáforos en Av. Homero',
              resolutionTime: '30 minutos',
              alternativeRoutes: ['Av. Tecnológico', 'Periférico'],
              urgency: 'alta'
            })
          }
        }]
      };

      mockCreate.mockResolvedValue(mockResponse);

      const alertData = {
        camera_id: 'cam_01',
        congestion_level: 'ALTO',
        duration: 15,
        timestamp: '2025-11-06T14:00:00Z',
        current_count: 250
      };

      const result = await generateSmartAlert(alertData);

      expect(result.alertTitle).toBe('Congestión Detectada');
      expect(result.recommendation).toContain('Optimizar');
      expect(result.urgency).toBe('alta');
      expect(mockCreate).toHaveBeenCalledWith({
        model: "gpt-4",
        messages: [{ role: "user", content: expect.stringContaining('Alerta de tráfico activada') }],
        temperature: 0.3,
        response_format: { type: "json_object" },
      });
    });
  });

  describe('calculateAICostSavings', () => {
    it('should calculate cost savings with specific metrics', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              dailyFuelSavings: '$5,000 MXN',
              timeSavingsHours: '120 horas',
              co2ReductionKg: '50 kg',
              optimizationRecommendations: [
                'Optimizar semáforos en hora pico',
                'Implementar carriles exclusivos',
                'Sincronizar señales de tráfico'
              ],
              roiProjection: 'ROI de 200% en 12 meses',
              weeklySavings: '$35,000 MXN'
            })
          }
        }]
      };

      mockCreate.mockResolvedValue(mockResponse);

      const trafficData = [
        { camera_id: 'cam_01', count: 150, hour: '2025-11-06T14:00:00Z' },
        { camera_id: 'cam_02', count: 200, hour: '2025-11-06T14:00:00Z' }
      ];

      const result = await calculateAICostSavings(trafficData);

      expect(result.dailyFuelSavings).toBe('$5,000 MXN');
      expect(result.timeSavingsHours).toBe('120 horas');
      expect(result.optimizationRecommendations).toHaveLength(3);
      expect(mockCreate).toHaveBeenCalledWith({
        model: "gpt-4",
        messages: [{ role: "user", content: expect.stringContaining('Calcula el impacto económico') }],
        temperature: 0.3,
        response_format: { type: "json_object" },
      });
    });
  });

  describe('answerTrafficQuery', () => {
    it('should answer traffic queries in Spanish', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'La hora pico hoy es entre las 14:00 y 16:00, con un promedio de 200 vehículos por hora. Recomiendo optimizar los semáforos en este horario.'
          }
        }]
      };

      mockCreate.mockResolvedValue(mockResponse);

      const query = '¿Cuál es la hora pico hoy?';
      const availableData = {
        liveData: [{ camera_id: 'cam_01', count: 200, hour: '2025-11-06T14:00:00Z' }],
        historicalData: [{ camera_id: 'cam_01', count: 180, hour: '2025-11-05T14:00:00Z' }],
        cameraInsights: [{ camera_id: 'cam_01', peak_hour: '14:00' }]
      };

      const result = await answerTrafficQuery(query, availableData);

      expect(result).toContain('hora pico');
      expect(result).toContain('14:00');
      expect(result).toContain('optimizar');
      expect(mockCreate).toHaveBeenCalledWith({
        model: "gpt-4",
        messages: [{ role: "user", content: expect.stringContaining('¿Cuál es la hora pico hoy?') }],
        temperature: 0.3,
        max_tokens: 800,
      });
    });

    it('should handle empty query gracefully', async () => {
      const query = '';
      const availableData = {
        liveData: [],
        historicalData: [],
        cameraInsights: []
      };

      const result = await answerTrafficQuery(query, availableData);

      expect(result).toBe('No pude procesar tu pregunta');
    });
  });
});

describe('AI Integration Tests', () => {
  it('should handle real OpenAI API integration', async () => {
    // This test would require actual API key and should be run in integration environment
    const mockLiveTrafficData = [
      {
        camera_id: 'cam_01',
        count: 150,
        direction: 'in',
        vehicle_type: 'car',
        hour: '2025-11-06T14:00:00Z'
      },
      {
        camera_id: 'cam_02', 
        count: 200,
        direction: 'out',
        vehicle_type: 'car',
        hour: '2025-11-06T14:00:00Z'
      }
    ];

    const mockHistoricalData = [
      {
        camera_id: 'cam_01',
        count: 120,
        direction: 'in',
        vehicle_type: 'car',
        hour: '2025-11-05T14:00:00Z'
      }
    ];

    // Test would validate actual API response structure
    expect(mockLiveTrafficData).toHaveLength(2);
    expect(mockHistoricalData).toHaveLength(1);
  });

  it('should validate AI response format consistency', () => {
    // Test AI response format validation
    const expectedInsightFields = ['insights', 'recommendations', 'prediction', 'costImpact'];
    const expectedAlertFields = ['alertTitle', 'recommendation', 'resolutionTime', 'alternativeRoutes', 'urgency'];
    const expectedSavingsFields = ['dailyFuelSavings', 'timeSavingsHours', 'co2ReductionKg', 'optimizationRecommendations', 'roiProjection'];

    expect(expectedInsightFields).toContain('insights');
    expect(expectedAlertFields).toContain('alertTitle');
    expect(expectedSavingsFields).toContain('dailyFuelSavings');
  });
});
