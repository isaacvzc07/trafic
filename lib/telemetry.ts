import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
// import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

// Initialize OpenTelemetry
export function initializeTelemetry() {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 OpenTelemetry: Skipping initialization in development');
    return;
  }

  const traceExporter = new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const sdk = new NodeSDK({
    // resource: new Resource({
    //   [SemanticResourceAttributes.SERVICE_NAME]: 'traffic-dashboard',
    //   [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version || '1.0.0',
    //   [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'production',
    // }),
    traceExporter,
    instrumentations: [getNodeAutoInstrumentations()],
    // sampler: {
    //   // Sample 10% of traces in production, 100% in staging
    //   shouldSample: () => {
    //     const sampleRate = process.env.NODE_ENV === 'production' ? 0.1 : 1.0;
    //     return Math.random() < sampleRate;
    //   },
    // },
  });

  sdk.start();

  console.log('🔍 OpenTelemetry: Initialized and tracing started');

  // Graceful shutdown
  process.on('SIGTERM', () => {
    sdk
      .shutdown()
      .then(() => console.log('🔍 OpenTelemetry: Tracing terminated'))
      .catch((error) => console.error('🔍 OpenTelemetry: Error terminating tracing', error))
      .finally(() => process.exit(0));
  });

  return sdk;
}

// Custom tracing utilities
import { trace, Span, SpanStatusCode } from '@opentelemetry/api';

const tracer = trace.getTracer('traffic-dashboard');

export function createSpan<T>(
  name: string,
  fn: (span: Span) => T,
  attributes?: Record<string, any>
): T {
  return tracer.startActiveSpan(name, (span) => {
    try {
      if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
          span.setAttribute(key, value);
        });
      }
      
      const result = fn(span);
      
      // Handle async functions
      if (result instanceof Promise) {
        return result
          .then((value) => {
            span.setStatus({ code: SpanStatusCode.OK });
            span.end();
            return value;
          })
          .catch((error) => {
            span.recordException(error);
            span.setStatus({ 
              code: SpanStatusCode.ERROR, 
              message: error.message 
            });
            span.end();
            throw error;
          }) as T;
      }
      
      span.setStatus({ code: SpanStatusCode.OK });
      span.end();
      return result;
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ 
        code: SpanStatusCode.ERROR, 
        message: (error as Error).message 
      });
      span.end();
      throw error;
    }
  });
}

// Specific tracing functions for API calls
export function traceAPICall<T>(
  apiName: string,
  method: string,
  fn: () => Promise<T>
): Promise<T> {
  return createSpan(
    `api.${apiName}`,
    async (span) => {
      span.setAttribute('http.method', method);
      span.setAttribute('api.name', apiName);
      
      const startTime = Date.now();
      
      try {
        const result = await fn();
        
        const duration = Date.now() - startTime;
        span.setAttribute('http.response_time_ms', duration);
        span.setAttribute('http.status_code', 200);
        
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        span.setAttribute('http.response_time_ms', duration);
        span.setAttribute('http.status_code', 500);
        throw error;
      }
    }
  );
}

// Database query tracing
export function traceDatabaseQuery<T>(
  queryName: string,
  fn: () => Promise<T>
): Promise<T> {
  return createSpan(
    `db.query.${queryName}`,
    async (span) => {
      span.setAttribute('db.system', 'postgresql');
      span.setAttribute('db.operation', queryName);
      
      const startTime = Date.now();
      
      try {
        const result = await fn();
        
        const duration = Date.now() - startTime;
        span.setAttribute('db.query_duration_ms', duration);
        
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        span.setAttribute('db.query_duration_ms', duration);
        span.recordException(error as Error);
        throw error;
      }
    }
  );
}

// WebSocket event tracing
export function traceWebSocketEvent(
  eventName: string,
  fn: () => void
): void {
  createSpan(
    `websocket.${eventName}`,
    (span) => {
      span.setAttribute('websocket.event', eventName);
      
      try {
        fn();
        span.setStatus({ code: SpanStatusCode.OK });
      } catch (error) {
        span.recordException(error as Error);
        span.setStatus({ 
          code: SpanStatusCode.ERROR, 
          message: (error as Error).message 
        });
        throw error;
      }
    }
  );
}

// Performance monitoring utilities
export class PerformanceMonitor {
  static measureFunction<T>(
    name: string,
    fn: () => T,
    attributes?: Record<string, any>
  ): T {
    return createSpan(name, fn, attributes);
  }

  static startTimer(name: string): () => void {
    const startTime = Date.now();
    
    return () => {
      const duration = Date.now() - startTime;
      
      createSpan(
        `timer.${name}`,
        (span) => {
          span.setAttribute('timer.duration_ms', duration);
          span.end();
        }
      );
    };
  }

  static recordMetric(
    name: string,
    value: number,
    unit: string = 'ms',
    attributes?: Record<string, any>
  ): void {
    createSpan(
      `metric.${name}`,
      (span) => {
        span.setAttribute('metric.name', name);
        span.setAttribute('metric.value', value);
        span.setAttribute('metric.unit', unit);
        
        if (attributes) {
          Object.entries(attributes).forEach(([key, value]) => {
            span.setAttribute(`metric.${key}`, value);
          });
        }
        
        span.end();
      }
    );
  }
}
