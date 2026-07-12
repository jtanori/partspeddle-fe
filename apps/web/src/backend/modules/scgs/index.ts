/**
 * SCGS — Semantic Compiler & Governance System
 *
 * Public API surface for the SCGS backend module.
 * All external consumers should import from this barrel.
 */

// Domain — artifact model, policies, diff, PTS
export type {
  CompiledSemanticArtifact,
  LineageId,
  GroupDiff,
  FacetDiff,
  ConsistencyReport,
  EvolutionReport,
  GovernancePolicy,
  GovernanceResult,
  SCGSCIVerdict,
  PTSVector,
  SystemState,
  BehavioralResponse,
} from './domain/compiled-semantic-artifact';

export type {
  ResolvedSpec,
  SpecGroup,
  CompiledSpecificationSet,
} from './domain/compiled-specification-set';

export type { SemanticSpecification } from './domain/semantic-specification';

export { evaluateGovernance, DEFAULT_POLICY } from './domain/governance-policy';
export { evaluatePTS } from './domain/pts';
export { diffGroups, diffFacets, scoreDiff, deepEqual } from './domain/diff';

// Domain — replay
export type { SemanticReplayEvent, SemanticReplayTrace } from './domain/replay/types';
export { SemanticReplayEngine } from './domain/replay/engine';
export { ReplayStore } from './domain/replay/store';
export { ReplayValidator } from './domain/replay/validator';

// Infrastructure — compiler, ranking, governance controller
export type { SpecificationCompiler } from './infrastructure/specification-compiler';
export { SpecificationCompilerImpl } from './infrastructure/specification-compiler';
export { RankingEngine } from './infrastructure/ranking-engine';
export type {
  RankingFeatureFactors,
  RankingContribution,
  RankingExplanation,
  RankedResult,
  RankedArtifact,
} from './infrastructure/ranking-types';
export {
  evaluateSystemState,
  getBehavioralResponse,
} from './infrastructure/governance-controller';

// Application — read models / projections
export type { SCGSReadModel } from './application/build-dashboard-read-model';
export { buildDashboardReadModel } from './application/build-dashboard-read-model';
export { compileListing } from './application/compile-listing';
export { rankArtifacts } from './application/rank-artifacts';
