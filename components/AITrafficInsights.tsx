'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Brain, TrendingUp, DollarSign, AlertTriangle, MessageCircle, Loader, Zap, AlertCircle } from 'lucide-react';
import { generateTrafficInsightsClient, generateSmartAlertClient, calculateAICostSavingsClient } from '@/lib/ai/client-service';
import { useTrafficData } from '@/hooks/useTrafficData';

export function AITrafficInsights() {
  const [insights, setInsights] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'insights' | 'alerts' | 'savings'>('insights');
  
  const { liveData, historicalData, isLoading } = useTrafficData();

  const handleGenerateInsights = async () => {
    if (!liveData || !historicalData) return;
    
    setLoading(true);
    try {
      const result = await generateTrafficInsightsClient(liveData, historicalData);
      setInsights(result);
    } catch (error) {
      console.error('Error generating insights:', error);
      setInsights('ERROR: Error al generar insights. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAlert = async () => {
    if (!liveData) return;
    
    setLoading(true);
    try {
      const alertData = {
        camera_id: 'cam_01',
        threshold: 100,
        timestamp: new Date().toISOString(),
        current_count: Math.max(...liveData.map(d => d.count || 0))
      };
      
      const result = await generateSmartAlertClient(alertData);
      setRecommendations(result.alertTitle);
    } catch (error) {
      console.error('Error generating alert:', error);
      setRecommendations('ERROR: Error al generar alerta');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateSavings = async () => {
    if (!historicalData) return;
    
    setLoading(true);
    try {
      const result = await calculateAICostSavingsClient(historicalData);
      setRecommendations(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Error calculating savings:', error);
      setRecommendations('ERROR: Error al calcular ahorros');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Brain className="w-6 h-6 text-blue-600" />
          Inteligencia Artificial de Tráfico
        </h3>
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'insights' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('insights')}
          >
            <TrendingUp className="w-4 h-4" />
            Insights
          </Button>
          <Button
            variant={activeTab === 'alerts' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('alerts')}
          >
            <AlertTriangle className="w-4 h-4" />
            Alertas
          </Button>
          <Button
            variant={activeTab === 'savings' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('savings')}
          >
            <DollarSign className="w-4 h-4" />
            Ahorros
          </Button>
        </div>
      </div>

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Brain className="w-4 h-4 text-blue-500" />
              Análisis generado por IA basado en datos en tiempo real
            </p>
            <Button 
              onClick={handleGenerateInsights} 
              disabled={loading || !liveData || !historicalData}
              className="min-w-32"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Analizando con IA...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Generar Insights
                </>
              )}
            </Button>
          </div>
          
          {insights && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-blue-900">Análisis Ejecutivo</h4>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                {insights}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              Alertas inteligentes con recomendaciones específicas
            </p>
            <Button 
              onClick={handleGenerateAlert} 
              disabled={loading || !liveData}
              className="min-w-32"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Generando alerta...
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Generar Alerta IA
                </>
              )}
            </Button>
          </div>
          
          {recommendations && (
            <div className="mt-4 p-4 bg-orange-50 rounded-lg border border border-orange-500">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <h4 className="font-semibold text-orange-900">Recomendación IA</h4>
              </div>
              <p className="text-sm text-gray-700">
                {recommendations}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Savings Tab */}
      {activeTab === 'savings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              Análisis de impacto económico con IA
            </p>
            <Button 
              onClick={handleCalculateSavings} 
              disabled={loading || !historicalData}
              className="min-w-32"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Calculando ahorros...
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Calcular Impacto
                </>
              )}
            </Button>
          </div>
          
          {recommendations && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-600">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-green-900">Análisis Económico IA</h4>
              </div>
              <div className="text-sm text-gray-700 space-y-2">
                <pre className="whitespace-pre-wrap">{recommendations}</pre>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
