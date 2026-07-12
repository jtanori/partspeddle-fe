import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { runPRR } from '../../application/run-prr';
import { FilesystemReplayStore } from '../../infrastructure/replay/filesystem-replay-store';
import { makeArtifact } from '../fixtures/artifact';

describe('runPRR', () => {
  const basePath = path.join(process.cwd(), 'tmp', 'scgs-prr-tests');
  let store: FilesystemReplayStore;

  beforeEach(() => {
    fs.rmSync(basePath, { recursive: true, force: true });
    store = new FilesystemReplayStore(basePath);
  });

  afterEach(() => {
    fs.rmSync(basePath, { recursive: true, force: true });
  });

  it('passes determinism, snapshot integrity, and contract checks', async () => {
    const current = makeArtifact();
    const previous = makeArtifact({ version: '0.9.0', checksum: 'checksum-0' });
    const report = await runPRR({ current, previous, store });

    const determinism = report.checks.find((c) => c.name === 'determinism');
    const snapshot = report.checks.find((c) => c.name === 'snapshot-integrity');
    const contract = report.checks.find((c) => c.name === 'pts-contract-integrity');
    const pts = report.checks.find((c) => c.name === 'pts-stability');

    expect(determinism?.status).toBe('PASS');
    expect(snapshot?.status).toBe('PASS');
    expect(contract?.status).toBe('PASS');
    expect(pts?.status).toBe('PASS');
    expect(report.status).toBe('PASS');
  });

  it('warns on PTS stability when no previous artifact is provided', async () => {
    const report = await runPRR({ current: makeArtifact(), store });
    const pts = report.checks.find((c) => c.name === 'pts-stability');
    expect(pts?.status).toBe('WARN');
    expect(pts?.reasonCodes).toContain('NO_BASELINE_ARTIFACT');
  });

  it('reports stable PTS when previous artifact is identical', async () => {
    const current = makeArtifact();
    const previous = makeArtifact({ version: '0.9.0', checksum: 'checksum-0' });
    const report = await runPRR({ current, previous, store });
    const pts = report.checks.find((c) => c.name === 'pts-stability');
    expect(pts?.status).toBe('PASS');
  });

  it('updates summary counts correctly', async () => {
    const report = await runPRR({ current: makeArtifact(), store });
    expect(report.summary.total).toBe(report.checks.length);
    expect(report.summary.pass + report.summary.warn + report.summary.block).toBe(
      report.summary.total,
    );
  });
});
