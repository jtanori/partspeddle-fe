# SCGS Semantic Capabilities

## Scope

Documents the trust, compatibility, and fitment compilers introduced in SCGS
Phase 4. These compilers transform raw marketplace data into canonical semantic
conclusions that projections consume.

## Trust

Trust is a compiled semantic profile, not a database field.

### Inputs

- `sellerTrustScore` — platform score for seller trust (0..1)
- `listingQualityScore` — platform score for listing quality (0..1)
- `rating` — average review rating (0..5 stars)
- `reviewCount` — number of reviews
- `feedbackPercentage` — positive feedback percentage (0..100)
- `verificationStatus` — e.g. `'verified'`
- `shipsWithin` — shipping SLA string, e.g. `'1 day'`
- `responseTime` — response SLA string, e.g. `'1 hour'`

### Output: `TrustProfile`

```ts
interface TrustProfile {
  score: number; // 0..1
  level: 'high' | 'medium' | 'low' | 'unknown';
  signals: TrustSignal[];
  compiledAt: string;
}
```

### Compiler

`compileTrustProfile(input: TrustCompilerInput): TrustProfile`

- Normalizes all inputs to `[0, 1]`.
- Weighs `sellerTrustScore` (35%) and `listingQualityScore` (25%) most heavily.
- Missing optional signals receive neutral defaults so the profile degrades
  gracefully.

## Compatibility

Compatibility is a semantic conclusion: "Can this part be used?"

### Inputs

- Raw compatibility entries: `{ make, model, years, engine? }[]`
- Optional `partNumber`
- Optional `oemPartNumber`
- Optional specifications

### Output: `CompatibilityConclusion`

```ts
interface CompatibilityConclusion {
  status: 'compatible' | 'conditional' | 'incompatible' | 'unknown';
  confidence: number; // 0..1
  vehicles: CompatibleVehicle[];
  notes: string[];
  compiledAt: string;
}
```

### Compiler

`compileCompatibility(input: CompatibilityCompilerInput): CompatibilityConclusion`

- Parses year ranges (`"2014-2015"`) into individual years.
- Normalizes make/model strings.
- Returns `unknown` when no entries or unparseable years are provided.
- Records OEM references in notes.

## Fitment

Fitment is narrower than compatibility: "Can this exact part be installed on
this exact vehicle?"

### Inputs

- `CompatibilityConclusion`
- Optional specifications

### Output: `FitmentConclusion`

```ts
interface FitmentConclusion {
  status: 'exact' | 'compatible' | 'conditional' | 'incompatible' | 'unknown';
  fitmentScore: number; // 0..100
  vehicles: FitmentVehicle[];
  notes: string[];
  compiledAt: string;
}
```

### Compiler

`compileFitment(input: FitmentCompilerInput): FitmentConclusion`

- Computes per-vehicle confidence from engine presence and specification detail.
- Derives status: `exact` when all vehicles have high confidence and
  compatibility is `compatible`.
- Returns `unknown` when compatibility is unknown.

## Integration with SCGS Artifact

`SpecificationCompilerImpl` invokes the three compilers and stores their
outputs on `CompiledSpecificationSet`:

```ts
compiled: {
  // ...flat, grouped, facets, rankingFactors
  trust: TrustProfile;
  compatibility: CompatibilityConclusion;
  fitment: FitmentConclusion;
}
```

Projections such as `buildPDPViewModel` read fitment and trust directly from
the artifact instead of recomputing them from presentation data.

## Verification

- `apps/web/src/backend/modules/scgs/tests/contract/trust-profile.contract.test.ts`
- `apps/web/src/backend/modules/scgs/tests/contract/compatibility-conclusion.contract.test.ts`
- `apps/web/src/backend/modules/scgs/tests/contract/fitment-conclusion.contract.test.ts`
- `apps/web/src/backend/modules/scgs/tests/integration/trust-compiler.test.ts`
- `apps/web/src/backend/modules/scgs/tests/integration/compatibility-compiler.test.ts`
- `apps/web/src/backend/modules/scgs/tests/integration/fitment-compiler.test.ts`
