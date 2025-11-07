import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { GET, POST } from '@/app/api/cron/ai-summary/route';
import { NextRequest } from 'next/server';

// Mock OpenAI
jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn()
      }
    }
  }))
}));

import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

// Type for OpenAI response
interface MockOpenAIResponse {
  id: string;
  created: number;
  model: string;
  object: string;
  choices: Array<{
    message: {
      content: string | null;
      role: string;
    };
  }>;
}

describe('AI Summary API', () => {
  let mockCreate: jest.MockedFunction<any>;
  let mockSupabaseClient: any;

  beforeEach(() => {
    mockCreate = jest.fn();
    mockSupabaseClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: 1, report_content: 'Test report' },
        error: null
      })
    };

    (createClient as jest.MockedFunction<typeof createClient>).mockReturnValue(mockSupabaseClient);
    (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => ({
      chat: { completions: { create: mockCreate } }
    } as any));
  });

  describe('GET /api/cron/ai-summary', () => {
    it('should generate and store AI weekly report successfully', async () => {
      // Mock OpenAI response
      const mockAIResponse: MockOpenAIResponse = {
        id: 'test-id',
        created: Date.now(),
        model: 'gpt-4',
        object: 'chat.completion',
        choices: [{
          message: {
            content: `# 📈 Informe Semanal de Tráfico - Chihuahua

## 🚗 RESUMEN EJECUTIVO
- **Tráfico total**: 15,234 vehículos procesados
- **Hora pico principal**: 14:00-16:00 hrs
- **Crecimiento vs semana anterior**: +12%

## 📊 ESTADÍSTICAS CLAVE
- **Vehículos diarios promedio**: 2,177
- **Cámara más activa**: cam_01 (Av. Homero)
- **Eficiencia del sistema**: 87%

## 🚨 ÁREAS PROBLEMÁTICAS
- **Av. Homero**: Congestión recurrente en hora pico
- **Av. Industrias**: Flujo irregular durante eventos

## 💡 RECOMENDACIONES
1. Optimizar sincronización de semáforos en Av. Homero
2. Implementar carriles exclusivos durante hora pico
3. Monitorear eventos especiales en Av. Industrias

## 🎯 MÉTRICAS DE ÉXITO
- Reducir tiempo de espera en 20%
- Aumentar flujo vehicular en 15%
- Disminuir emisiones de CO2 en 10%`,
            role: 'assistant'
          }
        }]
      };

      mockCreate.mockResolvedValue(mockAIResponse);

      // Mock Supabase data responses
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'traffic_hourly_stats') {
          return {
            select: jest.fn().mockReturnThis(),
            gte: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({
              data: [
                { camera_id: 'cam_01', count: 150, hour: '2025-11-06T14:00:00Z' },
                { camera_id: 'cam_02', count: 200, hour: '2025-11-06T14:00:00Z' }
              ],
              error: null
            })
          };
        } else if (table === 'traffic_live_snapshots') {
          return {
            select: jest.fn().mockReturnThis(),
            gte: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({
              data: [
                { camera_id: 'cam_01', total_in: 100, total_out: 80, created_at: '2025-11-06T14:00:00Z' }
              ],
              error: null
            })
          };
        } else if (table === 'ai_reports') {
          return {
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { id: 1, report_content: 'Test report' },
              error: null
            })
          };
        }
        return mockSupabaseClient;
      });

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/cron/ai-summary', {
        method: 'GET'
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.report_id).toBe(1);
      expect(data.data_points_analyzed).toBe(3); // 2 hourly + 1 snapshot
      expect(data.generated_at).toBeDefined();

      expect(mockCreate).toHaveBeenCalledWith({
        model: "gpt-4",
        messages: [{ 
          role: "user", 
          content: expect.stringContaining('Genera un informe semanal de tráfico') 
        }],
        temperature: 0.3,
        max_tokens: 2000,
      });
    });

    it('should handle OpenAI API errors', async () => {
      // Mock successful data fetch but OpenAI error
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [{ camera_id: 'cam_01', count: 150 }],
          error: null
        })
      });

      mockCreate.mockRejectedValue(new Error('OpenAI API Error'));

      const request = new NextRequest('http://localhost:3000/api/cron/ai-summary');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('OpenAI API Error');
    });
  });

  describe('POST /api/cron/ai-summary', () => {
    it('should generate custom daily report', async () => {
      const mockAIResponse: MockOpenAIResponse = {
        id: 'test-id',
        created: Date.now(),
        model: 'gpt-4',
        object: 'chat.completion',
        choices: [{
          message: {
            content: 'Daily traffic report: 500 vehicles processed, peak hour 14:00.',
            role: 'assistant'
          }
        }]
      };

      mockCreate.mockResolvedValue(mockAIResponse);

      // Mock daily data
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [{ camera_id: 'cam_01', count: 500, hour: '2025-11-06T14:00:00Z' }],
          error: null
        })
      });

      const requestBody = {
        report_type: 'daily'
      };

      const request = new NextRequest('http://localhost:3000/api/cron/ai-summary', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.report.report_type).toBe('daily');
      expect(data.preview).toContain('Daily traffic report');

      expect(mockCreate).toHaveBeenCalledWith({
        model: "gpt-4",
        messages: [{ 
          role: "user", 
          content: expect.stringContaining('Generate a daily traffic report') 
        }],
        temperature: 0.3,
        max_tokens: 1500,
      });
    });

    it('should handle invalid JSON in request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/cron/ai-summary', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      await expect(POST(request)).rejects.toThrow();
    });

    it('should handle missing report type (should default to daily)', async () => {
      const mockAIResponse: MockOpenAIResponse = {
        id: 'test-id',
        created: Date.now(),
        model: 'gpt-4',
        object: 'chat.completion',
        choices: [{
          message: {
            content: 'Default daily report generated.',
            role: 'assistant'
          }
        }]
      };

      mockCreate.mockResolvedValue(mockAIResponse);

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [{ camera_id: 'cam_01', count: 100 }],
          error: null
        })
      });

      const requestBody = {};

      const request = new NextRequest('http://localhost:3000/api/cron/ai-summary', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.report.report_type).toBe('daily');
    });
  });
});

describe('AI Summary API Integration Tests', () => {
  it('should validate environment variables are present', () => {
    expect(process.env.OPENAI_API_KEY).toBeDefined();
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined();
    expect(process.env.SUPABASE_SERVICE_ROLE_KEY).toBeDefined();
  });

  it('should handle large datasets efficiently', async () => {
    // Test with large dataset
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
      camera_id: `cam_${i % 4}`,
      count: Math.floor(Math.random() * 300),
      hour: new Date(Date.now() - i * 3600000).toISOString()
    }));

    const mockAIResponse: MockOpenAIResponse = {
      id: 'test-id',
      created: Date.now(),
      model: 'gpt-4',
      object: 'chat.completion',
      choices: [{
        message: {
          content: 'Large dataset analysis completed successfully.',
          role: 'assistant'
        }
      }]
    };

    const mockCreate = jest.fn().mockResolvedValue(mockAIResponse);
    const mockSupabaseClient = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: largeDataset,
          error: null
        }),
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: Math.random(), report_content: 'Test report' },
          error: null
        })
      })
    };

    (createClient as jest.MockedFunction<typeof createClient>).mockReturnValue(mockSupabaseClient);
    (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => ({
      chat: { completions: { create: mockCreate } }
    } as any));

    const request = new NextRequest('http://localhost:3000/api/cron/ai-summary');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data_points_analyzed).toBe(1000);
  });
});
