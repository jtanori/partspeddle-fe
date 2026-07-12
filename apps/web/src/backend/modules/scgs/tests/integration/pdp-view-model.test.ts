import { describe, it, expect } from 'vitest';
import { buildPDPViewModel } from '../../application/build-pdp-view-model';
import { CompiledSemanticArtifact, LineageId } from '../../domain/compiled-semantic-artifact';
import { compileTrustProfile } from '../../infrastructure/trust-compiler';
import { compileCompatibility } from '../../infrastructure/compatibility-compiler';
import type { RawCompatibilityEntry } from '../../domain/compatibility-conclusion';
import { compileFitment } from '../../infrastructure/fitment-compiler';

function makeArtifact(
  listingId: string,
  compatibilityEntries: RawCompatibilityEntry[] = []
): CompiledSemanticArtifact {
  const rankingFactors = { listingQuality: 0.8, sellerTrust: 0.9, recency: 0.5 };
  const specifications = [
    {
      key: 'material',
      label: 'Material',
      value: 'Ceramic' as const,
      unit: undefined,
      group: 'General',
      groupOrder: 0,
      displayOrder: 0,
      isSearchable: true,
      isFacetable: false,
    },
  ];
  const trust = compileTrustProfile({
    sellerTrustScore: rankingFactors.sellerTrust,
    listingQualityScore: rankingFactors.listingQuality,
  });
  const compatibility = compileCompatibility({
    entries: compatibilityEntries,
    specifications: specifications.map(s => ({ key: s.key, value: s.value })),
  });
  const fitment = compileFitment({
    compatibility: {
      status: compatibility.status,
      vehicles: compatibility.vehicles,
    },
    specifications: specifications.map(s => ({ key: s.key, value: s.value })),
  });

  return {
    listingId,
    categoryId: 'cat-1',
    version: '1.0.0',
    lineageId: `${listingId}:1.0.0:abc` as LineageId,
    checksum: 'abc',
    compiled: {
      flat: specifications,
      grouped: [
        {
          name: 'General',
          order: 0,
          items: specifications,
        },
      ],
      facets: { make: 'Honda' },
      rankingFactors,
      trust,
      compatibility,
      fitment,
    },
    metadata: {
      createdAt: new Date().toISOString(),
      compilerVersion: '1.0.0',
    },
  };
}

const basePresentation = {
  title: 'Brake Pad Set',
  subtitle: 'Front ceramic brake pads',
  price: 129.99,
  condition: 'NEW',
  images: ['https://cdn.example.com/p1.jpg'],
  description: 'High quality ceramic brake pads.',
  sku: 'BP-12345',
  seller: {
    id: 'seller-1',
    displayName: 'Auto Parts Inc.',
    rating: 4.9,
    location: 'Austin, TX',
    responseTime: '24h',
  },
  crossSell: [
    {
      id: 'listing-2',
      title: 'Brake Rotor',
      price: 89.99,
      imageUrl: 'https://cdn.example.com/p2.jpg',
    },
  ],
};

describe('SCGS buildPDPViewModel', () => {
  it('returns a validated PDPViewModel from an artifact and presentation', () => {
    const viewModel = buildPDPViewModel({
      artifact: makeArtifact('listing-1', [
        { make: 'Honda', model: 'Civic', years: '2020-2021', engine: '2.0L' },
      ]),
      presentation: basePresentation,
    });

    expect(viewModel.id).toBe('listing-1');
    expect(viewModel.title).toBe('Brake Pad Set');
    expect(viewModel.header.sku).toBe('BP-12345');
    expect(viewModel.specifications).toHaveLength(1);
    expect(viewModel.specifications[0].specifications[0].value).toBe('Ceramic');
    expect(viewModel.tabs.map((t) => t.id)).toContain('spec');
  });

  it('marks OEM badge when condition is NEW', () => {
    const viewModel = buildPDPViewModel({
      artifact: makeArtifact('listing-1'),
      presentation: { ...basePresentation, condition: 'NEW' },
    });
    expect(viewModel.badges.isOEM).toBe(true);
  });

  it('does not mark OEM badge for used conditions', () => {
    const viewModel = buildPDPViewModel({
      artifact: makeArtifact('listing-1'),
      presentation: { ...basePresentation, condition: 'USED_GOOD' },
    });
    expect(viewModel.badges.isOEM).toBe(false);
  });

  it('marks good fit when compatibility is non-empty', () => {
    const viewModel = buildPDPViewModel({
      artifact: makeArtifact('listing-1', [
        { make: 'Honda', model: 'Civic', years: '2020-2021', engine: '2.0L' },
      ]),
      presentation: basePresentation,
    });
    expect(viewModel.badges.isGoodFit).toBe(true);
    expect(viewModel.fitment.fitmentScore).toBeGreaterThan(50);
  });

  it('marks poor fit when compatibility is empty', () => {
    const viewModel = buildPDPViewModel({
      artifact: makeArtifact('listing-1', []),
      presentation: basePresentation,
    });
    expect(viewModel.badges.isGoodFit).toBe(false);
    expect(viewModel.fitment.fitmentScore).toBe(0);
  });

  it('parses year ranges into a single representative year', () => {
    const viewModel = buildPDPViewModel({
      artifact: makeArtifact('listing-1', [
        { make: 'Honda', model: 'Civic', years: '2014-2015', engine: '1.8L' },
      ]),
      presentation: basePresentation,
    });
    const vehicle = viewModel.fitment.vehicles[0];
    expect(vehicle.year).toBe(2014);
    expect(vehicle.make).toBe('Honda');
    expect(vehicle.model).toBe('Civic');
  });

  it('falls back to artifact listingId when sku is omitted', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { sku, ...presentationWithoutSku } = basePresentation;
    const viewModel = buildPDPViewModel({
      artifact: makeArtifact('listing-1'),
      presentation: presentationWithoutSku,
    });
    expect(viewModel.header.sku).toBe('listing-1');
  });
});
