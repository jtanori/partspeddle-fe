import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAnonServerClient } from '@/lib/supabase-server';
import { validateBody } from '@/lib/api/validation';
import { safeErrorResponse } from '@/lib/api/errors';
import { rateLimit } from '@/lib/api/rate-limit';
import { logger } from '@/lib/logger';

const searchEventSchema = z.object({
  query: z.string().max(1000).optional(),
  filters: z.record(z.unknown()).optional(),
  resultCount: z.number().int().min(0).optional(),
  latencyMs: z.number().optional(),
  traceId: z.string().optional(),
  provider: z.string().optional(),
  page: z.number().int().min(0).optional(),
  resultsReturned: z.number().int().min(0).optional(),
});

export async function POST(req: NextRequest) {
  const rateLimited = rateLimit(req, { keyPrefix: 'search:events', limit: 30, windowSeconds: 60 });
  if (rateLimited) {
    return rateLimited;
  }

  const validated = await validateBody(searchEventSchema, req);
  if (!validated.success) {
    return validated.response;
  }

  const {
    query,
    filters,
    resultCount,
    latencyMs,
    traceId,
    provider,
    page,
    resultsReturned,
  } = validated.data;

  try {
    const supabase = createAnonServerClient();
    const { error } = await supabase.from('search_events').insert({
      query,
      filters,
      result_count: resultCount,
      latency_ms: latencyMs,
      trace_id: traceId,
      search_provider: provider,
      page,
      results_returned: resultsReturned,
      zero_results: resultsReturned === 0,
    });

    if (error) throw error;
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to log search event', { error: message });
    return safeErrorResponse('Failed to log search event', 500);
  }
}
