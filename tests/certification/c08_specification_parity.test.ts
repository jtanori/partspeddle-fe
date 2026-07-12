import { describe, it, expect } from 'vitest';
import { CompiledSpecificationSet } from '../../src/domain/services/specification.compiler';
import { PartViewModel } from '../../src/viewmodels/pdp.viewmodel';
import { MarketplaceSearchDocument } from '../../src/domain/types/search.types';
import { createFixture } from './C08_fixtures';
import { driftSimulator } from './C08_drift_simulator';

// SEC Signature
type SemanticSignature = {
  groups: Array<{ name: string; order: number; items: Array<{ key: string; value: string | number | boolean; displayOrder: number; }>; }>;
  facets: Record<string, string | number | boolean>;
};

// Adapters
const pdpAdapter = {
  fromCompiled: (compiled: CompiledSpecificationSet): PartViewModel => ({
    id: 'test', title: 'test', subtitle: 'test', price: 0, condition: 'test',
    specifications: compiled.grouped.map(g => ({
      name: g.name, displayOrder: g.order,
      specifications: g.items.map(i => ({ key: i.key, label: i.label, value: i.value, unit: i.unit, displayOrder: i.displayOrder }))
    }))
  })
};

const searchAdapter = {
  fromCompiled: (compiled: CompiledSpecificationSet): MarketplaceSearchDocument => ({
    objectID: 'test', documentType: 'PART', title: 'test', sellerId: 'test', categorySlug: 'test', facets: compiled.facets, updatedAt: '2026-06-14'
  })
};

// SEC Extractors
function extractPDPSignature(view: PartViewModel): SemanticSignature {
  return {
    groups: view.specifications.map(g => ({
      name: g.name, order: g.displayOrder,
      items: g.specifications.map(i => ({ key: i.key, value: i.value, displayOrder: i.displayOrder }))
    })),
    facets: {}
  };
}

function extractSearchSignature(view: MarketplaceSearchDocument): SemanticSignature {
  return { groups: [], facets: view.facets };
}

describe("C.0.8 - Specification Semantic Parity Gate", () => {
  it("must ensure semantic consistency between PDP and Search projections", async () => {
    const compiled = createFixture('l1', 'c1');
    const pdpSig = extractPDPSignature(pdpAdapter.fromCompiled(compiled));
    const searchSig = extractSearchSignature(searchAdapter.fromCompiled(compiled));

    expect(pdpSig.groups).toEqual([{
      name: 'General', order: 1,
      items: [{ key: 'make', value: 'Toyota', displayOrder: 1 }]
    }]);
    expect(searchSig.facets).toEqual({ 'make': 'Toyota' });
  });

  it("must fail when artificial drift is injected", async () => {
    const compiled = createFixture('l1', 'c1');
    const drifted = driftSimulator.removeFacet(compiled, 'make');
    
    const searchSig = extractSearchSignature(searchAdapter.fromCompiled(drifted));
    
    expect(searchSig.facets).not.toEqual(compiled.facets);
  });
});
