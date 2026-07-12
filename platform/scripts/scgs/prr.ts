import 'dotenv/config';
import { execSync } from 'node:child_process';
import { createReplayStore } from '../../../apps/web/src/backend/modules/scgs/infrastructure/replay/replay-store.factory';
import { runPRR } from '../../../apps/web/src/backend/modules/scgs/application/run-prr';
import type { CompiledSemanticArtifact } from '../../../apps/web/src/backend/modules/scgs/domain/compiled-semantic-artifact';

function scanCodebase(pattern: string, exclude = '') {
  try {
    const excludeDirs = ['tests'];
    if (exclude) {
      excludeDirs.push(...exclude.split(':'));
    }
    const excludeFlags = excludeDirs.map((dir) => `--exclude-dir=${dir}`).join(' ');
    return execSync(`grep -rE "${pattern}" apps/web/src/ ${excludeFlags}`).toString().trim();
  } catch {
    return '';
  }
}

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

function createCurrentArtifact(): CompiledSemanticArtifact {
  const now = new Date().toISOString();
  return {
    listingId: 'prr-current',
    categoryId: 'prr-current',
    version: '1.0.0',
    lineageId: 'prr-current' as CompiledSemanticArtifact['lineageId'],
    compiled: makeCompiled(now),
    checksum: 'prr-current',
    metadata: { createdAt: now, compilerVersion: '1.0.0' },
  };
}

async function loadArtifact(uri: string): Promise<CompiledSemanticArtifact> {
  if (uri.startsWith('file://')) {
    const fs = await import('node:fs');
    const content = fs.readFileSync(uri.replace('file://', ''), 'utf-8');
    return JSON.parse(content) as CompiledSemanticArtifact;
  }
  if (uri.startsWith('http://') || uri.startsWith('https://')) {
    const res = await fetch(uri);
    if (!res.ok) {
      throw new Error(`Failed to load artifact from ${uri}: ${res.status}`);
    }
    return (await res.json()) as CompiledSemanticArtifact;
  }
  const fs = await import('node:fs');
  const content = fs.readFileSync(uri, 'utf-8');
  return JSON.parse(content) as CompiledSemanticArtifact;
}

async function main() {
  const currentUri = process.env.SCGS_CURRENT_ARTIFACT_URI;
  const previousUri = process.env.SCGS_PREVIOUS_ARTIFACT_URI;
  const dryRun = process.env.SCGS_DRY_RUN === 'true';

  const current = currentUri ? await loadArtifact(currentUri) : createCurrentArtifact();
  const previous = previousUri ? await loadArtifact(previousUri) : undefined;
  const store = createReplayStore();

  const report = await runPRR({
    current,
    previous,
    store,
    gitCommit: process.env.GITHUB_SHA || process.env.CI_COMMIT_SHA || 'unknown',
    environment: process.env.SCGS_ENV || 'local',
  });

  // Static codebase checks retained from previous PRR script.
  const semanticAuthorityLeaks = scanCodebase(
    'group_name|facet|display_order',
    'backend/modules/scgs',
  );
  if (semanticAuthorityLeaks) {
    report.checks.push({
      name: 'semantic-authority',
      status: 'WARN',
      reasonCodes: ['SEMANTIC_AUTHORITY_LEAKAGE'],
      durationMs: 0,
    });
  }

  const frontendLeakage = scanCodebase('sort\\(|filter\\(|groupBy|displayOrder', 'projection');
  if (frontendLeakage) {
    report.checks.push({
      name: 'frontend-semantic-leakage',
      status: 'WARN',
      reasonCodes: ['FRONTEND_SEMANTIC_LEAKAGE'],
      durationMs: 0,
    });
  }

  // Recalculate summary after static checks.
  report.summary = {
    pass: report.checks.filter((c) => c.status === 'PASS').length,
    warn: report.checks.filter((c) => c.status === 'WARN').length,
    block: report.checks.filter((c) => c.status === 'BLOCK').length,
    total: report.checks.length,
  };
  report.status = report.checks.some((c) => c.status === 'BLOCK')
    ? 'BLOCK'
    : report.checks.some((c) => c.status === 'WARN')
      ? 'WARN'
      : 'PASS';

  console.log(JSON.stringify(report, null, 2));

  if (dryRun) {
    process.exit(0);
  }

  if (report.status === 'BLOCK') {
    process.exit(2);
  }
  if (report.status === 'WARN') {
    process.exit(1);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error('SCGS PRR failed:', err);
  process.exit(2);
});
