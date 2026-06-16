import { SpecificationCompiler } from '../services/specification.compiler';
import { 
  CompiledSemanticArtifact, 
  ConsistencyReport, 
  EvolutionReport, 
  GovernancePolicy, 
  GovernanceResult,
  PTSVector
} from './types';
import { SnapshotStore } from './snapshot.store';
import { diffGroups, diffFacets, scoreDiff } from './diff.engine';
import { evaluateGovernance } from './governance';
import { evaluatePTS } from './pts.engine';

export class SemanticCompilerGovernanceSystem {
  constructor(
    private compiler: SpecificationCompiler,
    private store: SnapshotStore,
    private policy: GovernancePolicy
  ) {}

  async evaluate(input: {
    listingId: string;
    categoryId: string;
    version: string;
  }): Promise<{
    artifact: CompiledSemanticArtifact;
    consistency: ConsistencyReport;
    evolution: EvolutionReport;
    governance: GovernanceResult;
    pts: PTSVector;
  }> {
    const compiled = await this.compiler.compile(input);

    const artifact: CompiledSemanticArtifact = {
      ...input,
      compiled,
      checksum: 'hash-placeholder',
      metadata: {
        createdAt: new Date().toISOString(),
        compilerVersion: '1.0.0'
      }
    };

    const prev = await this.store.loadPrevious(input);

    const consistency = this.checkConsistency(artifact);
    const evolution = this.checkEvolution(prev, artifact);
    const governance = evaluateGovernance(evolution, this.policy);
    const pts = evaluatePTS(evolution);

    return { artifact, consistency, evolution, governance, pts };
  }

  private checkConsistency(artifact: CompiledSemanticArtifact): ConsistencyReport {
    return { pass: true, diff: null };
  }

  private checkEvolution(
    prev: CompiledSemanticArtifact | null,
    current: CompiledSemanticArtifact
  ): EvolutionReport {
    if (!prev) return { type: "INITIAL", groupDiffs: [], facetDiffs: [], score: { severity: "NONE" }, requiresApproval: false };

    const groupDiffs = diffGroups(prev.compiled.grouped, current.compiled.grouped);
    const facetDiffs = diffFacets(prev.compiled.facets, current.compiled.facets);
    const score = scoreDiff(groupDiffs, facetDiffs);

    return { 
      type: score.severity === "BREAKING" ? "BREAKING" : "SAFE", 
      groupDiffs, 
      facetDiffs, 
      score,
      requiresApproval: score.severity !== "NONE"
    };
  }
}
