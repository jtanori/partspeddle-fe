import { NextRequest, NextResponse } from 'next/server';
import { AlgoliaSearchRepository } from '@/backend/modules/search/infrastructure/algolia-search-repository';
import { SearchFilters } from '@/backend/modules/search/domain/search-filters';
import {
  searchRequestsTotal,
  searchSuccessTotal,
  searchFailuresTotal,
  searchLatencyMs,
  tracer,
} from '@/lib/observability';
import { logger } from '@/lib/logger';

const searchRepository = new AlgoliaSearchRepository();

export async function POST(req: NextRequest) {
  searchRequestsTotal.add(1);
  const startTime = performance.now();

  try {
    const body = await req.json();
    const {
      query = '',
      page = 0,
      hitsPerPage = 20,
      fitment, // Optional: { makeId, modelId, year }
      system,
      category,
      partTypes,
      fitmentMake,
      fitmentModel,
      fitmentYear,
      fitmentEngine,
      conditions,
      priceRange,
      sellerType,
      sortBy,
    } = body;

    if (query && query.length > 1000) {
      return NextResponse.json({ error: 'Query too long' }, { status: 400 });
    }

    const filters: SearchFilters = {
      makeIds:
        fitmentMake && fitmentMake !== 'All Makes'
          ? Array.isArray(fitmentMake)
            ? fitmentMake
            : [fitmentMake]
          : [],
      modelIds:
        fitmentModel && fitmentModel !== 'All Models'
          ? Array.isArray(fitmentModel)
            ? fitmentModel
            : [fitmentModel]
          : [],
      yearMin:
        fitmentYear && fitmentYear !== 'All Years'
          ? typeof fitmentYear === 'string'
            ? parseInt(fitmentYear)
            : fitmentYear
          : undefined,
      categoryIds: category ? (Array.isArray(category) ? category : [category]) : [],
      partTypeIds: Array.isArray(partTypes) ? partTypes : partTypes ? [partTypes] : [],
      condition: Array.isArray(conditions) ? conditions : conditions ? [conditions] : [],
      verifiedOnly: sellerType === 'trusted',
      // Ignore default range [0, 10000]
      priceMin: Array.isArray(priceRange) && priceRange[0] > 0 ? priceRange[0] : undefined,
      priceMax: Array.isArray(priceRange) && priceRange[1] < 10000 ? priceRange[1] : undefined,
      sortBy,
    };

    if (fitment?.makeId && fitment?.modelId && fitment?.year) {
      filters.fitmentSignatures = [`${fitment.makeId}:${fitment.modelId}:${fitment.year}`];
    }

    const result = await tracer.startActiveSpan('search-repository-query', async (span) => {
      span.setAttributes({ query, page, hitsPerPage });
      const searchResult = await searchRepository.search(
        query,
        filters,
        Number(page),
        Number(hitsPerPage),
      );
      span.end();
      return searchResult;
    });

    searchSuccessTotal.add(1);
    searchLatencyMs.record(performance.now() - startTime);

    return NextResponse.json({
      hits: result.hits,
      facets: result.facets || {},
      totalHits: result.totalHits,
      page: result.page,
      totalPages: result.totalPages,
    });
  } catch (error) {
    searchFailuresTotal.add(1);
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Search API failure', { error: message });
    return NextResponse.json({ error: 'Search temporarily unavailable' }, { status: 500 });
  }
}
