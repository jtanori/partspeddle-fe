import type { SearchDocument } from '@/backend/modules/search/domain/search-document';
import type { Recommendation } from '../domain/recommendation';
import type { CompiledSemanticArtifact } from '../domain/compiled-semantic-artifact';

export interface RecommendationCompilerInput {
  source: CompiledSemanticArtifact;
  candidates: SearchDocument[];
  excludeIds?: string[];
  limit?: number;
}

function candidateVehicleSignature(hit: SearchDocument): string[] {
  return (hit.fitment_signatures || []).map((s) => s.toLowerCase());
}

function sourceVehicleSignatures(source: CompiledSemanticArtifact): string[] {
  const vehicles = source.compiled.compatibility?.vehicles ?? [];
  return vehicles
    .map((v) => {
      const make = (v.make ?? '').toLowerCase();
      const model = (v.model ?? '').toLowerCase();
      const year = v.year ?? '';
      return make && model ? `${make}:${model}:${year}` : '';
    })
    .filter(Boolean);
}

export function compileRecommendations(input: RecommendationCompilerInput): Recommendation[] {
  const source = input.source;
  const exclude = new Set((input.excludeIds ?? []).map((id) => id.toLowerCase()));
  const sourceId = source.listingId.toLowerCase();
  const sourceCategory = source.categoryId.toLowerCase();
  const sourcePartType = (
    source.compiled.flat.find((s) => s.key === 'part_type')?.value as string | undefined
  )?.toLowerCase();
  const sourceMake = (
    source.compiled.flat.find((s) => s.key === 'make')?.value as string | undefined
  )?.toLowerCase();
  const sourceModel = (
    source.compiled.flat.find((s) => s.key === 'model')?.value as string | undefined
  )?.toLowerCase();
  const sourceSigs = sourceVehicleSignatures(source);

  const scored = input.candidates
    .filter((hit) => {
      const hitId = hit.objectID.toLowerCase();
      return hitId !== sourceId && !exclude.has(hitId);
    })
    .map((hit) => {
      let score = 0;
      const reasonCodes: string[] = [];

      const hitSigs = candidateVehicleSignature(hit);
      const overlap = hitSigs.some((sig) =>
        sourceSigs.some((s) => sig.includes(s) || s.includes(sig)),
      );
      if (overlap) {
        score += 40;
        reasonCodes.push('COMPATIBILITY_OVERLAP');
      }

      if (hit.category?.toLowerCase() === sourceCategory) {
        score += 25;
        reasonCodes.push('SAME_CATEGORY');
      }

      if (sourcePartType && hit.part_type?.toLowerCase() === sourcePartType) {
        score += 20;
        reasonCodes.push('SAME_PART_TYPE');
      }

      if (sourceMake && hit.make?.toLowerCase() === sourceMake) {
        score += 10;
        reasonCodes.push('SAME_MAKE');
      }

      if (sourceModel && hit.model?.toLowerCase() === sourceModel) {
        score += 10;
        reasonCodes.push('SAME_MODEL');
      }

      if (hit.seller_verified) {
        score += 5;
        reasonCodes.push('VERIFIED_SELLER');
      }

      if (hit.seller_trust_score > 0.7) {
        score += 5;
        reasonCodes.push('HIGH_TRUST_SELLER');
      }

      return {
        id: hit.objectID,
        title: hit.title,
        price: hit.price,
        imageUrl: hit.image_url ?? '',
        score,
        reasonCodes,
      };
    });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, input.limit ?? 6);
}
