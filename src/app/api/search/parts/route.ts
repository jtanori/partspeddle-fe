import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
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
import { validateBody, checkPayloadSize } from '@/lib/api/validation';
import { safeErrorResponse } from '@/lib/api/errors';
import { rateLimit } from '@/lib/api/rate-limit';

const searchPartsSchema = z.object({
  query: z.string().optional().default(''),
  page: z.coerce.number().int().min(0).max(1000).optional().default(0),
  hitsPerPage: z.coerce.number().int().min(1).max(100).optional().default(20),
  fitment: z
    .object({
      makeId: z.string(),
      modelId: z.string(),
      year: z.union([z.string(), z.number()]),
    })
    .optional(),
  system: z.union([z.string(), z.array(z.string())]).optional(),
  category: z.union([z.string(), z.array(z.string())]).optional(),
  partTypes: z.union([z.string(), z.array(z.string())]).optional(),
  fitmentMake: z.string().optional(),
  fitmentModel: z.string().optional(),
  fitmentYear: z.union([z.string(), z.number()]).optional(),
  fitmentEngine: z.string().optional(),
  conditions: z.union([z.string(), z.array(z.string())]).optional(),
  priceRange: z.tuple([z.number(), z.number()]).optional(),
  sellerType: z.string().optional(),
  sortBy: z.enum(['relevance', 'price_asc', 'price_desc', 'newest']).optional(),
});

const searchRepository = new AlgoliaSearchRepository();

export async function POST(req: NextRequest) {
  searchRequestsTotal.add(1);
  const startTime = performance.now();

  const rateLimited = rateLimit(req, {
    keyPrefix: 'search:anonymous',
    limit: 30,
    windowSeconds: 60,
  });
  if (rateLimited) {
    return rateLimited;
  }

  const tooLarge = checkPayloadSize(req, 1024 * 1024); // 1 MB
  if (tooLarge) {
    return tooLarge;
  }

  const validated = await validateBody(searchPartsSchema, req);
  if (!validated.success) {
    return validated.response;
  }

  const body = validated.data;

  const query = body.query ?? '';
  if (query.length > 1000) {
    return safeErrorResponse('Query too long', 400);
  }

  try {
    const filters: SearchFilters = {
      makeIds:
        body.fitmentMake && body.fitmentMake !== 'All Makes'
          ? Array.isArray(body.fitmentMake)
            ? body.fitmentMake
            : [body.fitmentMake]
          : [],
      modelIds:
        body.fitmentModel && body.fitmentModel !== 'All Models'
          ? Array.isArray(body.fitmentModel)
            ? body.fitmentModel
            : [body.fitmentModel]
          : [],
      yearMin:
        body.fitmentYear && body.fitmentYear !== 'All Years'
          ? typeof body.fitmentYear === 'string'
            ? parseInt(body.fitmentYear, 10)
            : body.fitmentYear
          : undefined,
      categoryIds: Array.isArray(body.category)
        ? body.category
        : body.category
          ? [body.category]
          : [],
      partTypeIds: Array.isArray(body.partTypes)
        ? body.partTypes
        : body.partTypes
          ? [body.partTypes]
          : [],
      condition: Array.isArray(body.conditions)
        ? body.conditions
        : body.conditions
          ? [body.conditions]
          : [],
      verifiedOnly: body.sellerType === 'trusted',
      priceMin:
        Array.isArray(body.priceRange) && body.priceRange[0] > 0 ? body.priceRange[0] : undefined,
      priceMax:
        Array.isArray(body.priceRange) && body.priceRange[1] < 10000
          ? body.priceRange[1]
          : undefined,
      sortBy: body.sortBy,
    };

    if (body.fitment?.makeId && body.fitment?.modelId && body.fitment?.year) {
      filters.fitmentSignatures = [
        `${body.fitment.makeId}:${body.fitment.modelId}:${body.fitment.year}`,
      ];
    }

    const result = await tracer.startActiveSpan('search-repository-query', async (span) => {
      span.setAttributes({ query, page: body.page, hitsPerPage: body.hitsPerPage });
      const searchResult = await searchRepository.search(
        query,
        filters,
        body.page ?? 0,
        body.hitsPerPage ?? 20,
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
    return NextResponse.json({
      hits: [],
      facets: {},
      totalHits: 0,
      page: 0,
      totalPages: 0,
      warning: `Search currently unavailable: ${message}`,
    });
  }
}
