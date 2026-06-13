import { algoliaClient, SEARCH_INDEX_NAME } from '../infrastructure/algolia-client';
import { BuildSearchDocumentUseCase } from '../application/build-search-document';
import { SearchDocument } from '../domain/search-document';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { indexUpdatesTotal, indexFailuresTotal, workerRetriesTotal } from '@/lib/observability';

export class SearchIndexWorker {
  private builder: BuildSearchDocumentUseCase;

  constructor() {
    this.builder = new BuildSearchDocumentUseCase();
  }

    async processPartDeleted(partId: string): Promise<void> {
    try {
        await this.withRetry(async () => {
            await algoliaClient.deleteObject({
                indexName: SEARCH_INDEX_NAME,
                objectID: partId,
            });
            logger.info('Part deleted from index successfully', { partId });
        });
    } catch (error) {
        indexFailuresTotal.add(1);
        logger.error('Failed to delete part from index', { partId, error });
        throw error;
    }
  }

  async processPartsUpdated(partIds: string[]): Promise<void> {
    logger.info('Processing batch part update', { count: partIds.length });

    const documents = await Promise.all(partIds.map(async (id) => {
        try {
            return await this.builder.execute(id);
        } catch (e) {
            indexFailuresTotal.add(1);
            logger.error('Failed to build search document', { partId: id, error: e });
            return null;
        }
    }));

    const validDocuments = documents.filter(doc => doc !== null) as SearchDocument[];

    if (validDocuments.length > 0) {
        await this.withRetry(async () => {
          await algoliaClient.saveObjects({
            indexName: SEARCH_INDEX_NAME,
            objects: validDocuments as unknown as Record<string, unknown>[],
          });
          indexUpdatesTotal.add(validDocuments.length);
        });
    }
  }

  async processPartUpdated(partId: string): Promise<void> {
    try {
        const document = await this.builder.execute(partId);
        await this.withRetry(async () => {
            await algoliaClient.saveObjects({
                indexName: SEARCH_INDEX_NAME,
                objects: [document as unknown as Record<string, unknown>],
            });
            indexUpdatesTotal.add(1);
            logger.info('Part reindexed successfully', { partId });
        });
    } catch (error) {
        indexFailuresTotal.add(1);
        logger.error('Failed to reindex part', { partId, error });
        throw error;
    }
  }
// ...

  private async withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries <= 0) {
        logger.error('Retry exhausted', { error });
        throw error;
      }
      workerRetriesTotal.add(1);
      logger.info('Retrying operation', { retries });
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.withRetry(fn, retries - 1, delay * 2);
    }
  }
}
