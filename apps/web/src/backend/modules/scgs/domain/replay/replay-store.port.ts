import type { SemanticReplayTrace } from './types';

export interface ReplayStoreListOptions {
  listingId?: string;
  categoryId?: string;
  environment?: string;
  limit?: number;
  before?: string;
}

export interface ReplayStore {
  save(trace: SemanticReplayTrace): Promise<void>;
  load(traceId: string): Promise<SemanticReplayTrace | null>;
  list(options?: ReplayStoreListOptions): Promise<SemanticReplayTrace[]>;
}
