import { describe, it, expect } from 'vitest';
import { AlgoliaSearchRepository } from '../../../src/backend/modules/search/infrastructure/algolia-search-repository';

describe('AlgoliaSearchRepository fitment filter generation', () => {
  it('builds an exact fitment signature filter', () => {
    const repo = new AlgoliaSearchRepository();
    const filters = (repo as any).buildAlgoliaFilters({
      fitmentSignatures: ['make-1:model-1:2015'],
    });
    expect(filters).toContain("fitment_signatures:'make-1:model-1:2015'");
  });

  it('ORs multiple fitment signatures', () => {
    const repo = new AlgoliaSearchRepository();
    const filters = (repo as any).buildAlgoliaFilters({
      fitmentSignatures: ['make-1:model-1:2015', 'make-1:model-1:2016'],
    });
    expect(filters).toContain(
      "(fitment_signatures:'make-1:model-1:2015' OR fitment_signatures:'make-1:model-1:2016')",
    );
  });

  it('escapes single quotes in signatures', () => {
    const repo = new AlgoliaSearchRepository();
    const filters = (repo as any).buildAlgoliaFilters({
      fitmentSignatures: ["make-1:model-1:2015'"],
    });
    expect(filters).toContain("fitment_signatures:'make-1:model-1:2015'''");
  });
});
