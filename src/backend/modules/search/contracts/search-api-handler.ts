import { Request, Response } from 'express';
import { AlgoliaSearchRepository } from '../infrastructure/algolia-search-repository';
import { VehicleFitmentSearchService } from '../application/vehicle-fitment-search-service';
import { searchRequestsTotal, searchSuccessTotal, searchFailuresTotal, searchLatencyMs, tracer } from '@/lib/observability';
import { logger } from '@/lib/logger';

const searchRepository = new AlgoliaSearchRepository();
const fitmentService = new VehicleFitmentSearchService();

export const searchPartsHandler = async (req: Request, res: Response) => {
  searchRequestsTotal.add(1);
  const startTime = performance.now();

  try {
    const { 
      q = '', 
      makeId, modelId, year,
      makeIds, modelIds, yearMin, yearMax,
      categoryIds, partTypeIds, condition, verifiedOnly, priceMin, priceMax,
      page = 0, hitsPerPage = 20
    } = req.query;

    // ... (fitment logic from original file) ...
    let fitmentFilterIds: string[] | null = null;
    if (makeId && modelId && year) {
      fitmentFilterIds = await fitmentService.getPartIdsForVehicle(makeId as string, modelId as string, parseInt(year as string));
    }
    
    const filters = {
      makeIds: makeIds ? (makeIds as string).split(',') : [],
      modelIds: modelIds ? (modelIds as string).split(',') : [],
      yearMin: yearMin ? parseInt(yearMin as string) : undefined,
      yearMax: yearMax ? parseInt(yearMax as string) : undefined,
      categoryIds: categoryIds ? (categoryIds as string).split(',') : [],
      partTypeIds: partTypeIds ? (partTypeIds as string).split(',') : [],
      condition: condition ? (condition as string).split(',') : [],
      verifiedOnly: verifiedOnly === 'true',
      priceMin: priceMin ? parseFloat(priceMin as string) : undefined,
      priceMax: priceMax ? parseFloat(priceMax as string) : undefined,
    };
    
    const result = await tracer.startActiveSpan('search-repository-query', async (span) => {
      span.setAttributes({ query: q, page, hitsPerPage });
      const searchResult = await searchRepository.search(
        q as string, 
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

    res.json({ ...result, hits: filteredHits, totalHits: filteredHits.length });
  } catch (error: any) {
    searchFailuresTotal.add(1);
    logger.error('Search API handler failed', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

