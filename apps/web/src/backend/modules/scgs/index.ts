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

// Domain — specification framework (Phase 5)
export type {
  SpecificationType,
  SpecificationValidationRule,
  SpecificationDefinition,
  SpecificationGroup,
  CategoryTemplate,
  SpecificationValue,
  SpecificationFrameworkInput,
} from './domain/specification-framework';
export type { SpecificationFrameworkRepository } from './domain/specification-framework-repository';

// Domain — semantic capabilities (Phase 4)
export type {
  TrustProfile,
  TrustLevel,
  TrustSignal,
  TrustSignalName,
  TrustCompilerInput,
} from './domain/trust-profile';
export type {
  CompatibilityConclusion,
  CompatibilityStatus,
  CompatibleVehicle,
  RawCompatibilityEntry,
  CompatibilityCompilerInput,
} from './domain/compatibility-conclusion';
export type {
  FitmentConclusion,
  FitmentStatus,
  FitmentVehicle,
  FitmentCompilerInput,
} from './domain/fitment-conclusion';

export { evaluateGovernance, DEFAULT_POLICY } from './domain/governance-policy';
export { evaluatePTS } from './domain/pts';
export { diffGroups, diffFacets, scoreDiff, deepEqual } from './domain/diff';

// Domain — replay
export type { SemanticReplayEvent, SemanticReplayTrace } from './domain/replay/types';
export type { ReplayStore, ReplayStoreListOptions } from './domain/replay/replay-store.port';
export { SemanticReplayEngine } from './domain/replay/engine';
export { ReplayValidator } from './domain/replay/validator';
export type { CIDecision, CIDecisionInput, CIDecisionStatus } from './domain/governance/ci-decision';
export type { PRRReport, PRRCheck, PRRCheckStatus } from './domain/governance/prr-report';

// Infrastructure — compiler, ranking, governance controller
export type { SpecificationCompiler } from './infrastructure/specification-compiler';
export { SpecificationCompilerImpl } from './infrastructure/specification-compiler';
export { compileTrustProfile } from './infrastructure/trust-compiler';
export {
  compileCompatibility,
  parseYearRange as parseCompatibilityYearRange,
} from './infrastructure/compatibility-compiler';
export { compileFitment } from './infrastructure/fitment-compiler';
export {
  mapSpecificationDefinition,
  mapSpecificationGroups,
  mapCategoryTemplate,
  mapSpecificationValues,
} from './infrastructure/specification-framework-mapper';
export { CatalogSpecificationFrameworkRepository } from './infrastructure/catalog-specification-framework-repository';
export { RankingEngine } from './infrastructure/ranking-engine';
export type {
  RankingFeatureFactors,
  RankingContribution,
  RankingExplanation,
  RankedResult,
  RankedArtifact,
} from './infrastructure/ranking-types';
export { evaluateSystemState, getBehavioralResponse } from './infrastructure/governance-controller';
export { FilesystemReplayStore } from './infrastructure/replay/filesystem-replay-store';
export { SupabaseReplayStore } from './infrastructure/replay/supabase-replay-store';
export { createReplayStore } from './infrastructure/replay/replay-store.factory';
export type { ReplayStoreFactoryEnv } from './infrastructure/replay/replay-store.factory';

// Contract — projection schemas
export {
  searchResultCardSchema,
  facetValueSchema,
  facetViewModelSchema,
  paginationSchema,
  searchMetaSchema,
  searchViewModelSchema,
} from './contract/search-view-model.contract';
export type {
  SearchResultCardModel,
  FacetValueModel,
  FacetViewModel,
  SearchPaginationModel,
  SearchMetaModel,
  SearchViewModel,
} from './contract/search-view-model.contract';

// Application — read models / projections
export type { SCGSReadModel } from './application/build-dashboard-read-model';
export { buildDashboardReadModel } from './application/build-dashboard-read-model';
export { compileListing } from './application/compile-listing';
export type { CompileListingOptions } from './application/compile-listing';
export { rankArtifacts } from './application/rank-artifacts';
export {
  buildSearchViewModel,
  type SearchResultPresentation,
  type BuildSearchViewModelInput,
} from './application/build-search-view-model';
export {
  buildPDPViewModel,
  type PDPViewModelPresentation,
  type BuildPDPViewModelInput,
} from './application/build-pdp-view-model';
export { evaluateGovernanceDecision } from './application/evaluate-governance';
export { replayTrace, type ReplayTraceInput, type ReplayTraceResult } from './application/replay-trace';
export { runPRR, type RunPRRInput } from './application/run-prr';

// Contract — PDP projection schemas
export {
  pdpSpecificationItemSchema,
  pdpSpecificationGroupSchema,
  pdpHeaderSchema,
  pdpPricingSchema,
  pdpInventorySchema,
  pdpSellerSchema,
  pdpFitmentVehicleSchema,
  pdpFitmentSchema,
  pdpBadgeSchema,
  pdpShippingSchema,
  pdpPartSummarySchema,
  pdpDataSchema,
} from './contract/pdp-view-model.contract';
export type {
  PDPSpecificationItemModel,
  PDPSpecificationGroupModel,
  PDPHeaderModel,
  PDPPricingModel,
  PDPInventoryModel,
  PDPSellerModel,
  PDPFitmentVehicleModel,
  PDPFitmentModel,
  PDPBadgeModel,
  PDPShippingModel,
  PDPPartSummaryModel,
  PDPDataModel,
  TabViewModel,
  PDPViewModel,
} from './contract/pdp-view-model.contract';
