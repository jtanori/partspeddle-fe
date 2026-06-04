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
      execute = vi.fn().mockResolvedValue({ objectID: 'part-123', partId: 'part-123' });
    },
  };
});

describe('SearchIndexWorker Outage Recovery', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should queue and recover after Algolia outage', async () => {
    const saveObjectsMock = vi.mocked(algoliaClient.saveObjects);
    
    // Simulate outage: fail 3 times (max retries)
    saveObjectsMock.mockRejectedValue(new Error('Algolia Down'));

    const worker = new SearchIndexWorker();
    
    // Start promise for the first call
    const promise = worker.processPartUpdated('part-123');
    
    // Advance timers for retries
    await vi.runAllTimersAsync();
    
    await expect(promise).rejects.toThrow('Algolia Down');
    expect(saveObjectsMock).toHaveBeenCalledTimes(4); // initial + 3 retries
    
    // Recover: simulate service coming back
    saveObjectsMock.mockResolvedValueOnce({ taskID: 2 });
    await expect(worker.processPartUpdated('part-123')).resolves.not.toThrow();
  });
});
