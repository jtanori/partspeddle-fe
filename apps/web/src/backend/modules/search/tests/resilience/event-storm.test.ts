import { describe, it, expect, vi } from 'vitest';
import { SearchIndexWorker } from '../../application/search-index-worker';
import { algoliaClient } from '../../infrastructure/algolia-client';

// Mock dependencies
vi.mock('../../infrastructure/algolia-client', () => ({
  algoliaClient: {
    saveObjects: vi.fn().mockResolvedValue({ taskID: 1 }),
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

describe('SearchIndexWorker Event Storm', () => {
  it('should process a burst of 1000 events without crashing', async () => {
    const worker = new SearchIndexWorker();
    const saveObjectsMock = vi.mocked(algoliaClient.saveObjects);

    // Simulate 1000 parts updated in batches
    const partIds = Array.from({ length: 1000 }, (_, i) => `part-${i}`);

    // Process in batches of 50
    const BATCH_SIZE = 50;
    for (let i = 0; i < partIds.length; i += BATCH_SIZE) {
      await worker.processPartsUpdated(partIds.slice(i, i + BATCH_SIZE));
    }

    expect(saveObjectsMock).toHaveBeenCalledTimes(1000 / BATCH_SIZE);
  });
});
