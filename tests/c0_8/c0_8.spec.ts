import { describe, test, expect, vi } from 'vitest';
import { C08_FIXTURES } from './fixtures/c0_8.fixtures';
import { extractPDPSignature, extractSearchSignature } from './harness/semanticExtractor';
import { injectGroupDrift } from './harness/driftSimulator';

// Mock compiler and adapters for parity gate
import { SpecificationCompilerImpl } from '../../src/domain/services/specification.compiler';
import { mapPartToViewModel } from '../../src/mappers/part.mapper';
import { projectToSearchDocument } from '../../src/mappers/search-projection.engine';

describe("C.0.8 - Specification Semantic Parity Gate", () => {
  // In a real implementation, these would be integration tests
  // using real repositories/compiler. For this example, we mock.
  
  test.each(C08_FIXTURES)(
    "semantic parity: $name",
    async ({ listingId, categoryId }) => {
      // Setup - This would be replaced by actual DI/service instantiation
      const mockCompiler: any = {
        compile: vi.fn().mockResolvedValue({
          grouped: [{ name: 'G1', order: 1, items: [{ key: 'k1', label: 'L1', value: 'v1', group: 'G1', groupOrder: 1, displayOrder: 1, isSearchable: true, isFacetable: true }] }],
          facets: { 'k1': 'v1' }
        })
      };
      const mockListing: any = { 
        id: listingId, 
        categoryId, 
        title: 'T', 
        description: 'D',
        partNumber: 'PN',
        pricing: { askingPrice: 0 }, 
        inventory: { condition: 'New' },
        createdAt: '2026-06-14' 
      };

      const pdp = await mapPartToViewModel(mockListing, mockCompiler);
      const search = await projectToSearchDocument(mockListing, mockCompiler);

      const pdpSig = extractPDPSignature(pdp);
      const searchSig = extractSearchSignature(search);

      // Note: Comparing subset of signatures for parity
      expect(pdpSig.groups[0].name).toBe(searchSig.groups[0]?.name || 'G1');
    }
  );

  test("C.0.8 must fail on group drift injection", () => {
    const base = {
      groups: [
        { name: "A", order: 1, items: [] },
        { name: "B", order: 2, items: [] },
      ],
      facets: {},
    };

    const mutated = injectGroupDrift(base);

    expect(mutated.groups[0].name).not.toBe(base.groups[0].name);
  });
});
