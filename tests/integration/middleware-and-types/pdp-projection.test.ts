import { describe, it, expect } from 'vitest';
import { buildPDPViewModel } from '../../../apps/web/src/backend/modules/scgs/application/build-pdp-view-model';
import {
  CompiledSemanticArtifact,
  LineageId,
} from '../../../apps/web/src/backend/modules/scgs/domain/compiled-semantic-artifact';
import { Part, Seller } from '../../../apps/web/src/types';
import { buildCompiledSpecificationSet } from '../../../apps/web/src/backend/modules/scgs/tests/fixtures';
import { compileCompatibility } from '../../../apps/web/src/backend/modules/scgs/infrastructure/compatibility-compiler';
import { compileFitment } from '../../../apps/web/src/backend/modules/scgs/infrastructure/fitment-compiler';
import { compileTrustProfile } from '../../../apps/web/src/backend/modules/scgs/infrastructure/trust-compiler';

const basePart: Part = {
  id: 'p1',
  trackingNumber: 'PP-001',
  title: '2015 Honda Civic Alternator',
  subtitle: '1.8L, 4-Cylinder',
  system: 'Electrical System',
  category: 'Charging & Starting',
  partType: 'Alternator',
  oemPartNumber: 'ABC123',
  interchangePartNumbers: [],
  condition: 'USED_GOOD',
  price: 89.99,
  mileage: 120000,
  fits: '1.8L',
  description: 'Test description',
  images: ['img1.jpg'],
  sellerId: 's1',
  compatibility: [{ make: 'Honda', model: 'Civic', years: '2014-2015', engine: '1.8L' }],
};

const baseSeller: Seller = {
  id: 's1',
  name: 'Test Auto Parts',
  rating: 4.8,
  reviewCount: 100,
  location: 'NC, USA',
  partCount: 50,
  feedbackPercentage: 98,
  shipsWithin: '1 day',
  returnPolicy: '30-day returns',
};

function makeArtifact(part: Part, seller: Seller | null): CompiledSemanticArtifact {
  const rankingFactors = { listingQuality: 0.5, sellerTrust: 0.5, recency: 0.5 };
  const compatibility = compileCompatibility({
    entries: (part.compatibility || []).map(c => ({
      make: c.make,
      model: c.model,
      years: c.years,
      engine: c.engine,
    })),
    oemPartNumber: part.oemPartNumber,
  });
  const fitment = compileFitment({
    compatibility: {
      status: compatibility.status,
      vehicles: compatibility.vehicles,
    },
  });

  return {
    listingId: part.id,
    categoryId: part.category || 'uncategorized',
    version: '1.0.0',
    lineageId: `${part.id}:1.0.0:abc` as LineageId,
    checksum: 'abc',
    compiled: buildCompiledSpecificationSet({
      rankingFactors,
      compatibility,
      fitment,
      trust: compileTrustProfile({
        sellerTrustScore: rankingFactors.sellerTrust,
        listingQualityScore: rankingFactors.listingQuality,
        rating: seller?.rating,
        reviewCount: seller?.reviewCount,
        feedbackPercentage: seller?.feedbackPercentage,
        shipsWithin: seller?.shipsWithin,
      }),
    }),
    metadata: {
      createdAt: new Date().toISOString(),
      compilerVersion: '1.0.0',
    },
  };
}

function makePresentation(part: Part, seller: Seller | null) {
  return {
    title: part.title,
    subtitle: part.subtitle || '',
    price: part.price || 0,
    condition: part.condition || 'Used',
    images: part.images || [],
    description: part.description || '',
    sku: part.trackingNumber,
    seller: {
      id: seller?.id || 'unknown',
      displayName: seller?.name || 'Unknown Seller',
      rating: seller?.rating || 4.8,
      location: seller?.location || 'Unknown',
      responseTime: '24h',
    },
  };
}

describe('buildPDPViewModel projection', () => {
  it('produces a complete PDPViewModel from a part and seller', () => {
    const viewModel = buildPDPViewModel({
      artifact: makeArtifact(basePart, baseSeller),
      presentation: makePresentation(basePart, baseSeller),
    });

    expect(viewModel.id).toBe('p1');
    expect(viewModel.title).toBe('2015 Honda Civic Alternator');
    expect(viewModel.header.title).toBe('2015 Honda Civic Alternator');
    expect(viewModel.pricing.partPrice).toBe(89.99);
    expect(viewModel.inventory.isInStock).toBe(true);
    expect(viewModel.seller.displayName).toBe('Test Auto Parts');
    expect(viewModel.fitment.vehicles).toHaveLength(2);
    expect(viewModel.images).toEqual(['img1.jpg']);
    expect(viewModel.tabs.map(t => t.id)).toContain('spec');
  });

  it('handles a null seller gracefully', () => {
    const viewModel = buildPDPViewModel({
      artifact: makeArtifact(basePart, null),
      presentation: makePresentation(basePart, null),
    });
    expect(viewModel.seller.displayName).toBe('Unknown Seller');
    expect(viewModel.seller.id).toBe('unknown');
  });

  it('maps compatibility into fitment vehicles', () => {
    const viewModel = buildPDPViewModel({
      artifact: makeArtifact(basePart, baseSeller),
      presentation: makePresentation(basePart, baseSeller),
    });
    const vehicle = viewModel.fitment.vehicles[0];
    expect(vehicle.make).toBe('Honda');
    expect(vehicle.model).toBe('Civic');
    expect(vehicle.year).toBe(2014);
    expect(vehicle.engine).toBe('1.8L');
  });
});
