import { CompiledSpecificationSet } from '../domain/compiled-specification-set';
import { RankedResult, RankingContribution } from './ranking-types';

type FactorConfig = {
  key: keyof NonNullable<CompiledSpecificationSet['rankingFactors']>;
  label: string;
  explanation: string;
  weight: number;
};

export class RankingEngine {
  // Expanded weights based on SEARCH_RANKING_INVENTORY.md and Phase 1 signals.
  // Weights sum to 1.0.
  private static FACTORS: FactorConfig[] = [
    {
      key: 'listingQuality',
      label: 'listing_quality_score',
      explanation: 'Overall quality of listing content and media.',
      weight: 0.30,
    },
    {
      key: 'sellerTrust',
      label: 'seller_trust_score',
      explanation: 'Seller reputation, reviews, and historical trust signals.',
      weight: 0.20,
    },
    {
      key: 'recency',
      label: 'recency_score',
      explanation: 'How recently the listing was created or refreshed.',
      weight: 0.15,
    },
    {
      key: 'imageQuality',
      label: 'image_quality_score',
      explanation: 'Resolution, coverage, and consistency of listing images.',
      weight: 0.10,
    },
    {
      key: 'inventoryCompleteness',
      label: 'inventory_completeness_score',
      explanation: 'Completeness of required fitment and specification fields.',
      weight: 0.10,
    },
    {
      key: 'popularity',
      label: 'popularity_score',
      explanation: 'Views, saves, and engagement relative to peers.',
      weight: 0.08,
    },
    {
      key: 'responseRate',
      label: 'response_rate_score',
      explanation: 'Seller responsiveness to buyer inquiries.',
      weight: 0.04,
    },
    {
      key: 'conversionScore',
      label: 'conversion_score',
      explanation: 'Historical conversion from view to offer or purchase.',
      weight: 0.03,
    },
  ];

  static rank(artifacts: { listingId: string; compiled?: CompiledSpecificationSet }[]): RankedResult[] {
    const ranked = artifacts
      .map(artifact => this.score(artifact))
      .sort((a, b) => {
        if (Math.abs(b.score - a.score) > 0.0001) {
          return b.score - a.score;
        }
        return a.listingId.localeCompare(b.listingId);
      });

    return ranked;
  }

  private static score(artifact: { listingId: string; compiled?: CompiledSpecificationSet }): RankedResult {
    const factors: CompiledSpecificationSet['rankingFactors'] =
      artifact.compiled?.rankingFactors ?? {
        listingQuality: 0,
        sellerTrust: 0,
        recency: 0,
      };

    const contributions: RankingContribution[] = this.FACTORS.map(config => {
      const rawValue = (factors[config.key] as number | undefined) ?? 0;
      const normalizedValue = this.clamp01(rawValue);
      const contribution = config.weight * normalizedValue;

      return {
        factor: config.label,
        weight: config.weight,
        rawValue,
        normalizedValue,
        contribution,
        explanation: config.explanation,
      };
    });

    const finalScore = contributions.reduce((sum, c) => sum + c.contribution, 0);

    return {
      listingId: artifact.listingId,
      score: finalScore,
      explanation: {
        finalScore,
        contributions,
      },
    };
  }

  private static clamp01(value: number): number {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(1, value));
  }
}
