import { CompiledSpecificationSet } from '../../services/specification.compiler';
export { CompiledSpecificationSet };

export interface CompiledSemanticArtifact {
  listingId: string;
  categoryId: string;
  version: string;
  compiled: CompiledSpecificationSet;
  checksum: string;
  metadata: {
    createdAt: string;
    compilerVersion: string;
  };
}

export interface GroupDiff {
  groupName: string;
  changeType: "ADDED" | "REMOVED" | "ORDER_CHANGED" | "MODIFIED";
  before?: any;
  after?: any;
}

export interface FacetDiff {
  key: string;
  type: "ADDED" | "REMOVED" | "MODIFIED";
  before?: any;
  after?: any;
}

export interface ConsistencyReport {
  pass: boolean;
  diff: { groupDiffs: GroupDiff[], facetDiffs: FacetDiff[] } | null;
}

export interface EvolutionReport {
  type: "INITIAL" | "BREAKING" | "SAFE";
  groupDiffs: GroupDiff[];
  facetDiffs: FacetDiff[];
  score: { severity: "NONE" | "NON_BREAKING" | "BREAKING" };
  requiresApproval: boolean;
}

export interface GovernancePolicy {
  allowGroupAdditions: boolean;
  allowFacetAdditions: boolean;
  allowOrderChanges: "always" | "never" | "review";
  allowGroupRemovals: boolean;
  allowFacetRemovals: boolean;
  requireApprovalForBreakingChanges: boolean;
}

export interface GovernanceResult {
  status: "PASS" | "BLOCK" | "REVIEW";
  violations: string[];
}

export type SystemState = 
  | "STABLE" 
  | "DEGRADED" 
  | "DRIFTING" 
  | "BLOCKED" 
  | "COMPILATION_INCONSISTENT";

export interface BehavioralResponse {
  allowedActions: string[];
  forbiddenActions: string[];
  enforcementLevel: "NONE" | "REVIEW" | "BLOCK";
}
