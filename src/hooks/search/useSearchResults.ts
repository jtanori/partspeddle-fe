import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchParts } from '@/services/search/search-parts';
import { SearchAnalyticsService } from '@/services/SearchAnalyticsService';
import { SearchFilters } from '@/types';

export const useSearchResults = (filters: SearchFilters, sortBy: string) => {
  return useInfiniteQuery({
    queryKey: ['parts', filters, sortBy],
    queryFn: async ({ pageParam = 0 }) => {
      // Instrument SEARCH_EXECUTED
      SearchAnalyticsService.logSearchExecuted(filters.query, filters);
      
      const results = await fetchParts(filters, pageParam as number);

      // Sort logic
      let sorted = [...results.hits];

      if (sortBy === 'price-low') {
        sorted.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price-high') {
        sorted.sort((a, b) => b.price - a.price);
      } else if (sortBy === 'mileage') {
        sorted.sort((a, b) => {
          const ma = typeof a.mileage === 'number' ? a.mileage : 999999;
          const mb = typeof b.mileage === 'number' ? b.mileage : 999999;
          return ma - mb;
        });
      }
      return sorted;
    },
    getNextPageParam: (lastPage, pages) => lastPage.length > 0 ? pages.length : undefined,
    initialPageParam: 0,
    staleTime: 60 * 1000,
  });
};
