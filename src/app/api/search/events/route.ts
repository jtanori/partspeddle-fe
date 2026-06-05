import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const { userId, query, filters, resultCount, sessionId, latencyMs, traceId, provider, page, resultsReturned } = await req.json();

    const { error } = await supabaseAdmin
      .from('search_events')
      .insert({
        user_id: userId,
        query,
        filters,
        result_count: resultCount,
        session_id: sessionId,
        latency_ms: latencyMs,
        trace_id: traceId,
        search_provider: provider,
        page,
        results_returned: resultsReturned,
        zero_results: resultsReturned === 0
      });

    if (error) throw error;
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    logger.error('Failed to log search event', { error });
    return NextResponse.json({ error: 'Failed to log search event' }, { status: 500 });
  }
}
