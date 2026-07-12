import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FilesystemReplayStore } from '../../infrastructure/replay/filesystem-replay-store';
import type { SemanticReplayTrace } from '../../domain/replay/types';

function makeTrace(overrides: Partial<SemanticReplayTrace> = {}): SemanticReplayTrace {
  return {
    traceId: 'test-trace',
    version: '1.0.0',
    listingId: 'listing-1',
    categoryId: 'cat-1',
    compilerVersion: '1.0.0',
    snapshots: [
      {
        snapshotId: 'snap-1',
        timestamp: new Date().toISOString(),
        compiledArtifactHash: 'hash-1',
        storageUri: 'file://hash-1',
      },
    ],
    events: [
      {
        type: 'CI_VERDICT',
        step: 0,
        verdict: 'PASS',
        reasonCodes: [],
        ptsScoreAtDecision: 0,
        snapshotBefore: 'hash-1',
        snapshotAfter: 'hash-1',
      },
    ],
    metadata: {
      createdAt: new Date().toISOString(),
      triggeredBy: 'LOCAL_RUN',
      gitCommit: 'abc123',
      environment: 'local',
      schemaVersion: 'v1',
    },
    ...overrides,
  };
}

describe('FilesystemReplayStore', () => {
  const basePath = path.join(process.cwd(), 'tmp', 'scgs-replay-tests');
  let store: FilesystemReplayStore;

  beforeEach(() => {
    fs.rmSync(basePath, { recursive: true, force: true });
    store = new FilesystemReplayStore(basePath);
  });

  afterEach(() => {
    fs.rmSync(basePath, { recursive: true, force: true });
  });

  it('saves and loads a trace', async () => {
    const trace = makeTrace();
    await store.save(trace);
    const loaded = await store.load('test-trace');
    expect(loaded).toEqual(trace);
  });

  it('returns null for missing trace', async () => {
    const loaded = await store.load('missing');
    expect(loaded).toBeNull();
  });

  it('lists traces with filters', async () => {
    await store.save(makeTrace({ traceId: 'a', listingId: 'l1', categoryId: 'c1' }));
    await store.save(makeTrace({ traceId: 'b', listingId: 'l2', categoryId: 'c2' }));

    const all = await store.list();
    expect(all).toHaveLength(2);

    const filtered = await store.list({ categoryId: 'c1' });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].traceId).toBe('a');
  });

  it('writes a JSONL event stream alongside the JSON bundle', async () => {
    const trace = makeTrace();
    await store.save(trace);
    const jsonlPath = path.join(basePath, 'traces', 'test-trace.events.jsonl');
    expect(fs.existsSync(jsonlPath)).toBe(true);
    const lines = fs.readFileSync(jsonlPath, 'utf-8').trim().split('\n');
    expect(lines).toHaveLength(trace.events.length);
  });
});
