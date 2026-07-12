export type FacetType = 'checkbox' | 'range' | 'select';

export interface FacetConfig {
  key: string;
  label: string;
  type: FacetType;
}

export const SEARCH_FACETS: FacetConfig[] = [
  { key: 'category', label: 'Category', type: 'checkbox' },
  { key: 'part_type', label: 'Part Type', type: 'checkbox' },
  { key: 'condition', label: 'Condition', type: 'checkbox' },
  { key: 'make', label: 'Make', type: 'checkbox' },
  { key: 'model', label: 'Model', type: 'checkbox' },
  { key: 'year', label: 'Year', type: 'checkbox' },
  { key: 'price', label: 'Price Range', type: 'range' },
];
