import { describe, it, expect, vi } from 'vitest';
import { SearchIndexWorker } from '../../application/search-index-worker';
import { algoliaClient } from '../../infrastructure/algolia-client';

vi.mock('../../infrastructure/algolia-client', () => ({
  algoliaClient: {
    saveObjects: vi.fn().mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 50)); // Simulate network
      return { taskID: 1 };
    }),
  },
  SEARCH_INDEX_NAME: 'test_index',
}));

vi.mock('../../application/build-search-document', () => {
  return {
    BuildSearchDocumentUseCase: class {
      execute = vi.fn().mockResolvedValue({ objectID: 'part-123', partId: 'part-123' });
    },
  };
});

describe('Indexing Performance', () => {
  it('should index 10 batches of 50 documents under 5s', async () => {
    const worker = new SearchIndexWorker();
    const start = performance.now();
    
    for (let i = 0; i < 10; i++) {
      const partIds = Array.from({ length: 50 }, (_, j) => `part-${i}-${j}`);
      await worker.processPartsUpdated(partIds);
    }
    
    const end = performance.now();
    const duration = end - start;
    
    expect(duration).toBeLessThan(5000);
    console.log(`Indexing performance (500 docs): ${duration.toFixed(2)}ms`);
  });
});
