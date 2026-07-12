import { NextRequest, NextResponse } from 'next/server';
import {
  algoliaClient,
  SEARCH_INDEX_NAME,
} from '@/backend/modules/search/infrastructure/algolia-client';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');

    if (!q || q.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const result = await algoliaClient.search({
      requests: [
        {
          indexName: SEARCH_INDEX_NAME,
          query: q,
          hitsPerPage: 5,
        },
      ],
    });

    const firstResult = result.results[0];
    const hits = (firstResult && 'hits' in firstResult ? firstResult.hits : []) as Array<{
      title?: string;
    }>;
    const suggestions = Array.from(
      new Set(
        hits.map((hit) => hit.title).filter((title): title is string => typeof title === 'string'),
      ),
    ).slice(0, 5);

    return NextResponse.json({ suggestions });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to fetch search suggestions', { error: message });
    return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
  }
}
