# SCGS Domain Model

## Bounded context

SCGS owns:

- Semantic compilation
- Specification diff / evolution
- Governance policy enforcement
- Platform Trust Score (PTS)
- Replay trace generation and validation
- Ranking signal computation

## Value objects

### `TrustProfile`

Compiled semantic profile representing seller/platform trust.

```ts
interface TrustProfile {
  score: number; // 0..1
  level: 'high' | 'medium' | 'low' | 'unknown';
  signals: TrustSignal[];
  compiledAt: string; // ISO 8601
}

interface TrustSignal {
  name: TrustSignalName;
  value: number | string | boolean;
  weight: number; // 0..1
}
```

Trust is not a database field. It is a compiled conclusion produced by
`TrustCompiler` from seller history, listing quality, and platform signals.

### `CompatibilityConclusion`

Semantic conclusion answering "can this part be used?" for a set of vehicles.

```ts
interface CompatibilityConclusion {
  status: 'compatible' | 'conditional' | 'incompatible' | 'unknown';
  confidence: number; // 0..1
  vehicles: CompatibleVehicle[];
  notes: string[];
  compiledAt: string; // ISO 8601
}
```

### `FitmentConclusion`

Semantic conclusion answering "can this exact part be installed on this exact
vehicle?" It is narrower than compatibility.

```ts
interface FitmentConclusion {
  status: 'exact' | 'compatible' | 'conditional' | 'incompatible' | 'unknown';
  fitmentScore: number; // 0..100
  vehicles: FitmentVehicle[];
  notes: string[];
  compiledAt: string; // ISO 8601
}
```

### `GroupDiff`

```ts
interface GroupDiff {
  groupName: string;
  changeType: 'ADDED' | 'REMOVED' | 'ORDER_CHANGED' | 'MODIFIED';
  before?: SpecGroup;
  after?: SpecGroup;
}
```

### `FacetDiff`

```ts
interface FacetDiff {
  key: string;
  type: 'ADDED' | 'REMOVED' | 'MODIFIED';
  before?: string | number | boolean;
  after?: string | number | boolean;
}
```

## Aggregates

### `CompiledSemanticArtifact`

The root aggregate. Immutable after creation. Identified by lineage id.

### `SemanticReplayTrace`

An aggregate that reconstructs the causal history between two artifacts.

## Policies

### `GovernancePolicy`

```ts
interface GovernancePolicy {
  allowGroupAdditions: boolean;
  allowFacetAdditions: boolean;
  allowOrderChanges: 'always' | 'never' | 'review';
  allowGroupRemovals: boolean;
  allowFacetRemovals: boolean;
  requireApprovalForBreakingChanges: boolean;
}
```

Default policy (`DEFAULT_POLICY`) is permissive for additions, strict for
removals, and requires review for order changes.

## Services

### `evaluateGovernance(evolution, policy): GovernanceResult`

Returns `PASS`, `REVIEW`, or `BLOCK` based on the evolution report and policy.

### `evaluatePTS(evolution): PTSVector`

Returns a drift score and a high-drift flag.

### `SemanticReplayEngine.reconstruct(prev, next): SemanticReplayTrace`

Reconstructs a trace from two artifacts.

## System state

```ts
type SystemState = 'STABLE' | 'DEGRADED' | 'DRIFTING' | 'BLOCKED' | 'COMPILATION_INCONSISTENT';
```

`evaluateSystemState` maps CI status and drift score into a state.
`getBehavioralResponse` returns allowed/forbidden actions for each state.
