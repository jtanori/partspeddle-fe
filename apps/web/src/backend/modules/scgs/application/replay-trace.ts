import type { CompiledSemanticArtifact } from '../domain/compiled-semantic-artifact';
import type { ReplayStore } from '../domain/replay/replay-store.port';
import { SemanticReplayEngine } from '../domain/replay/engine';
import { ReplayValidator } from '../domain/replay/validator';

export interface ReplayTraceInput {
  previous: CompiledSemanticArtifact;
  next: CompiledSemanticArtifact;
  store: ReplayStore;
  triggeredBy: 'CI' | 'PRR' | 'MANUAL' | 'LOCAL_RUN';
  gitCommit?: string;
  environment?: 'ci' | 'local';
}

export interface ReplayTraceResult {
  traceId: string;
  valid: boolean;
  validation: {
    lossless: boolean;
    hasPTS: boolean;
    hasCI: boolean;
    snapshotIntegrity: boolean;
    ciBinding: boolean;
    ok: boolean;
  };
}

export async function replayTrace(input: ReplayTraceInput): Promise<ReplayTraceResult> {
  const trace = SemanticReplayEngine.reconstruct(input.previous, input.next);

  const traceWithMetadata: typeof trace = {
    ...trace,
    metadata: {
      ...trace.metadata,
      triggeredBy: input.triggeredBy,
      gitCommit: input.gitCommit ?? trace.metadata.gitCommit,
      environment: input.environment ?? trace.metadata.environment,
    },
  };

  await input.store.save(traceWithMetadata);

  const validation = ReplayValidator.validate(input.previous, input.next, traceWithMetadata, {
    checkSnapshotFiles: false,
  });

  return {
    traceId: traceWithMetadata.traceId,
    valid: validation.ok,
    validation,
  };
}
