import { NextRequest, NextResponse } from 'next/server';
import { ZodError, ZodSchema, z } from 'zod';
import { safeErrorResponse } from './errors';

export { z };

export interface ValidationErrorDetail {
  path: string;
  message: string;
}

function formatZodError(error: ZodError): ValidationErrorDetail[] {
  return error.issues.map((issue) => ({
    path: issue.path.join('.') || 'root',
    message: issue.message,
  }));
}

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; response: NextResponse };

/**
 * Validate a Route Handler request body against a Zod schema.
 */
export async function validateBody<T>(
  schema: ZodSchema<T>,
  req: NextRequest,
): Promise<ValidationResult<T>> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return {
      success: false,
      response: safeErrorResponse('Invalid JSON body.', 400),
    };
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      response: safeErrorResponse('Validation failed.', 400, formatZodError(parsed.error)),
    };
  }

  return { success: true, data: parsed.data };
}

/**
 * Validate query parameters against a Zod schema. Coerces string values
 * automatically for numeric/boolean fields when the schema expects them.
 */
export function validateQuery<T>(
  schema: ZodSchema<T>,
  searchParams: URLSearchParams,
): ValidationResult<T> {
  const raw: Record<string, unknown> = {};
  searchParams.forEach((value, key) => {
    // Preserve repeated keys as arrays; single values stay as strings.
    const existing = raw[key];
    if (existing === undefined) {
      raw[key] = value;
    } else if (Array.isArray(existing)) {
      existing.push(value);
    } else {
      raw[key] = [existing, value];
    }
  });

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      response: safeErrorResponse('Invalid query parameters.', 400, formatZodError(parsed.error)),
    };
  }

  return { success: true, data: parsed.data };
}

/**
 * Validate dynamic route params against a Zod schema.
 */
export async function validateParams<T>(
  schema: ZodSchema<T>,
  params: Promise<Record<string, string | string[]>>,
): Promise<ValidationResult<T>> {
  const raw = await params;
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      response: safeErrorResponse('Invalid route parameters.', 400, formatZodError(parsed.error)),
    };
  }

  return { success: true, data: parsed.data };
}

/**
 * Guard a route handler against unsupported HTTP methods.
 */
export function methodNotAllowed(allowedMethods: string[]): NextResponse {
  return new NextResponse(
    JSON.stringify({ error: `Method not allowed. Allowed: ${allowedMethods.join(', ')}` }),
    {
      status: 405,
      headers: { Allow: allowedMethods.join(', ') },
    },
  );
}

/**
 * Guard against request bodies larger than the allowed byte limit.
 * Next.js body parser limit is a backstop; this returns a friendlier 413
 * before parsing.
 */
export function checkPayloadSize(req: NextRequest, maxBytes: number): NextResponse | null {
  const contentLength = req.headers.get('content-length');
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    if (!Number.isNaN(size) && size > maxBytes) {
      return safeErrorResponse('Payload too large.', 413);
    }
  }
  return null;
}
