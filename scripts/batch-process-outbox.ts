import { supabaseAdmin } from "../src/lib/supabase-admin";
import { SearchIndexWorker } from "../src/backend/modules/search/application/search-index-worker";
import { logger } from "../src/lib/logger";

async function batchProcessOutbox() {
  const worker = new SearchIndexWorker();
  const BATCH_SIZE = 50;
  let totalProcessed = 0;

  console.log("🚀 Starting batch outbox processing...");

  while (true) {
    const { data: events, error } = await supabaseAdmin
      .from("search_outbox")
      .select("*")
      .eq("processed", false)
      .order("created_at", { ascending: true })
      .limit(BATCH_SIZE);

    if (error) {
      console.error("❌ Error fetching from outbox:", error);
      break;
    }

    if (!events || events.length === 0) {
      console.log("✅ Outbox is empty. Processing complete.");
      break;
    }

    console.log(
      `📦 Processing batch of ${events.length} events (Total so far: ${totalProcessed})...`,
    );

    for (const event of events) {
      try {
        if (
          event.event_type.endsWith("_INSERT") ||
          event.event_type.endsWith("_UPDATE")
        ) {
          await worker.processPartUpdated(event.aggregate_id);
        } else if (event.event_type.endsWith("_DELETE")) {
          await worker.processPartDeleted(event.aggregate_id);
        }

        await supabaseAdmin
          .from("search_outbox")
          .update({ processed: true, processed_at: new Date().toISOString() })
          .eq("id", event.id);
      } catch (err) {
        const errorMsg = (err as Error).message || JSON.stringify(err);
        console.error(`❌ Failed to process event ${event.id}:`, errorMsg);

        // If the part is not found, it likely was deleted before sync.
        // We should mark it as processed to stop retrying.
        if (errorMsg.includes("Part not found")) {
          console.log(
            `⚠️ Part ${event.aggregate_id} not found. Marking event ${event.id} as processed to skip.`,
          );
          await supabaseAdmin
            .from("search_outbox")
            .update({
              processed: true,
              processed_at: new Date().toISOString(),
              last_error: "Skipped: Part not found",
            })
            .eq("id", event.id);
        } else {
          await supabaseAdmin
            .from("search_outbox")
            .update({
              last_error: errorMsg,
              retry_count: (event.retry_count || 0) + 1,
            })
            .eq("id", event.id);
        }
      }
    }

    totalProcessed += events.length;

    // Safety break to avoid infinite loops during dev if something is stuck
    if (totalProcessed > 5000) {
      console.log("⚠️ Safety limit reached. Stopping.");
      break;
    }
  }

  console.log(`✨ Finished processing. Total events: ${totalProcessed}`);
}

batchProcessOutbox().catch(console.error);
