'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MessageCircle, Send, Bot, User } from 'lucide-react';
import { answerTrafficQueryClient } from '@/lib/ai/client-service';
import { useTrafficData } from '@/hooks/useTrafficData';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function TrafficChat() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { liveData, historicalData, cameraInsights } = useTrafficData();

  const exampleQueries = [
    "¿Cuál es la hora pico hoy?",
    "¿Cuántos vehículos pasaron hoy vs ayer?",
    "¿Cuándo debería optimizar los semáforos?",
    "¿Cuál es la intersección más congestionada ahora?",
    "¿Cuál es el flujo vehicular promedio?"
  ];

  const handleAskAI = async () => {
    if (!query.trim() || !liveData || !historicalData) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setQuery('');

    try {
      const response = await answerTrafficQueryClient(query, {
        liveData,
        historicalData,
        cameraInsights: cameraInsights || []
      });

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error asking AI:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Lo siento, no pude procesar tu pregunta. Por favor intenta nuevamente.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleExampleQuery = (exampleQuery: string) => {
    setQuery(exampleQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskAI();
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-900">Asistente de Tráfico IA</h3>
        <Badge variant="blue" className="text-xs">GPT-4</Badge>
      </div>

      {/* Chat Messages */}
      <div className="h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium mb-2">¿En qué puedo ayudarte?</p>
            <p className="text-sm text-gray-500">Pregúntame sobre el tráfico, patrones, o recomendaciones</p>
            
            {/* Example Queries */}
            <div className="mt-6 space-y-2">
              <p className="text-xs text-gray-400 font-medium">Ejemplos:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {exampleQueries.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleQuery(example)}
                    className="text-xs px-3 py-1 bg-white border border-gray-300 rounded-full hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString('es-MX', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
                
                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ej: ¿Cuál es la intersección más congestionada ahora?"
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          disabled={loading}
        />
        <Button
          onClick={handleAskAI}
          disabled={loading || !query.trim() || !liveData || !historicalData}
          className="px-4"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Status Bar */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span>📊 Basado en {liveData?.length || 0} puntos de datos en vivo</span>
        <span>🤖 Powered by GPT-4</span>
      </div>
    </Card>
  );
}
