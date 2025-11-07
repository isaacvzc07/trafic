import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AITrafficInsights } from '@/components/AITrafficInsights';
import { TrafficChat } from '@/components/TrafficChat';
import { AICostSavings } from '@/components/AICostSavings';

// Mock AI functions
jest.mock('@/lib/ai/insights-generator', () => ({
  generateTrafficInsights: jest.fn(),
  generateSmartAlert: jest.fn(),
  calculateAICostSavings: jest.fn(),
  answerTrafficQuery: jest.fn(),
}));

// Mock traffic data hook
jest.mock('@/hooks/useTrafficData', () => ({
  useTrafficData: () => ({
    liveData: [
      { camera_id: 'cam_01', count: 150, hour: '2025-11-06T14:00:00Z' },
      { camera_id: 'cam_02', count: 200, hour: '2025-11-06T14:00:00Z' }
    ],
    historicalData: [
      { camera_id: 'cam_01', count: 120, hour: '2025-11-05T14:00:00Z' },
      { camera_id: 'cam_02', count: 180, hour: '2025-11-05T14:00:00Z' }
    ],
    cameraInsights: [
      { camera_id: 'cam_01', peak_hour: '14:00', total_vehicles: 500 }
    ],
    isLoading: false
  })
}));

import { 
  generateTrafficInsights, 
  generateSmartAlert, 
  calculateAICostSavings,
  answerTrafficQuery 
} from '@/lib/ai/insights-generator';

const mockGenerateTrafficInsights = generateTrafficInsights as jest.MockedFunction<typeof generateTrafficInsights>;
const mockGenerateSmartAlert = generateSmartAlert as jest.MockedFunction<typeof generateSmartAlert>;
const mockCalculateAICostSavings = calculateAICostSavings as jest.MockedFunction<typeof calculateAICostSavings>;
const mockAnswerTrafficQuery = answerTrafficQuery as jest.MockedFunction<typeof answerTrafficQuery>;

describe('AITrafficInsights Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render AI insights interface correctly', () => {
    render(<AITrafficInsights />);
    
    expect(screen.getByText('Inteligencia Artificial de Tráfico')).toBeInTheDocument();
    expect(screen.getByText('🧠 Análisis generado por IA basado en datos en tiempo real')).toBeInTheDocument();
    expect(screen.getByText('⚡ Generar Insights')).toBeInTheDocument();
    expect(screen.getByText('🚨 Generar Alerta IA')).toBeInTheDocument();
    expect(screen.getByText('💰 Calcular Impacto')).toBeInTheDocument();
  });

  it('should switch between tabs correctly', () => {
    render(<AITrafficInsights />);
    
    // Initially on insights tab
    expect(screen.getByText('⚡ Generar Insights')).toBeInTheDocument();
    
    // Click on alerts tab
    fireEvent.click(screen.getByText('Alertas'));
    expect(screen.getByText('🚨 Alertas inteligentes con recomendaciones específicas')).toBeInTheDocument();
    
    // Click on savings tab
    fireEvent.click(screen.getByText('Ahorros'));
    expect(screen.getByText('💰 Análisis de impacto económico con IA')).toBeInTheDocument();
  });

  it('should generate insights when button is clicked', async () => {
    const mockInsight = '🚗 **Insight 1**: Tráfico pesado detectado\n💡 **Recomendación**: Optimizar semáforos';
    mockGenerateTrafficInsights.mockResolvedValue(mockInsight);

    render(<AITrafficInsights />);
    
    const generateButton = screen.getByText('⚡ Generar Insights');
    fireEvent.click(generateButton);

    expect(mockGenerateTrafficInsights).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ camera_id: 'cam_01' })
      ]),
      expect.arrayContaining([
        expect.objectContaining({ camera_id: 'cam_01' })
      ])
    );

    await waitFor(() => {
      expect(screen.getByText('Análisis Ejecutivo')).toBeInTheDocument();
      expect(screen.getByText(mockInsight)).toBeInTheDocument();
    });
  });

  it('should handle insights generation error', async () => {
    mockGenerateTrafficInsights.mockRejectedValue(new Error('API Error'));

    render(<AITrafficInsights />);
    
    const generateButton = screen.getByText('⚡ Generar Insights');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('❌ Error al generar insights. Por favor intenta nuevamente.')).toBeInTheDocument();
    });
  });

  it('should show loading state during insights generation', async () => {
    mockGenerateTrafficInsights.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<AITrafficInsights />);
    
    const generateButton = screen.getByText('⚡ Generar Insights');
    fireEvent.click(generateButton);

    expect(screen.getByText('🔄 Analizando con IA...')).toBeInTheDocument();
    expect(generateButton).toBeDisabled();
  });
});

