import { describe, it, expect } from 'vitest';
import { SearchDocument } from '../domain/search-document';

describe('Search Document Contract', () => {
  it('should match the expected Algolia indexing schema', () => {
    const mockDocument: SearchDocument = {
      objectID: 'part-123',
      partId: 'part-123',
      title: 'Test Part',
      description: 'Test description',
      price: 100,
      condition: 'used',
      makeNames: ['Ford'],
      makeIds: ['make-1'],
      modelNames: ['F150'],
      modelIds: ['mod-1'],
      years: [2020],
      categoryName: 'Electrical',
      categoryId: 'cat-1',
      partTypeName: 'Alternator',
      partTypeId: 'type-1',
      sellerVerified: true,
      sellerTrustScore: 50,
      imageCount: 1,
      listingQualityScore: 100,
      createdAt: '2026-06-03T00:00:00Z',
    };

    // Contract validation
    expect(mockDocument).toMatchObject({
      objectID: expect.any(String),
      partId: expect.any(String),
      title: expect.any(String),
      price: expect.any(Number),
      makeNames: expect.any(Array),
      categoryName: expect.any(String),
    });
  });
});
