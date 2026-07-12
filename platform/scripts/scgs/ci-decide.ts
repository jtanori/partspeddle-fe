import 'dotenv/config';
import { evaluateGovernanceDecision } from '../../../apps/web/src/backend/modules/scgs/application/evaluate-governance';
import type { CIDecisionInput } from '../../../apps/web/src/backend/modules/scgs/domain/governance/ci-decision';
import type { CompiledSemanticArtifact } from '../../../apps/web/src/backend/modules/scgs/domain/compiled-semantic-artifact';

function makeCompiled(now: string): CompiledSemanticArtifact['compiled'] {
  return {
    grouped: [],
    facets: {},
    flat: [],
    rankingFactors: {
      listingQuality: 0,
      sellerTrust: 0,
      recency: 0,
      imageQuality: 0,
      inventoryCompleteness: 0,
      popularity: 0,
      responseRate: 0,
      conversionScore: 0,
    },
    trust: {
      score: 0.5,
      level: 'medium',
      signals: [],
      compiledAt: now,
    },
    compatibility: {
      status: 'unknown',
      confidence: 0,
      vehicles: [],
      notes: [],
      compiledAt: now,
    },
    fitment: {
      status: 'unknown',
      fitmentScore: 0,
      vehicles: [],
      notes: [],
      compiledAt: now,
    },
  };
}

function createBaselineArtifact(): CompiledSemanticArtifact {
  const now = new Date().toISOString();
  return {
    listingId: 'baseline',
    categoryId: 'baseline',
    version: '0.0.0',
    lineageId: 'baseline' as CompiledSemanticArtifact['lineageId'],
    compiled: makeCompiled(now),
    checksum: 'baseline',
    metadata: { createdAt: now, compilerVersion: '1.0.0' },
  };
}

function createCurrentArtifact(): CompiledSemanticArtifact {
  const now = new Date().toISOString();
  return {
    listingId: 'ci-current',
    categoryId: 'ci-current',
    version: '1.0.0',
    lineageId: 'ci-current' as CompiledSemanticArtifact['lineageId'],
    compiled: makeCompiled(now),
    checksum: 'ci-current',
    metadata: { createdAt: now, compilerVersion: '1.0.0' },
  };
}

async function main() {
  const previousUri = process.env.SCGS_PREVIOUS_ARTIFACT_URI;
  const currentUri = process.env.SCGS_CURRENT_ARTIFACT_URI;
  const dryRun = process.env.SCGS_DRY_RUN === 'true';

  const previous: CompiledSemanticArtifact = previousUri
    ? await loadArtifact(previousUri)
    : createBaselineArtifact();
  const current: CompiledSemanticArtifact = currentUri
    ? await loadArtifact(currentUri)
    : createCurrentArtifact();

  const input: CIDecisionInput = {
    evolution: {
      groupDiffs: [],
      facetDiffs: [],
      score: { severity: 'NONE' },
    },
    previousArtifactHash: previous.checksum,
    currentArtifactHash: current.checksum,
    triggeredBy: 'CI',
    gitCommit: process.env.GITHUB_SHA || process.env.CI_COMMIT_SHA || 'unknown',
    environment: 'ci',
  };

  const decision = evaluateGovernanceDecision(input);

  console.log(JSON.stringify(decision, null, 2));

  if (dryRun) {
    process.exit(0);
  }

  if (decision.status === 'BLOCK') {
    process.exit(2);
  }
  if (decision.status === 'WARN') {
    process.exit(1);
  }
  process.exit(0);
}

async function loadArtifact(uri: string): Promise<CompiledSemanticArtifact> {
  if (uri.startsWith('file://')) {
    const path = uri.replace('file://', '');
    const fs = await import('node:fs');
    const content = fs.readFileSync(path, 'utf-8');
    return JSON.parse(content) as CompiledSemanticArtifact;
  }
  if (uri.startsWith('http://') || uri.startsWith('https://')) {
    const res = await fetch(uri);
    if (!res.ok) {
      throw new Error(`Failed to load artifact from ${uri}: ${res.status}`);
    }
    return (await res.json()) as CompiledSemanticArtifact;
  }
  // Treat as local file path
  const fs = await import('node:fs');
  const content = fs.readFileSync(uri, 'utf-8');
  return JSON.parse(content) as CompiledSemanticArtifact;
}

main().catch((err) => {
  console.error('SCGS CI decision failed:', err);
  process.exit(2);
});
