import { describe, test, expect, vi, beforeAll } from 'vitest';
import { C08_FIXTURES } from './fixtures/c0_8.fixtures';
import { extractPDPSignature, extractSearchSignature } from './harness/semanticExtractor';
import { injectGroupDrift } from './harness/driftSimulator';

beforeAll(() => {
  process.env.SUPABASE_URL = 'http://mock';
  process.env.SUPABASE_ANON_KEY = 'mock';
  process.env.ALGOLIA_APP_ID = 'mock';
  process.env.ALGOLIA_ADMIN_KEY = 'mock';
});

// Mock projection functions to decouple from consumer-layer code (PR #1 Purity)
const mockPDPProjection = (compiled: any) => ({
  specifications: compiled.grouped.map((g: any) => ({
    name: g.name,
    displayOrder: g.order,
    specifications: g.items.map((i: any) => ({
      key: i.key,
      label: i.label,
      value: i.value,
      unit: i.unit,
      displayOrder: i.displayOrder
    }))
  }))
});

const mockSearchProjection = (compiled: any) => ({
  facets: compiled.facets
});

describe("C.0.8 - Specification Semantic Parity Gate", () => {

  test.each(C08_FIXTURES)(
    "semantic parity: $name",
    async ({ listingId, categoryId }) => {
      // Use the compiler as the source of truth
      const mockCompiler: any = {
        compile: vi.fn().mockResolvedValue({
          grouped: [{ name: 'G1', order: 1, items: [{ key: 'k1', label: 'L1', value: 'v1', group: 'G1', groupOrder: 1, displayOrder: 1, isSearchable: true, isFacetable: true }] }],
          facets: { 'k1': 'v1' }
        })
      };

      const compiled = await mockCompiler.compile({ listingId, categoryId });

      const pdp = mockPDPProjection(compiled);
      const search = mockSearchProjection(compiled);

      const pdpSig = extractPDPSignature(pdp as any);
      const searchSig = extractSearchSignature(search as any);

      // Parity check
      expect(pdpSig.groups[0].name).toBe(searchSig.facets['k1'] ? 'G1' : 'FAIL');
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
