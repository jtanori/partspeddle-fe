import type { SupabaseClient } from '@supabase/supabase-js';
import type { ReplayStore, ReplayStoreListOptions } from '../../domain/replay/replay-store.port';
import type { SemanticReplayTrace } from '../../domain/replay/types';

export interface SupabaseReplayStoreDeps {
  bucket: string;
  prefix: string;
  getSupabaseClient: () => SupabaseClient;
}

export class SupabaseReplayStore implements ReplayStore {
  constructor(private deps: SupabaseReplayStoreDeps) {}

  private objectKey(traceId: string): string {
    return `${this.deps.prefix}/traces/${traceId}.json`;
  }

  async save(trace: SemanticReplayTrace): Promise<void> {
    const client = this.deps.getSupabaseClient();
    const bucket = client.storage.from(this.deps.bucket);
    const key = this.objectKey(trace.traceId);
    const payload = Buffer.from(JSON.stringify(trace, null, 2));

    const { error } = await bucket.upload(key, payload, {
      contentType: 'application/json',
      upsert: true,
    });

    if (error) {
      throw new Error(`Failed to save SCGS replay trace to Supabase Storage: ${error.message}`);
    }
  }

  async load(traceId: string): Promise<SemanticReplayTrace | null> {
    const client = this.deps.getSupabaseClient();
    const bucket = client.storage.from(this.deps.bucket);
    const key = this.objectKey(traceId);

    const { data, error } = await bucket.download(key);
    if (error) {
      if (error.message?.includes('Not Found') || error.message?.includes('not found')) {
        return null;
      }
      throw new Error(`Failed to load SCGS replay trace from Supabase Storage: ${error.message}`);
    }

    if (!data) return null;
    const text = await data.text();
    return JSON.parse(text) as SemanticReplayTrace;
  }

  async list(options: ReplayStoreListOptions = {}): Promise<SemanticReplayTrace[]> {
    const client = this.deps.getSupabaseClient();
    const bucket = client.storage.from(this.deps.bucket);
    const prefix = `${this.deps.prefix}/traces/`;

    const { data, error } = await bucket.list(prefix, {
      limit: options.limit ?? 100,
      sortBy: { column: 'created_at', order: 'desc' },
    });

    if (error) {
      throw new Error(`Failed to list SCGS replay traces from Supabase Storage: ${error.message}`);
    }

    const objects = (data ?? []).filter((obj) => obj.name.endsWith('.json'));
    const traces = await Promise.all(
      objects.map((obj) => {
        const traceId = obj.name.replace(/\.json$/, '');
        return this.load(traceId);
      }),
    );

    const valid = traces.filter((t): t is SemanticReplayTrace => t !== null);

    return valid.filter((trace) => {
      if (options.listingId && trace.listingId !== options.listingId) return false;
      if (options.categoryId && trace.categoryId !== options.categoryId) return false;
      if (options.environment && trace.metadata.environment !== options.environment) return false;
      if (options.before && trace.metadata.createdAt >= options.before) return false;
      return true;
    });
  }
}
