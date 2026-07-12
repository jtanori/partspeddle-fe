import { describe, it, expect, vi } from 'vitest';
import { SearchIndexWorker } from '../../application/search-index-worker';
import { algoliaClient } from '../../infrastructure/algolia-client';

// Mock dependencies
vi.mock('../../infrastructure/algolia-client', () => ({
  algoliaClient: {
    saveObjects: vi.fn(),
  },
  SEARCH_INDEX_NAME: 'test_index',
}));

vi.mock('../../application/build-search-document', () => {
  return {
    BuildSearchDocumentUseCase: class {
      execute = vi.fn();
    },
  };
});

describe('SearchIndexWorker Resilience', () => {
  it('should retry on Algolia 500 failure and eventually succeed', async () => {
    // Mock saveObjects to fail twice then succeed
    const saveObjectsMock = vi.mocked(algoliaClient.saveObjects);
    saveObjectsMock
      .mockRejectedValueOnce(new Error('Algolia 500'))
      .mockRejectedValueOnce(new Error('Algolia 500'))
      .mockResolvedValueOnce({ taskID: 1 } as any);

    const worker = new SearchIndexWorker();

    // With retry logic, this should now resolve
    await expect(worker.processPartUpdated('part-123')).resolves.not.toThrow();
    expect(saveObjectsMock).toHaveBeenCalledTimes(3);
  });
});
