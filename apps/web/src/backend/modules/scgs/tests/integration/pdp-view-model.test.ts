import { describe, it, expect } from 'vitest';
import { buildPDPViewModel } from '../../application/build-pdp-view-model';
import { CompiledSemanticArtifact, LineageId } from '../../domain/compiled-semantic-artifact';

function makeArtifact(listingId: string): CompiledSemanticArtifact {
  return {
    listingId,
    categoryId: 'cat-1',
    version: '1.0.0',
    lineageId: `${listingId}:1.0.0:abc` as LineageId,
    checksum: 'abc',
    compiled: {
      flat: [
        {
          key: 'material',
          label: 'Material',
          value: 'Ceramic',
          unit: undefined,
          group: 'General',
          groupOrder: 0,
          displayOrder: 0,
          isSearchable: true,
          isFacetable: false,
        },
      ],
      grouped: [
        {
          name: 'General',
          order: 0,
          items: [
            {
              key: 'material',
              label: 'Material',
              value: 'Ceramic',
              unit: undefined,
              group: 'General',
              groupOrder: 0,
              displayOrder: 0,
              isSearchable: true,
              isFacetable: false,
            },
          ],
        },
      ],
      facets: { make: 'Honda' },
      rankingFactors: { listingQuality: 0.8, sellerTrust: 0.9, recency: 0.5 },
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
  compatibility: [{ make: 'Honda', model: 'Civic', years: '2020-2021', engine: '2.0L' }],
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
      artifact: makeArtifact('listing-1'),
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
      artifact: makeArtifact('listing-1'),
      presentation: basePresentation,
    });
    expect(viewModel.badges.isGoodFit).toBe(true);
    expect(viewModel.fitment.fitmentScore).toBe(100);
  });

  it('marks poor fit when compatibility is empty', () => {
    const viewModel = buildPDPViewModel({
      artifact: makeArtifact('listing-1'),
      presentation: { ...basePresentation, compatibility: [] },
    });
    expect(viewModel.badges.isGoodFit).toBe(false);
    expect(viewModel.fitment.fitmentScore).toBe(0);
  });

  it('parses year ranges into a single representative year', () => {
    const viewModel = buildPDPViewModel({
      artifact: makeArtifact('listing-1'),
      presentation: {
        ...basePresentation,
        compatibility: [{ make: 'Honda', model: 'Civic', years: '2014-2015', engine: '1.8L' }],
      },
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
