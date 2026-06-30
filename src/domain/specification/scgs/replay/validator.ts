import fs from 'node:fs';
import { CompiledSemanticArtifact } from '../types';
import { SemanticReplayTrace } from './types';
import { SemanticReplayEngine } from './engine';
import { deepEqual } from '../diff.engine';

export class ReplayValidator {
  static validate(
    prev: CompiledSemanticArtifact,
    next: CompiledSemanticArtifact,
    trace: SemanticReplayTrace
  ) {
    const recomputed = SemanticReplayEngine.reconstruct(prev, next);

    // 1. Losslessness Contract
    const lossless = deepEqual(trace.events, recomputed.events);

    // 2. PTS/CI Binding Checks
    const hasPTS = trace.events.some(e => e.type === "PTS_VECTOR");
    const hasCI = trace.events.some(e => e.type === "CI_VERDICT");

    // 3. Snapshot Integrity
    const snapshotIntegrity = trace.snapshots.every(s => fs.existsSync(s.storageUri));

    // 4. CI Binding (Simplified check)
    const ciBinding = trace.events.some(e => e.type === "CI_VERDICT");

    return {
      lossless,
      hasPTS,
      hasCI,
      snapshotIntegrity,
      ciBinding,
      ok: lossless && hasPTS && hasCI && snapshotIntegrity && ciBinding
    };
  }
}
