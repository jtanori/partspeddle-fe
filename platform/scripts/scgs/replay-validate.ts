import 'dotenv/config';
import { createReplayStore } from '../../../apps/web/src/backend/modules/scgs/infrastructure/replay/replay-store.factory';
import { ReplayValidator } from '../../../apps/web/src/backend/modules/scgs/domain/replay/validator';
import type { CompiledSemanticArtifact } from '../../../apps/web/src/backend/modules/scgs/domain/compiled-semantic-artifact';

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
  const traceId = process.env.TRACE_ID;
  if (!traceId) {
    throw new Error('TRACE_ID required');
  }

  const previousUri = process.env.SCGS_PREVIOUS_ARTIFACT_URI;
  const currentUri = process.env.SCGS_CURRENT_ARTIFACT_URI;

  if (!previousUri || !currentUri) {
    throw new Error('SCGS_PREVIOUS_ARTIFACT_URI and SCGS_CURRENT_ARTIFACT_URI required');
  }

  const store = createReplayStore();
  const trace = await store.load(traceId);

  if (!trace) {
    console.error('REPLAY_VALIDATION_FAILED: trace not found', { traceId });
    process.exit(1);
  }

  const previous = await loadArtifact(previousUri);
  const current = await loadArtifact(currentUri);

  const validation = ReplayValidator.validate(previous, current, trace, {
    checkSnapshotFiles: true,
  });

  console.log(JSON.stringify(validation, null, 2));

  if (!validation.ok) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('SCGS replay validation failed:', err);
  process.exit(1);
});
