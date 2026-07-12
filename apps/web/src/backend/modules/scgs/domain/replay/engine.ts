import { CompiledSemanticArtifact } from '../compiled-semantic-artifact';
import { SemanticReplayTrace } from './types';
import { diffGroups, diffFacets } from '../diff';
import { evaluatePTS } from '../pts';
import { evaluateGovernance } from '../governance-policy';
import { DEFAULT_POLICY } from '../governance-policy';

export class SemanticReplayEngine {
  // Purely reconstructs the causal trace from two persisted snapshots
  static reconstruct(prev: CompiledSemanticArtifact, next: CompiledSemanticArtifact): SemanticReplayTrace {
    const groupDiffs = diffGroups(prev.compiled.grouped, next.compiled.grouped);
    const facetDiffs = diffFacets(prev.compiled.facets, next.compiled.facets);

    const evolution = {
        type: "SAFE" as const, // Simplified for trace
        groupDiffs,
        facetDiffs,
        score: { severity: "NONE" as const },
        requiresApproval: false
    };

    const pts = evaluatePTS(evolution);
    const gov = evaluateGovernance(evolution, DEFAULT_POLICY);

    const events = [
      ...groupDiffs.map((d, i) => ({
        step: i,
        type: "GROUP_CHANGE" as const,
        detail: d,
        snapshotBefore: prev.checksum,
        snapshotAfter: next.checksum
      })),
      ...facetDiffs.map((f, i) => ({
        step: i + groupDiffs.length,
        type: "FACET_CHANGE" as const,
        detail: f,
        snapshotBefore: prev.checksum,
        snapshotAfter: next.checksum
      })),
      {
        step: groupDiffs.length + facetDiffs.length,
        type: "PTS_SHIFT" as const,
        driftScore: pts.driftScore,
        wasHighDrift: pts.highDrift,
        snapshotBefore: prev.checksum,
        snapshotAfter: next.checksum
      },
      {
        step: groupDiffs.length + facetDiffs.length + 1,
        type: "CI_VERDICT" as const,
        verdict: (gov.status === "BLOCK" ? "BLOCK" : gov.status === "REVIEW" ? "WARN" : "PASS") as "PASS" | "WARN" | "BLOCK",
        reasonCodes: gov.violations,
        ptsScoreAtDecision: pts.driftScore,
        snapshotBefore: prev.checksum,
        snapshotAfter: next.checksum
      }
    ];

    return {
      traceId: `${prev.version}:${next.version}`,
      version: next.version,
      listingId: next.listingId,
      categoryId: next.categoryId,
      compilerVersion: '1.0.0',
      snapshots: [
        { snapshotId: prev.checksum, timestamp: prev.metadata.createdAt, compiledArtifactHash: prev.checksum, storageUri: `file://${prev.checksum}` },
        { snapshotId: next.checksum, timestamp: next.metadata.createdAt, compiledArtifactHash: next.checksum, storageUri: `file://${next.checksum}` }
      ],
      events,
      metadata: {
        createdAt: new Date().toISOString(),
        triggeredBy: 'LOCAL_RUN',
        gitCommit: 'unknown',
        environment: 'local',
        schemaVersion: 'v1'
      }
    };
  }
}
