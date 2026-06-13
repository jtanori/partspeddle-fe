import { SearchFilters } from '../../../types';

export const serializeFilters = (filters: SearchFilters) => {
  const params = new URLSearchParams();
  if (filters.query) params.set('q', filters.query);
  if (filters.system) params.set('system', filters.system);
  if (filters.category) params.set('subsystem', filters.category);
  if (filters.partTypes && filters.partTypes.length > 0) params.set('part_type', filters.partTypes[0]);
  if (filters.fitmentMake && filters.fitmentMake !== 'All Makes') params.set('make', filters.fitmentMake);
  if (filters.fitmentModel && filters.fitmentModel !== 'All Models') params.set('model', filters.fitmentModel);
  if (filters.fitmentYear && filters.fitmentYear !== 'All Years') params.set('year', filters.fitmentYear);
  if (filters.fitmentEngine && filters.fitmentEngine !== 'All Engines') params.set('engine', filters.fitmentEngine);
  if (filters.featured) params.set('featured', 'true');
  return params.toString();
};
