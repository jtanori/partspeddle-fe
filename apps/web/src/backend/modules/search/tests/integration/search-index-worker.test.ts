import { describe, it, expect, vi } from 'vitest';
import { SearchIndexWorker } from '../../application/search-index-worker';
import { algoliaClient } from '../../infrastructure/algolia-client';
import { BuildSearchDocumentUseCase } from '../../application/build-search-document';

// Mock dependencies
vi.mock('../../infrastructure/algolia-client', () => ({
  algoliaClient: {
    saveObjects: vi.fn(),
    deleteObject: vi.fn(),
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

describe('SearchIndexWorker', () => {
  it('should reindex part on PartUpdated', async () => {
    const worker = new SearchIndexWorker();
    await worker.processPartUpdated('part-123');

    expect(algoliaClient.saveObjects).toHaveBeenCalledWith({
      indexName: 'test_index',
      objects: [{ objectID: 'part-123', partId: 'part-123' }],
    });
  });

  it('should delete part from Algolia on PartDeleted', async () => {
    const worker = new SearchIndexWorker();
    await worker.processPartDeleted('part-123');

    expect(algoliaClient.deleteObject).toHaveBeenCalledWith({
      indexName: 'test_index',
      objectID: 'part-123',
    });
  });

  it('should batch process updates', async () => {
    const worker = new SearchIndexWorker();
    await worker.processPartsUpdated(['part-1', 'part-2']);

    expect(algoliaClient.saveObjects).toHaveBeenCalledWith({
      indexName: 'test_index',
      objects: [
        { objectID: 'part-123', partId: 'part-123' },
        { objectID: 'part-123', partId: 'part-123' },
      ],
    });
  });
});
