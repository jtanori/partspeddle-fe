import { CompiledSemanticArtifact } from '../types';
import { SemanticReplayTrace } from './types';
import { diffGroups, diffFacets } from '../diff.engine';
import { evaluatePTS } from '../pts.engine';
import { evaluateGovernance } from '../governance';
import { DEFAULT_POLICY } from '../governance';

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
      ...groupDiffs.map((d, i) => ({ step: i, type: "GROUP_CHANGE" as const, detail: d })),
      ...facetDiffs.map((f, i) => ({ step: i + groupDiffs.length, type: "FACET_CHANGE" as const, detail: f })),
      { step: groupDiffs.length + facetDiffs.length, type: "PTS_SHIFT" as const, detail: { driftScore: pts.driftScore, wasHighDrift: pts.highDrift } },
      { step: groupDiffs.length + facetDiffs.length + 1, type: "CI_VERDICT" as const, detail: { status: gov.status, violations: gov.violations } }
    ];

    return {
      version: next.version,
      listingId: next.listingId,
      categoryId: next.categoryId,
      events
    };
  }
}
