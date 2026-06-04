import { describe, it, expect, vi } from 'vitest';
import { searchPartsHandler } from '../../contracts/search-api-handler';
import { AlgoliaSearchRepository } from '../../infrastructure/algolia-search-repository';

// Mock repository
vi.mock('../../infrastructure/algolia-search-repository', () => {
  return {
    AlgoliaSearchRepository: class {
      search = vi.fn().mockResolvedValue({ hits: [], totalHits: 0, page: 0, totalPages: 0 });
      saveDocument = vi.fn();
      deleteDocument = vi.fn();
      saveDocuments = vi.fn();
    },
  };
});

describe('Search API Handler', () => {
  it('should return 400 for too long query', async () => {
    const req = { query: { q: 'a'.repeat(101) } } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;

    await searchPartsHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Query too long' });
  });

  it('should return results for valid search', async () => {
    const req = { query: { q: 'alternator' } } as any;
    const res = { json: vi.fn(), status: vi.fn().mockReturnThis() } as any;

    await searchPartsHandler(req, res);

    expect(res.json).toHaveBeenCalled();
  });
});
