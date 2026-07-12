import { CompiledSemanticArtifact } from '../domain/compiled-semantic-artifact';
import { RankingEngine } from '../infrastructure/ranking-engine';
import { RankedArtifact } from '../infrastructure/ranking-types';

/**
 * Application use case: rank a collection of compiled semantic artifacts.
 *
 * Wraps the domain ranking engine and binds each result back to its source
 * artifact so callers can trace ranking decisions to lineage.
 */
export function rankArtifacts(artifacts: CompiledSemanticArtifact[]): RankedArtifact[] {
  const results = RankingEngine.rank(
    artifacts.map(a => ({
      listingId: a.listingId,
      compiled: a.compiled,
    }))
  );

  const artifactById = new Map(artifacts.map(a => [a.listingId, a]));

  return results.map(result => {
    const artifact = artifactById.get(result.listingId);
    if (!artifact) {
      throw new Error(`RankingEngine returned unknown listingId: ${result.listingId}`);
    }
    return { artifact, result };
  });
}
