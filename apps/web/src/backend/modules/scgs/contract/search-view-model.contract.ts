import { z } from 'zod';

/**
 * SCGS SearchViewModel contract.
 *
 * This is the canonical projection contract returned by SCGS-powered search.
 * All UI consumers must treat this schema as authoritative.
 */

export const searchResultCardSchema = z.object({
  id: z.string(),
  title: z.string(),
  price: z.string(),
  imageUrl: z.string().optional(),
  subtitle: z.string().optional(),
  conditionLabel: z.string().optional(),
  conditionColor: z.string().optional(),
  sellerName: z.string().optional(),
  sellerRating: z.number().optional(),
  sellerReviewCount: z.number().optional(),
  fitmentSummary: z.string().optional(),
  badges: z.object({
    isOEM: z.boolean(),
    isTested: z.boolean(),
    isGoodFit: z.boolean(),
  }),
  facets: z.record(z.union([z.string(), z.number(), z.boolean()])),
});

export const facetValueSchema = z.object({
  value: z.string(),
  count: z.number(),
  selected: z.boolean(),
});

export const facetViewModelSchema = z.object({
  key: z.string(),
  label: z.string(),
  values: z.array(facetValueSchema),
});

export const paginationSchema = z.object({
  page: z.number().int().nonnegative(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  hasNext: z.boolean().optional(),
  hasPrevious: z.boolean().optional(),
});

export const searchMetaSchema = z.object({
  source: z.union([z.literal('ALGOLIA'), z.literal('SCGS')]),
  query: z.string().optional(),
  queryMs: z.number().optional(),
  rankingVersion: z.string().optional(),
  generatedAt: z.string().datetime().optional(),
});

export const searchViewModelSchema = z.object({
  results: z.array(searchResultCardSchema),
  facets: z.array(facetViewModelSchema),
  pagination: paginationSchema,
  meta: searchMetaSchema,
});

export type SearchResultCardModel = z.infer<typeof searchResultCardSchema>;
export type FacetValueModel = z.infer<typeof facetValueSchema>;
export type FacetViewModel = z.infer<typeof facetViewModelSchema>;
export type SearchPaginationModel = z.infer<typeof paginationSchema>;
export type SearchMetaModel = z.infer<typeof searchMetaSchema>;
export type SearchViewModel = z.infer<typeof searchViewModelSchema>;
