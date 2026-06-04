import { Request, Response } from 'express';
import { algoliaClient, SEARCH_INDEX_NAME } from '../infrastructure/algolia-client';
import { logger } from '@/lib/logger';

export const getSearchSuggestionsHandler = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    // Query Algolia for autocomplete/suggestions
    // We can use a dedicated index for suggestions or search the main index with different settings
    const result = await algoliaClient.search({
      requests: [
        {
          indexName: SEARCH_INDEX_NAME,
          query: q,
          hitsPerPage: 5,
        },
      ],
    });

    const hits = result.results[0].hits;
    
    // Extract unique suggestions from hits (e.g., titles, part types)
    const suggestions = Array.from(new Set(hits.map((hit: any) => hit.title))).slice(0, 5);

    res.json({ suggestions });
  } catch (error: any) {
    logger.error('Failed to fetch search suggestions', { error });
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
};
