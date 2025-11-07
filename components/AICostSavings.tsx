'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Leaf, 
  Target,
  Download,
  Calculator
} from 'lucide-react';
import { calculateAICostSavingsClient } from '@/lib/ai/client-service';
import { useTrafficData } from '@/hooks/useTrafficData';

interface CostSavings {
  dailyFuelSavings: string;
  timeSavingsHours: string;
  co2ReductionKg: string;
  optimizationRecommendations: string[];
  roiProjection: string;
  weeklySavings: string;
}

export function AICostSavings() {
  const [savings, setSavings] = useState<CostSavings | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const { historicalData } = useTrafficData();

  const handleCalculateSavings = async () => {
    if (!historicalData) return;
    
    setLoading(true);
    try {
      const result = await calculateAICostSavingsClient(historicalData);
      setSavings(result);
    } catch (error) {
      console.error('Error calculating savings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!savings) return;
    
    // Create a simple text export for now
    const reportText = `
INFORME DE AHORROS - ANÁLISIS IA
Generado: ${new Date().toLocaleDateString('es-MX')}

AHORRO ECONÓMICO
Ahorro diario en combustible: ${savings.dailyFuelSavings}
Ahorro semanal estimado: ${savings.weeklySavings}
Proyección ROI: ${savings.roiProjection}

AHORRO DE TIEMPO
Tiempo ahorrado para ciudadanos: ${savings.timeSavingsHours}

IMPACTO AMBIENTAL
Reducción de CO2: ${savings.co2ReductionKg}

RECOMENDACIONES
${savings.optimizationRecommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

---
Análisis generado por IA GPT-4
Sistema de Tráfico Inteligente - Chihuahua
    `;
    
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `informe-ahorros-ia-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Calculator className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Análisis de Ahorros IA</h3>
            <p className="text-sm text-gray-600">Impacto económico y ambiental del tráfico</p>
          </div>
        </div>
        <Badge variant="green" className="text-xs">ROI Calculator</Badge>
      </div>

      {!savings ? (
        <div className="text-center py-8">
          <Calculator className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Calculadora de Impacto Económico
          </h4>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Analiza los datos de tráfico con IA para calcular ahorros en combustible, 
            tiempo y emisiones, con proyecciones de ROI para optimización de semáforos.
          </p>
          <Button 
            onClick={handleCalculateSavings} 
            disabled={loading || !historicalData}
            size="lg"
            className="min-w-48"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analizando con IA...
              </>
            ) : (
              <>
                <DollarSign className="w-5 h-5 mr-2" />
                Calcular Ahorros
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <h5 className="font-semibold text-green-900">Ahorro Diario</h5>
              </div>
              <p className="text-2xl font-bold text-green-700">{savings.dailyFuelSavings}</p>
              <p className="text-sm text-green-600">Combustible</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <h5 className="font-semibold text-blue-900">Tiempo Ahorrado</h5>
              </div>
              <p className="text-2xl font-bold text-blue-700">{savings.timeSavingsHours}</p>
              <p className="text-sm text-blue-600">Ciudadanos/día</p>
            </div>

            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="w-5 h-5 text-emerald-600" />
                <h5 className="font-semibold text-emerald-900">CO2 Reducido</h5>
              </div>
              <p className="text-2xl font-bold text-emerald-700">{savings.co2ReductionKg}</p>
              <p className="text-sm text-emerald-600">Kilogramos</p>
            </div>
          </div>

          {/* ROI Projection */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-6 h-6 text-purple-600" />
                <h5 className="font-semibold text-purple-900">Proyección ROI</h5>
              </div>
              <Badge variant="purple" className="text-xs">12 Meses</Badge>
            </div>
            <p className="text-lg font-medium text-purple-800 mb-2">{savings.roiProjection}</p>
            <p className="text-purple-700 font-medium">Ahorro semanal: {savings.weeklySavings}</p>
          </div>

          {/* Recommendations */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-semibold text-gray-900">Recomendaciones de Optimización</h5>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? 'Ocultar' : 'Ver'} Detalles
              </Button>
            </div>
            
            {showDetails && (
              <div className="space-y-2">
                {savings.optimizationRecommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-blue-600">{index + 1}</span>
                    </div>
                    <p className="text-sm text-gray-700">{recommendation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button 
              onClick={handleCalculateSavings} 
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Actualizar Análisis
            </Button>
            <Button 
              onClick={handleExportPDF}
              variant="default"
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar Informe
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
