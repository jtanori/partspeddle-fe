import { describe, it, expect } from 'vitest';
import { SemanticReplayEngine } from '../../../apps/web/src/domain/specification/scgs/replay/engine';
import { CompiledSemanticArtifact } from '../../../apps/web/src/domain/specification/scgs/types';

function makeArtifact(version: string): CompiledSemanticArtifact {
  return {
    listingId: 'l1',
    categoryId: 'c1',
    version,
    compiled: {
      flat: [],
      grouped: [{ name: 'General', order: 0, items: [] }],
      facets: { make: 'Honda' },
      rankingFactors: { listingQuality: 0.5, sellerTrust: 0.5, recency: 0.5 },
    },
    checksum: `hash-${version}`,
    metadata: { createdAt: new Date().toISOString(), compilerVersion: '1.0.0' },
  };
}

describe('SemanticReplayEngine', () => {
  it('reconstructs a trace with CI verdict and PTS shift events', () => {
    const prev = makeArtifact('v1');
    const next = makeArtifact('v2');

    const trace = SemanticReplayEngine.reconstruct(prev, next);

    expect(trace.version).toBe('v2');
    expect(trace.listingId).toBe('l1');
    expect(trace.events.length).toBeGreaterThan(0);
    expect(trace.events.some(e => e.type === 'CI_VERDICT')).toBe(true);
    expect(trace.events.some(e => e.type === 'PTS_SHIFT')).toBe(true);
  });

  it('emits a PASS verdict for identical artifacts', () => {
    const artifact = makeArtifact('v1');
    const trace = SemanticReplayEngine.reconstruct(artifact, artifact);

    const verdict = trace.events.find(e => e.type === 'CI_VERDICT');
    expect(verdict).toBeDefined();
    expect(verdict!.type === 'CI_VERDICT' && verdict.verdict).toBe('PASS');
  });
});