describe('TrafficChat Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render chat interface correctly', () => {
    render(<TrafficChat />);
    
    expect(screen.getByText('Asistente de Tráfico IA')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej: ¿Cuál es la intersección más congestionada ahora?')).toBeInTheDocument();
    expect(screen.getByText('¿En qué puedo ayudarte?')).toBeInTheDocument();
  });

  it('should show example queries initially', () => {
    render(<TrafficChat />);
    
    expect(screen.getByText('Ejemplos:')).toBeInTheDocument();
    expect(screen.getByText('¿Cuál es la hora pico hoy?')).toBeInTheDocument();
    expect(screen.getByText('¿Cuántos vehículos pasaron hoy vs ayer?')).toBeInTheDocument();
  });

  it('should send message and receive AI response', async () => {
    const mockResponse = 'La hora pico hoy es entre 14:00-16:00 con 200 vehículos por hora.';
    mockAnswerTrafficQuery.mockResolvedValue(mockResponse);

    render(<TrafficChat />);
    
    const input = screen.getByPlaceholderText('Ej: ¿Cuál es la intersección más congestionada ahora?');
    const sendButton = screen.getByRole('button'); // Send button

    fireEvent.change(input, { target: { value: '¿Cuál es la hora pico hoy?' } });
    fireEvent.click(sendButton);

    expect(mockAnswerTrafficQuery).toHaveBeenCalledWith(
      '¿Cuál es la hora pico hoy?',
      expect.objectContaining({
        liveData: expect.arrayContaining([expect.objectContaining({ camera_id: 'cam_01' })]),
        historicalData: expect.arrayContaining([expect.objectContaining({ camera_id: 'cam_01' })]),
        cameraInsights: expect.arrayContaining([expect.objectContaining({ camera_id: 'cam_01' })])
      })
    );

    await waitFor(() => {
      expect(screen.getByText('¿Cuál es la hora pico hoy?')).toBeInTheDocument();
      expect(screen.getByText(mockResponse)).toBeInTheDocument();
    });
  });

  it('should handle query errors gracefully', async () => {
    mockAnswerTrafficQuery.mockRejectedValue(new Error('API Error'));

    render(<TrafficChat />);
    
    const input = screen.getByPlaceholderText('Ej: ¿Cuál es la intersección más congestionada ahora?');
    const sendButton = screen.getByRole('button');

    fireEvent.change(input, { target: { value: 'test query' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('❌ Lo siento, no pude procesar tu pregunta. Por favor intenta nuevamente.')).toBeInTheDocument();
    });
  });

  it('should use example query when clicked', () => {
    render(<TrafficChat />);
    
    const exampleButton = screen.getByText('¿Cuál es la hora pico hoy?');
    fireEvent.click(exampleButton);

    const input = screen.getByPlaceholderText('Ej: ¿Cuál es la intersección más congestionada ahora?');
    expect(input).toHaveValue('¿Cuál es la hora pico hoy?');
  });

  it('should handle Enter key to send message', async () => {
    const mockResponse = 'Test response';
    mockAnswerTrafficQuery.mockResolvedValue(mockResponse);

    render(<TrafficChat />);
    
    const input = screen.getByPlaceholderText('Ej: ¿Cuál es la intersección más congestionada ahora?');
    
    fireEvent.change(input, { target: { value: 'test query' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(mockAnswerTrafficQuery).toHaveBeenCalledWith('test query', expect.any(Object));
    });
  });
});

