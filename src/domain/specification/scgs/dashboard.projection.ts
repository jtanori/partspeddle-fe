import { CompiledSemanticArtifact, SCGSCIVerdict, PTSVector } from './types';
import { SemanticReplayTrace } from './replay/types';

export interface SCGSReadModel {
  category: string;
  latestVerdict: SCGSCIVerdict;
  stabilityIndex: number;
  driftTrend: {
    labels: string[];
    scores: number[];
  };
  recentViolations: Array<{
    version: string;
    violations: string[];
    timestamp: string;
  }>;
}

export const buildDashboardReadModel = (
  category: string,
  artifacts: CompiledSemanticArtifact[],
  traces: SemanticReplayTrace[],
  ptsVectors: PTSVector[],
  latestVerdict: SCGSCIVerdict
): SCGSReadModel => {
  // Pure projection: Aggregation only, NO domain logic.
  return {
    category,
    latestVerdict,
    stabilityIndex: 100 - (ptsVectors.at(-1)?.driftScore || 0),
    driftTrend: {
      labels: artifacts.map(a => a.version),
      scores: ptsVectors.map(v => v.driftScore)
    },
    recentViolations: traces.flatMap(t => 
      t.events
        .filter(e => e.type === "CI_VERDICT" && e.detail.verdict === "BLOCK")
        .map(e => ({
          version: t.version,
          violations: (e as any).detail.reasonCodes,
          timestamp: t.metadata.createdAt
        }))
    )
  };
};
