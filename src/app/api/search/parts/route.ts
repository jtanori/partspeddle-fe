import { NextRequest, NextResponse } from 'next/server';
import { AlgoliaSearchRepository } from '@/backend/modules/search/infrastructure/algolia-search-repository';
import { VehicleFitmentSearchService } from '@/backend/modules/search/application/vehicle-fitment-search-service';
import { searchRequestsTotal, searchSuccessTotal, searchFailuresTotal, searchLatencyMs, tracer } from '@/lib/observability';
import { logger } from '@/lib/logger';

const searchRepository = new AlgoliaSearchRepository();
const fitmentService = new VehicleFitmentSearchService();

export async function GET(req: NextRequest) {
  searchRequestsTotal.add(1);
  const startTime = performance.now();

  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const makeId = searchParams.get('makeId');
    const modelId = searchParams.get('modelId');
    const year = searchParams.get('year');
    const makeIds = searchParams.get('makeIds');
    const modelIds = searchParams.get('modelIds');
    const yearMin = searchParams.get('yearMin');
    const yearMax = searchParams.get('yearMax');
    const categoryIds = searchParams.get('categoryIds');
    const partTypeIds = searchParams.get('partTypeIds');
    const condition = searchParams.get('condition');
    const verifiedOnly = searchParams.get('verifiedOnly');
    const priceMin = searchParams.get('priceMin');
    const priceMax = searchParams.get('priceMax');
    const page = searchParams.get('page') || '0';
    const hitsPerPage = searchParams.get('hitsPerPage') || '20';

    let fitmentFilterIds: string[] | null = null;
    if (makeId && modelId && year) {
      fitmentFilterIds = await fitmentService.getPartIdsForVehicle(makeId, modelId, parseInt(year));
    }
    
    const filters = {
      makeIds: makeIds ? makeIds.split(',') : [],
      modelIds: modelIds ? modelIds.split(',') : [],
      yearMin: yearMin ? parseInt(yearMin) : undefined,
      yearMax: yearMax ? parseInt(yearMax) : undefined,
      categoryIds: categoryIds ? categoryIds.split(',') : [],
      partTypeIds: partTypeIds ? partTypeIds.split(',') : [],
      condition: condition ? condition.split(',') : [],
      verifiedOnly: verifiedOnly === 'true',
      priceMin: priceMin ? parseFloat(priceMin) : undefined,
      priceMax: priceMax ? parseFloat(priceMax) : undefined,
    };
    
    const result = await tracer.startActiveSpan('search-repository-query', async (span) => {
      span.setAttributes({ query: q, page, hitsPerPage });
      const searchResult = await searchRepository.search(
        q, 
        filters, 
        Number(page), 
        Number(hitsPerPage)
      );
      span.end();
      return searchResult;
    });

    const filteredHits = fitmentFilterIds 
      ? result.hits.filter(hit => fitmentFilterIds!.includes(hit.partId))
      : result.hits;

    searchSuccessTotal.add(1);
    searchLatencyMs.record(performance.now() - startTime);

    return NextResponse.json({ ...result, hits: filteredHits, totalHits: filteredHits.length });
  } catch (error: any) {
    searchFailuresTotal.add(1);
    logger.error('Search API handler failed', { error: error.message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