describe('AICostSavings Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render cost savings interface correctly', () => {
    render(<AICostSavings />);
    
    expect(screen.getByText('Análisis de Ahorros IA')).toBeInTheDocument();
    expect(screen.getByText('Impacto económico y ambiental del tráfico')).toBeInTheDocument();
    expect(screen.getByText('Calcular Ahorros')).toBeInTheDocument();
    expect(screen.getByText('Calculadora de Impacto Económico')).toBeInTheDocument();
  });

  it('should calculate and display savings', async () => {
    const mockSavings = {
      dailyFuelSavings: '$5,000 MXN',
      timeSavingsHours: '120 horas',
      co2ReductionKg: '50 kg',
      optimizationRecommendations: [
        'Optimizar semáforos en hora pico',
        'Implementar carriles exclusivos'
      ],
      roiProjection: 'ROI de 200% en 12 meses',
      weeklySavings: '$35,000 MXN'
    };

    mockCalculateAICostSavings.mockResolvedValue(mockSavings);

    render(<AICostSavings />);
    
    const calculateButton = screen.getByText('Calcular Ahorros');
    fireEvent.click(calculateButton);

    await waitFor(() => {
      expect(screen.getByText('$5,000 MXN')).toBeInTheDocument();
      expect(screen.getByText('120 horas')).toBeInTheDocument();
      expect(screen.getByText('50 kg')).toBeInTheDocument();
      expect(screen.getByText('ROI de 200% en 12 meses')).toBeInTheDocument();
    });
  });

  it('should show detailed recommendations when toggled', async () => {
    const mockSavings = {
      dailyFuelSavings: '$5,000 MXN',
      timeSavingsHours: '120 horas',
      co2ReductionKg: '50 kg',
      optimizationRecommendations: [
        'Optimizar semáforos en hora pico',
        'Implementar carriles exclusivos'
      ],
      roiProjection: 'ROI de 200% en 12 meses',
      weeklySavings: '$35,000 MXN'
    };

    mockCalculateAICostSavings.mockResolvedValue(mockSavings);

    render(<AICostSavings />);
    
    const calculateButton = screen.getByText('Calcular Ahorros');
    fireEvent.click(calculateButton);

    await waitFor(() => {
      expect(screen.getByText('Ver Detalles')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Ver Detalles'));

    await waitFor(() => {
      expect(screen.getByText('Optimizar semáforos en hora pico')).toBeInTheDocument();
      expect(screen.getByText('Implementar carriles exclusivos')).toBeInTheDocument();
    });
  });

  it('should handle export functionality', async () => {
    const mockSavings = {
      dailyFuelSavings: '$5,000 MXN',
      timeSavingsHours: '120 horas',
      co2ReductionKg: '50 kg',
      optimizationRecommendations: ['Test recommendation'],
      roiProjection: 'Test ROI',
      weeklySavings: '$35,000 MXN'
    };

    mockCalculateAICostSavings.mockResolvedValue(mockSavings);

    // Mock URL.createObjectURL and download
    global.URL.createObjectURL = jest.fn(() => 'mock-url');
    global.URL.revokeObjectURL = jest.fn();
    
    const mockAnchor = {
      href: '',
      download: '',
      click: jest.fn(),
      setAttribute: jest.fn()
    };
    jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any);
    jest.spyOn(document.body, 'appendChild').mockImplementation();
    jest.spyOn(document.body, 'removeChild').mockImplementation();

    render(<AICostSavings />);
    
    const calculateButton = screen.getByText('Calcular Ahorros');
    fireEvent.click(calculateButton);

    await waitFor(() => {
      expect(screen.getByText('Exportar Informe')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Exportar Informe'));

    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(mockAnchor.click).toHaveBeenCalled();
  });

  it('should handle calculation errors gracefully', async () => {
    mockCalculateAICostSavings.mockRejectedValue(new Error('Calculation Error'));

    render(<AICostSavings />);
    
    const calculateButton = screen.getByText('Calcular Ahorros');
    fireEvent.click(calculateButton);

    // Should not crash and should show button again
    await waitFor(() => {
      expect(screen.getByText('Actualizar Análisis')).toBeInTheDocument();
    });
  });
});

describe('AI Components Integration', () => {
  it('should render all AI components without errors', () => {
    const { container } = render(
      <div>
        <AITrafficInsights />
        <TrafficChat />
        <AICostSavings />
      </div>
    );

    expect(container.querySelector('[data-testid="ai-traffic-insights"]') || container).toBeInTheDocument();
    expect(container.querySelector('[data-testid="traffic-chat"]') || container).toBeInTheDocument();
    expect(container.querySelector('[data-testid="ai-cost-savings"]') || container).toBeInTheDocument();
  });

  it('should handle network errors across all components', async () => {
    mockGenerateTrafficInsights.mockRejectedValue(new Error('Network Error'));
    mockAnswerTrafficQuery.mockRejectedValue(new Error('Network Error'));
    mockCalculateAICostSavings.mockRejectedValue(new Error('Network Error'));

    render(
      <div>
        <AITrafficInsights />
        <TrafficChat />
        <AICostSavings />
      </div>
    );

    // Test insights error
    fireEvent.click(screen.getByText('⚡ Generar Insights'));
    await waitFor(() => {
      expect(screen.getByText(/Error al generar insights/)).toBeInTheDocument();
    });

    // Test chat error
    const chatInput = screen.getByPlaceholderText('Ej: ¿Cuál es la intersección más congestionada ahora?');
    fireEvent.change(chatInput, { target: { value: 'test' } });
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText(/no pude procesar tu pregunta/)).toBeInTheDocument();
    });

    // Test savings error
    fireEvent.click(screen.getByText('Calcular Ahorros'));
    await waitFor(() => {
      expect(screen.getByText('Actualizar Análisis')).toBeInTheDocument();
    });
  });
});
