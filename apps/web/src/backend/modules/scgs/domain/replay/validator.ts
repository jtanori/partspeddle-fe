import fs from 'node:fs';
import { CompiledSemanticArtifact } from '../compiled-semantic-artifact';
import { SemanticReplayTrace } from './types';
import { SemanticReplayEngine } from './engine';
import { deepEqual } from '../diff';

export interface ReplayValidatorOptions {
  checkSnapshotFiles?: boolean;
}

export class ReplayValidator {
  static validate(
    prev: CompiledSemanticArtifact,
    next: CompiledSemanticArtifact,
    trace: SemanticReplayTrace,
    options: ReplayValidatorOptions = {},
  ) {
    const recomputed = SemanticReplayEngine.reconstruct(prev, next);

    // 1. Losslessness Contract
    const lossless = deepEqual(trace.events, recomputed.events);

    // 2. PTS/CI Binding Checks
    const hasPTS = trace.events.some((e) => e.type === 'PTS_SHIFT');
    const hasCI = trace.events.some((e) => e.type === 'CI_VERDICT');

    // 3. Snapshot Integrity
    const snapshotIntegrity = options.checkSnapshotFiles
      ? trace.snapshots.every((s) => this.snapshotExists(s.storageUri))
      : trace.snapshots.length > 0 &&
        trace.snapshots.every((s) => typeof s.storageUri === 'string' && s.storageUri.length > 0);

    // 4. CI Binding (Simplified check)
    const ciBinding = trace.events.some((e) => e.type === 'CI_VERDICT');

    return {
      lossless,
      hasPTS,
      hasCI,
      snapshotIntegrity,
      ciBinding,
      ok: lossless && hasPTS && hasCI && snapshotIntegrity && ciBinding,
    };
  }

  private static snapshotExists(uri: string): boolean {
    if (uri.startsWith('file://')) {
      return fs.existsSync(uri.replace('file://', ''));
    }
    // Non-file URIs are considered valid if they have a non-empty path.
    return uri.length > 0;
  }
}
