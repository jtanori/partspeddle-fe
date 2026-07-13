import { AlgoliaSearchRepository } from '@/backend/modules/search/infrastructure/algolia-search-repository';
import type { SearchDocument } from '@/backend/modules/search/domain/search-document';
import { parseQueryIntent } from '../infrastructure/query-intent-parser';
import type { LiveSearchViewModel } from '../contract/live-search-view-model.contract';

export interface BuildLiveSearchViewModelInput {
  query: string;
  hitsPerPage?: number;
}

function productSuggestion(hit: SearchDocument) {
  const subtitle = `${hit.make ?? ''} ${hit.model ?? ''} ${hit.year ?? ''}`.trim();
  return {
    id: hit.objectID,
    type: 'product' as const,
    title: hit.title,
    subtitle: subtitle.length > 0 ? subtitle : undefined,
    imageUrl: hit.image_url ?? undefined,
    href: `/listing/${hit.objectID}`,
    meta: {
      price: hit.price,
      condition: hit.condition,
      sellerVerified: hit.seller_verified,
      sellerTrustScore: hit.seller_trust_score,
    },
  };
}

function vehicleSuggestionFromHit(hit: SearchDocument) {
  if (!hit.make || !hit.model) return null;
  const meta: Record<string, string | number | boolean> = { make: hit.make, model: hit.model };
  if (hit.year !== null && hit.year !== undefined) {
    meta.year = hit.year;
  }
  return {
    id: `vehicle:${hit.make}:${hit.model}:${hit.year ?? ''}`,
    type: 'vehicle' as const,
    title: `${hit.year ? `${hit.year} ` : ''}${hit.make} ${hit.model}`,
    href: `/search?make=${encodeURIComponent(hit.make)}&model=${encodeURIComponent(hit.model)}${hit.year ? `&year=${hit.year}` : ''}`,
    meta,
  };
}

function taxonomySuggestionFromHit(hit: SearchDocument) {
  if (!hit.category) return null;
  return {
    id: `category:${hit.category}`,
    type: 'taxonomy' as const,
    title: hit.category_label || hit.category,
    href: `/search?category=${encodeURIComponent(hit.category)}`,
    meta: { category: hit.category },
  };
}

function manufacturerSuggestionFromHit(hit: SearchDocument) {
  if (!hit.make) return null;
  return {
    id: `make:${hit.make}`,
    type: 'manufacturer' as const,
    title: hit.make,
    href: `/search?make=${encodeURIComponent(hit.make)}`,
    meta: { make: hit.make },
  };
}

export async function buildLiveSearchViewModel(
  input: BuildLiveSearchViewModelInput,
  deps: { searchRepository?: AlgoliaSearchRepository } = {},
): Promise<LiveSearchViewModel> {
  const startTime = performance.now();
  const query = input.query.trim();
  const intent = parseQueryIntent(query);
  const searchRepository = deps.searchRepository ?? new AlgoliaSearchRepository();

  const products: ReturnType<typeof productSuggestion>[] = [];
  const vehicles: ReturnType<typeof vehicleSuggestionFromHit>[] = [];
  const taxonomy: ReturnType<typeof taxonomySuggestionFromHit>[] = [];
  const manufacturers: ReturnType<typeof manufacturerSuggestionFromHit>[] = [];

  if (query.length >= 2) {
    const result = await searchRepository.search(query, {}, 0, input.hitsPerPage ?? 10);

    for (const hit of result.hits) {
      products.push(productSuggestion(hit));

      const vehicle = vehicleSuggestionFromHit(hit);
      if (vehicle && !vehicles.some((v) => v?.id === vehicle.id)) {
        vehicles.push(vehicle);
      }

      const tax = taxonomySuggestionFromHit(hit);
      if (tax && !taxonomy.some((t) => t?.id === tax.id)) {
        taxonomy.push(tax);
      }

      const make = manufacturerSuggestionFromHit(hit);
      if (make && !manufacturers.some((m) => m?.id === make.id)) {
        manufacturers.push(make);
      }
    }
  }

  const groups = [
    { key: 'products', label: 'Products', suggestions: products.slice(0, 5) },
    {
      key: 'vehicles',
      label: 'Vehicles',
      suggestions: vehicles.filter((v): v is NonNullable<typeof v> => v !== null).slice(0, 3),
    },
    {
      key: 'taxonomy',
      label: 'Categories',
      suggestions: taxonomy.filter((t): t is NonNullable<typeof t> => t !== null).slice(0, 3),
    },
    {
      key: 'manufacturers',
      label: 'Makes',
      suggestions: manufacturers.filter((m): m is NonNullable<typeof m> => m !== null).slice(0, 3),
    },
  ].filter((group) => group.suggestions.length > 0);

  return {
    intent: {
      type: intent.type,
      raw: intent.raw,
      entities: intent.entities,
    },
    groups,
    meta: {
      query,
      queryMs: Math.round(performance.now() - startTime),
      compilerVersion: '1.0.0',
      generatedAt: new Date().toISOString(),
    },
  };
}
