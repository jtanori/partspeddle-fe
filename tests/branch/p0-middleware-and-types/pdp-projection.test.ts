import { describe, it, expect } from 'vitest';
import { buildPDPView } from '../../../apps/web/src/projection/pdp';
import { Part, Seller } from '../../../apps/web/src/types';
import { CompiledSpecificationSet } from '../../../apps/web/src/domain/specification/scgs/types';

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
  compatibility: [
    { make: 'Honda', model: 'Civic', years: '2014-2015', engine: '1.8L' },
  ],
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

const emptyCompiled: CompiledSpecificationSet = {
  flat: [],
  grouped: [],
  facets: {},
  rankingFactors: { listingQuality: 0.5, sellerTrust: 0.5, recency: 0.5 },
};

describe('buildPDPView', () => {
  it('produces a complete PartViewModel from a part and seller', () => {
    const viewModel = buildPDPView(basePart, baseSeller, emptyCompiled);

    expect(viewModel.id).toBe('p1');
    expect(viewModel.title).toBe('2015 Honda Civic Alternator');
    expect(viewModel.header.title).toBe('2015 Honda Civic Alternator');
    expect(viewModel.pricing.partPrice).toBe(89.99);
    expect(viewModel.inventory.isInStock).toBe(true);
    expect(viewModel.seller.displayName).toBe('Test Auto Parts');
    expect(viewModel.fitment.vehicles).toHaveLength(1);
    expect(viewModel.images).toEqual(['img1.jpg']);
    expect(viewModel.tabs.map(t => t.id)).toContain('spec');
  });

  it('handles a null seller gracefully', () => {
    const viewModel = buildPDPView(basePart, null, emptyCompiled);
    expect(viewModel.seller.displayName).toBe('Unknown Seller');
    expect(viewModel.seller.id).toBe('unknown');
  });

  it('maps compatibility into fitment vehicles', () => {
    const viewModel = buildPDPView(basePart, baseSeller, emptyCompiled);
    const vehicle = viewModel.fitment.vehicles[0];
    expect(vehicle.make).toBe('Honda');
    expect(vehicle.model).toBe('Civic');
    expect(vehicle.year).toBe(2014);
    expect(vehicle.engine).toBe('1.8L');
  });
});
