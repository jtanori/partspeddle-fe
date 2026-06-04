import { Request, Response } from 'express';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { logger } from '@/lib/logger';

export const logSearchEventHandler = async (req: Request, res: Response) => {
  try {
    const { userId, query, filters, resultCount, sessionId, latencyMs, traceId, provider, page, resultsReturned } = req.body;

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
// ...

    if (error) throw error;
    res.status(201).json({ success: true });
  } catch (error: any) {
    logger.error('Failed to log search event', { error });
    res.status(500).json({ error: 'Failed to log search event' });
  }
};

export const logSearchClickEventHandler = async (req: Request, res: Response) => {
  try {
    const { searchEventId, partId, position } = req.body;
    
    const { error } = await supabaseAdmin
      .from('search_click_events')
      .insert({
        search_event_id: searchEventId,
        part_id: partId,
        position
      });

    if (error) throw error;
    res.status(201).json({ success: true });
  } catch (error: any) {
    logger.error('Failed to log search click', { error });
    res.status(500).json({ error: 'Failed to log search click' });
  }
};
