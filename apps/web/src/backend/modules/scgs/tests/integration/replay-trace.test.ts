import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { replayTrace } from '../../application/replay-trace';
import { FilesystemReplayStore } from '../../infrastructure/replay/filesystem-replay-store';
import { makeArtifact } from '../fixtures/artifact';

function makeVersionedArtifact(version: string, checksum: string) {
  return makeArtifact({ version, checksum });
}

describe('replayTrace', () => {
  const basePath = path.join(process.cwd(), 'tmp', 'scgs-replay-trace-tests');
  let store: FilesystemReplayStore;

  beforeEach(() => {
    fs.rmSync(basePath, { recursive: true, force: true });
    store = new FilesystemReplayStore(basePath);
  });

  afterEach(() => {
    fs.rmSync(basePath, { recursive: true, force: true });
  });

  it('persists a trace and validates it', async () => {
    const previous = makeVersionedArtifact('0.9.0', 'hash-0');
    const next = makeVersionedArtifact('1.0.0', 'hash-1');

    const result = await replayTrace({
      previous,
      next,
      store,
      triggeredBy: 'CI',
      gitCommit: 'abc123',
      environment: 'ci',
    });

    expect(result.traceId).toBe(`${previous.version}:${next.version}`);
    expect(result.valid).toBe(true);

    const loaded = await store.load(result.traceId);
    expect(loaded).not.toBeNull();
    expect(loaded?.metadata.triggeredBy).toBe('CI');
    expect(loaded?.metadata.gitCommit).toBe('abc123');
    expect(loaded?.metadata.environment).toBe('ci');
  });
});
