
import { supabaseAdmin } from '../../apps/web/src/lib/supabase-admin';
import { logger } from '../../apps/web/src/lib/logger';

interface WorkerHealthResult {
  totalEventsInOutbox: number;
  pendingEvents: number;
  processedEvents: number;
  failedEvents: number; // Based on non-zero attempts
  totalRetries: number;
  avgProcessingLatencyMs: number | null;
}

async function auditWorkerHealth(): Promise<WorkerHealthResult> {
  logger.info('Starting worker health audit...');

  // Get aggregate data from search_outbox
  const { data: outboxStats, error: outboxError } = await supabaseAdmin
    .from('search_outbox')
    .select('id, processed, attempts');

  if (outboxError) {
    logger.error('Failed to fetch outbox stats', { error: outboxError });
    throw outboxError;
  }
  
  const totalEvents = outboxStats.length;
  const processedEvents = outboxStats.filter(e => e.processed).length;
  const pendingEvents = totalEvents - processedEvents;
  const failedEvents = outboxStats.filter(e => !e.processed && e.attempts > 0).length;
  const totalRetries = outboxStats.reduce((sum, e) => sum + (e.attempts || 0), 0);
  
  // Get aggregate data from search_worker_runs
  const { data: workerRuns, error: workerRunsError } = await supabaseAdmin
    .from('search_worker_runs')
    .select('duration_ms');

  if (workerRunsError) {
    logger.error('Failed to fetch worker run stats', { error: workerRunsError });
    throw workerRunsError;
  }

  const totalDuration = workerRuns.reduce((sum, run) => sum + (run.duration_ms || 0), 0);
  const avgProcessingLatencyMs = workerRuns.length > 0 ? totalDuration / workerRuns.length : null;

  const result: WorkerHealthResult = {
    totalEventsInOutbox: totalEvents,
    pendingEvents,
    processedEvents,
    failedEvents,
    totalRetries,
    avgProcessingLatencyMs: avgProcessingLatencyMs ? parseFloat(avgProcessingLatencyMs.toFixed(2)) : null,
  };

  logger.info('Worker health audit complete', result);
  console.log(JSON.stringify(result, null, 2));
  
  return result;
}

auditWorkerHealth();
