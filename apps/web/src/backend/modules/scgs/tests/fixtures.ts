import { CompiledSpecificationSet } from '../domain/compiled-specification-set';
import { compileTrustProfile } from '../infrastructure/trust-compiler';
import { compileCompatibility } from '../infrastructure/compatibility-compiler';
import { compileFitment } from '../infrastructure/fitment-compiler';

export function buildCompiledSpecificationSet(
  overrides: Partial<CompiledSpecificationSet> = {},
): CompiledSpecificationSet {
  const rankingFactors = overrides.rankingFactors ?? {
    listingQuality: 0.5,
    sellerTrust: 0.5,
    recency: 0.5,
  };

  const compatibility = overrides.compatibility ?? compileCompatibility({ entries: [] });

  return {
    flat: [],
    grouped: [],
    facets: {},
    rankingFactors,
    trust:
      overrides.trust ??
      compileTrustProfile({
        sellerTrustScore: rankingFactors.sellerTrust,
        listingQualityScore: rankingFactors.listingQuality,
      }),
    compatibility,
    fitment:
      overrides.fitment ??
      compileFitment({
        compatibility: {
          status: compatibility.status,
          vehicles: compatibility.vehicles,
        },
      }),
  };
}
