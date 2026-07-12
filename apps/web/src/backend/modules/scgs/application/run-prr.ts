import type { CompiledSemanticArtifact } from '../domain/compiled-semantic-artifact';
import type { ReplayStore } from '../domain/replay/replay-store.port';
import type { PRRReport, PRRCheck } from '../domain/governance/prr-report';
import { SemanticReplayEngine } from '../domain/replay/engine';
import { deepEqual } from '../domain/diff';
import { evaluatePTS } from '../domain/pts';

export interface RunPRRInput {
  current: CompiledSemanticArtifact;
  previous?: CompiledSemanticArtifact;
  store: ReplayStore;
  gitCommit?: string;
  environment?: string;
  ptsThreshold?: number;
}

function statusFrom(checks: PRRCheck[]): PRRReport['status'] {
  if (checks.some((c) => c.status === 'BLOCK')) return 'BLOCK';
  if (checks.some((c) => c.status === 'WARN')) return 'WARN';
  return 'PASS';
}

export async function runPRR(input: RunPRRInput): Promise<PRRReport> {
  const checks: PRRCheck[] = [];
  const threshold = input.ptsThreshold ?? 5;

  // 1. Determinism: running the replay engine twice on the same artifacts
  //    should produce identical event sequences.
  const determinismStart = Date.now();
  const firstTrace = SemanticReplayEngine.reconstruct(
    input.previous ?? input.current,
    input.current,
  );
  const secondTrace = SemanticReplayEngine.reconstruct(
    input.previous ?? input.current,
    input.current,
  );
  const deterministic = deepEqual(firstTrace.events, secondTrace.events);
  checks.push({
    name: 'determinism',
    status: deterministic ? 'PASS' : 'BLOCK',
    reasonCodes: deterministic ? [] : ['REPLAY_NOT_DETERMINISTIC'],
    durationMs: Date.now() - determinismStart,
  });

  // 2. PTS stability: compare drift against previous artifact if available.
  const ptsStart = Date.now();
  let ptsStable: boolean;
  const ptsReasonCodes: string[] = [];
  if (input.previous) {
    const evolution = {
      type: 'SAFE' as const,
      groupDiffs: firstTrace.events.filter((e) => e.type === 'GROUP_CHANGE').map((e) => e.detail),
      facetDiffs: firstTrace.events.filter((e) => e.type === 'FACET_CHANGE').map((e) => e.detail),
      score: { severity: 'NONE' as const },
      requiresApproval: false,
    };
    const pts = evaluatePTS(evolution);
    ptsStable = pts.driftScore <= threshold;
    if (!ptsStable) {
      ptsReasonCodes.push(`PTS_DRIFT_EXCEEDS_THRESHOLD:${pts.driftScore.toFixed(2)}`);
    }
  } else {
    ptsStable = false;
    ptsReasonCodes.push('NO_BASELINE_ARTIFACT');
  }
  checks.push({
    name: 'pts-stability',
    status: ptsStable ? 'PASS' : 'WARN',
    reasonCodes: ptsReasonCodes,
    durationMs: Date.now() - ptsStart,
  });

  // 3. Snapshot integrity: the current artifact should be persistable and retrievable.
  const snapshotStart = Date.now();
  let snapshotIntegrity = true;
  const snapshotReasonCodes: string[] = [];
  try {
    await input.store.save(firstTrace);
    const loaded = await input.store.load(firstTrace.traceId);
    if (!loaded) {
      snapshotIntegrity = false;
      snapshotReasonCodes.push('TRACE_NOT_RETRIEVABLE');
    }
  } catch (err) {
    snapshotIntegrity = false;
    snapshotReasonCodes.push(`STORAGE_ERROR:${(err as Error).message}`);
  }
  checks.push({
    name: 'snapshot-integrity',
    status: snapshotIntegrity ? 'PASS' : 'BLOCK',
    reasonCodes: snapshotReasonCodes,
    durationMs: Date.now() - snapshotStart,
  });

  // 4. PTS contract integrity: trace must contain PTS_SHIFT and CI_VERDICT events.
  const contractStart = Date.now();
  const hasPTS = firstTrace.events.some((e) => e.type === 'PTS_SHIFT');
  const hasCI = firstTrace.events.some((e) => e.type === 'CI_VERDICT');
  const contractOk = hasPTS && hasCI;
  checks.push({
    name: 'pts-contract-integrity',
    status: contractOk ? 'PASS' : 'BLOCK',
    reasonCodes: contractOk ? [] : ['MISSING_PTS_SHIFT', 'MISSING_CI_VERDICT'].filter(Boolean),
    durationMs: Date.now() - contractStart,
  });

  const status = statusFrom(checks);
  const pass = checks.filter((c) => c.status === 'PASS').length;
  const warn = checks.filter((c) => c.status === 'WARN').length;
  const block = checks.filter((c) => c.status === 'BLOCK').length;

  return {
    status,
    checks,
    summary: { pass, warn, block, total: checks.length },
    generatedAt: new Date().toISOString(),
    gitCommit: input.gitCommit,
    environment: input.environment,
  };
}
