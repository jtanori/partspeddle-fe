import { NextResponse } from 'next/server';

export interface ApiErrorEnvelope {
  error: string;
  details?: Array<{ path: string; message: string }>;
}

/**
 * Return a safe error response to the client. Internal details are kept
 * server-side only and should be logged before calling this helper.
 */
export function safeErrorResponse(
  message: string,
  status: 400 | 401 | 403 | 404 | 405 | 413 | 429 | 500 | 502 = 500,
  details?: Array<{ path: string; message: string }>,
): NextResponse<ApiErrorEnvelope> {
  const body: ApiErrorEnvelope = { error: message };
  if (details && details.length > 0) {
    body.details = details;
  }
  return NextResponse.json(body, { status });
}
