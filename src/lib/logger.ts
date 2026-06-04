import { trace } from '@opentelemetry/api';

export const logger = {
  info: (message: string, context?: Record<string, any>) => {
    const span = trace.getActiveSpan();
    const traceContext = span ? {
      trace_id: span.spanContext().traceId,
      span_id: span.spanContext().spanId,
    } : {};
    console.log(JSON.stringify({ level: 'info', message, timestamp: new Date().toISOString(), ...traceContext, ...context }));
  },
  error: (message: string, context?: Record<string, any>) => {
    const span = trace.getActiveSpan();
    const traceContext = span ? {
      trace_id: span.spanContext().traceId,
      span_id: span.spanContext().spanId,
    } : {};
    console.error(JSON.stringify({ level: 'error', message, timestamp: new Date().toISOString(), ...traceContext, ...context }));
  }
};
