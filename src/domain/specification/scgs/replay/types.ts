import { GroupDiff, FacetDiff } from '../types';
import { RankingExplanation } from '../ranking/ranking.types';

export type SemanticReplayEvent =
  | { type: "GROUP_CHANGE"; step: number; detail: GroupDiff; snapshotBefore: string; snapshotAfter: string; }
  | { type: "FACET_CHANGE"; step: number; detail: FacetDiff; snapshotBefore: string; snapshotAfter: string; }
  | { type: "ORDER_CHANGE"; step: number; groupKey: string; beforeOrder: string[]; afterOrder: string[]; snapshotBefore: string; snapshotAfter: string; }
  | { type: "COMPILER_RUN"; step: number; inputHash: string; outputArtifactHash: string; durationMs: number; }
  | { type: "RANKING_COMPUTED"; step: number; listingId: string; score: number; explanation: RankingExplanation; }
  | { type: "PTS_SHIFT"; step: number; driftScore: number; wasHighDrift: boolean; snapshotBefore: string; snapshotAfter: string; }
  | { type: "CI_VERDICT"; step: number; verdict: "PASS" | "WARN" | "BLOCK"; reasonCodes: string[]; ptsScoreAtDecision: number; snapshotBefore: string; snapshotAfter: string; };

export interface SemanticReplayTrace {
  traceId: string;
  version: string;
  listingId: string;
  categoryId: string;
  compilerVersion: string;
  snapshots: { snapshotId: string; timestamp: string; compiledArtifactHash: string; storageUri: string; }[];
  events: SemanticReplayEvent[];
  metadata: {
    createdAt: string;
    triggeredBy: "CI" | "LOCAL_RUN" | "PRR" | "MANUAL";
    gitCommit: string;
    environment: "ci" | "local";
    schemaVersion: "v1";
  };
}
