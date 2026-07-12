import { trace } from '@opentelemetry/api';

const SENSITIVE_KEYS = new Set([
  'token',
  'jwt',
  'apiKey',
  'api_key',
  'secret',
  'password',
  'service_role',
  'serviceRole',
  'service_role_key',
  'algoliaadminkey',
  'algolia_admin_key',
  'authorization',
  'cookie',
  'email',
  'whatsapp',
  'phone',
  'taxId',
  'tax_id',
]);

function isSensitiveKey(key: string): boolean {
  const lower = key.toLowerCase();
  return SENSITIVE_KEYS.has(lower) || SENSITIVE_KEYS.has(key);
}

function redactValue(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') {
    if (value.length <= 8) return '***';
    return value.slice(0, 3) + '***' + value.slice(-3);
  }
  return '[redacted]';
}

/**
 * Recursively redact sensitive values from log context objects.
 */
export function redact(
  context: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!context) return context;
  const redacted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(context)) {
    if (isSensitiveKey(key)) {
      redacted[key] = redactValue(value);
    } else if (Array.isArray(value)) {
      redacted[key] = value.map((item) =>
        typeof item === 'object' && item !== null ? redact(item as Record<string, unknown>) : item,
      );
    } else if (typeof value === 'object' && value !== null) {
      redacted[key] = redact(value as Record<string, unknown>);
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
}

function buildLogPayload(
  level: string,
  message: string,
  context?: Record<string, unknown>,
): Record<string, unknown> {
  const span = trace.getActiveSpan();
  const traceContext = span
    ? {
        trace_id: span.spanContext().traceId,
        span_id: span.spanContext().spanId,
      }
    : {};
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...traceContext,
    ...redact(context),
  };
}

export const logger = {
  info: (message: string, context?: Record<string, any>) => {
    console.log(JSON.stringify(buildLogPayload('info', message, context)));
  },
  error: (message: string, context?: Record<string, any>) => {
    console.error(JSON.stringify(buildLogPayload('error', message, context)));
  },
};
