import { supabaseAdmin } from '../src/lib/supabase-admin';
import { SearchIndexWorker } from '../src/backend/modules/search/application/search-index-worker';
import { outboxPendingEvents } from '../src/lib/observability';
import { logger } from '../src/lib/logger';

// Register the callback for the observable gauge
outboxPendingEvents.addCallback(async (result) => {
  const { count } = await supabaseAdmin
    .from('search_outbox')
    .select('*', { count: 'exact', head: true })
    .eq('processed', false);
  result.observe(count || 0);
});

async function processOutbox() {
  const worker = new SearchIndexWorker();
  
  // 1. Get unprocessed events
  const { data: events, error } = await supabaseAdmin
    .from('search_outbox')
    .select('*')
    .eq('processed', false)
    .order('created_at', { ascending: true })
    .limit(100);

  if (error) {
    logger.error('Error fetching from outbox', { error });
    throw error;
  }
  
  if (!events || events.length === 0) {
    logger.info('Outbox is empty. No events to process.');
    return;
  }

  logger.info(`Processing ${events.length} events from outbox.`);

  // 2. Process
  for (const event of events) {
    try {
      if (event.event_type.endsWith('_INSERT') || event.event_type.endsWith('_UPDATE')) {
        await worker.processPartUpdated(event.aggregate_id);
      } else if (event.event_type.endsWith('_DELETE')) {
        await worker.processPartDeleted(event.aggregate_id);
      }
      
      // 3. Mark processed
      await supabaseAdmin
        .from('search_outbox')
        .update({ processed: true, processed_at: new Date().toISOString() })
        .eq('id', event.id);
    } catch (err) {
      logger.error(`Failed to process event ${event.id}`, { error: err });
      // Optionally mark as failed
      await supabaseAdmin
        .from('search_outbox')
        .update({ last_error: (err as Error).message, attempts: (event.attempts || 0) + 1 })
        .eq('id', event.id);
    }
  }
}

processOutbox();
