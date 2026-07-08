import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { SearchFilters, PartCondition } from '../types';
import { useTaxonomy } from '../hooks/useTaxonomy';
import { InlineLoadingIndicator } from './common/InlineLoadingIndicator';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProductSidebarProps {
  filters: SearchFilters;
  facets?: any;
  clearAllFilters: () => void;
  toggleSection: (sec: string) => void;
  collapsedSections: Record<string, boolean>;
  sortBy: string;
  setSortBy: (sort: string) => void;
  getSystemPartCount: (sys: string) => string;
  getConditionCount: (cond: PartCondition) => number;
  getSellerTypeCount: (type: 'all' | 'trusted') => number;
  togglePartType: (type: string) => void;
  toggleCondition: (cond: PartCondition) => void;
  handlePriceChange: (index: number, val: number) => void;
  setAndSyncFilters: (updateFn: (prev: SearchFilters) => SearchFilters) => void;
  isDisabled?: boolean;
}

export const ProductSidebar: React.FC<ProductSidebarProps> = ({
  filters,
  facets = {},
  clearAllFilters,
  toggleSection,
  collapsedSections,
  sortBy: _sortBy,
  setSortBy: _setSortBy,
  getSystemPartCount: _getSystemPartCount,
  getConditionCount,
  getSellerTypeCount: _getSellerTypeCount,
  togglePartType,
  toggleCondition,
  handlePriceChange,
  setAndSyncFilters,
  isDisabled = false,
}) => {
  const { taxonomy, loading } = useTaxonomy();

  const selectedSystem = filters.system || '';
  const selectedCategorySlug = filters.category || '';

  const categories = selectedSystem ? taxonomy?.categoriesBySystem[selectedSystem] || [] : [];

  const selectedCategory = selectedCategorySlug
    ? taxonomy?.categoryBySlug[selectedCategorySlug]
    : undefined;

  const partTypes = selectedCategory
    ? taxonomy?.partTypesByCategory[selectedCategory.id] || []
    : [];

  const checkboxClass = 'h-4 w-4 rounded accent-brand-primary';

  const selectClass =
    'w-full rounded border border-stroke-subtle bg-surface-primary p-2 text-sm text-foreground-primary outline-none focus:border-brand-primary';

  if (loading) {
    return (
      <div
        className="relative rounded-xl border border-stroke-subtle bg-surface-primary p-5 shadow-sm"
        id="unified-filters-card"
      >
        <InlineLoadingIndicator label="Loading taxonomy..." />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative space-y-6 rounded-xl border border-stroke-subtle bg-surface-primary p-4 shadow-sm sm:p-5',
        isDisabled && 'opacity-60',
      )}
      id="unified-filters-card"
    >
      {/* FILTER BY Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 pb-1">
          <h2 className="select-none font-display text-[11px] font-black uppercase tracking-widest text-brand-primary">
            FILTER BY
          </h2>
          <div className="h-px flex-grow bg-stroke-subtle" />
        </div>
        <button
          onClick={clearAllFilters}
          className="border-none bg-transparent text-[10px] font-bold uppercase text-foreground-muted transition-colors hover:text-brand-primary"
        >
          Clear All
        </button>
      </div>

      {/* Filter Sections */}
      {[
        {
          id: 'fitment',
          title: 'Fitment',
          content: (
            <div className="space-y-2">
              <select
                value={filters.fitmentMake}
                onChange={(e) =>
                  setAndSyncFilters((p) => ({
                    ...p,
                    fitmentMake: e.target.value,
                    fitmentModel: 'All Models',
                  }))
                }
                className={selectClass}
              >
                <option value="All Makes">All Makes</option>
                {facets.make &&
                  Object.keys(facets.make).map((make) => (
                    <option key={make} value={make}>
                      {make} ({facets.make[make]})
                    </option>
                  ))}
              </select>
              <select
                value={filters.fitmentModel}
                onChange={(e) =>
                  setAndSyncFilters((p) => ({
                    ...p,
                    fitmentModel: e.target.value,
                  }))
                }
                className={selectClass}
                disabled={filters.fitmentMake === 'All Makes'}
              >
                <option value="All Models">All Models</option>
                {facets.model &&
                  Object.keys(facets.model).map((model) => (
                    <option key={model} value={model}>
                      {model} ({facets.model[model]})
                    </option>
                  ))}
              </select>
              <select
                value={filters.fitmentYear}
                onChange={(e) =>
                  setAndSyncFilters((p) => ({
                    ...p,
                    fitmentYear: e.target.value,
                  }))
                }
                className={selectClass}
              >
                <option value="All Years">All Years</option>
                {facets.year &&
                  Object.keys(facets.year)
                    .sort((a, b) => b.localeCompare(a))
                    .map((year) => (
                      <option key={year} value={year}>
                        {year} ({facets.year[year]})
                      </option>
                    ))}
              </select>
            </div>
          ),
        },
        {
          id: 'manufacturer',
          title: 'Manufacturer',
          content: (
            <div className="max-h-40 space-y-1 overflow-y-auto">
              {facets.make &&
                Object.keys(facets.make).map((make) => (
                  <label
                    key={make}
                    className="flex cursor-pointer items-center gap-2 text-sm text-foreground-secondary"
                  >
                    <input
                      type="checkbox"
                      checked={filters.fitmentMake === make}
                      onChange={() =>
                        setAndSyncFilters((p) => ({
                          ...p,
                          fitmentMake: p.fitmentMake === make ? 'All Makes' : make,
                        }))
                      }
                      className={checkboxClass}
                    />
                    {make} ({facets.make[make]})
                  </label>
                ))}
            </div>
          ),
        },
        {
          id: 'category',
          title: 'Category',
          content: (
            <div className="space-y-2">
              <select
                value={filters.system}
                onChange={(e) =>
                  setAndSyncFilters((p) => ({
                    ...p,
                    system: e.target.value,
                    category: '',
                    partTypes: [],
                  }))
                }
                className={selectClass}
              >
                <option value="">All Systems</option>
                {taxonomy?.systems.map((sys: string) => (
                  <option key={sys} value={sys}>
                    {sys}
                  </option>
                ))}
              </select>
              {filters.system && (
                <select
                  value={filters.category}
                  onChange={(e) =>
                    setAndSyncFilters((p) => ({
                      ...p,
                      category: e.target.value,
                      partTypes: [],
                    }))
                  }
                  className={selectClass}
                >
                  <option value="">All Assemblies</option>
                  {categories.map((cat: any) => (
                    <option key={cat.slug_en} value={cat.slug_en}>
                      {cat.name_en || cat.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ),
        },
        {
          id: 'partType',
          title: 'Part Type',
          content: (
            <div className="max-h-40 space-y-1 overflow-y-auto">
              {partTypes.map((type: any) => (
                <label
                  key={type.slug_en}
                  className="flex cursor-pointer items-center gap-2 text-sm text-foreground-secondary"
                >
                  <input
                    type="checkbox"
                    checked={filters.partTypes.includes(type.slug_en)}
                    onChange={() => togglePartType(type.slug_en)}
                    className={checkboxClass}
                  />
                  {type.name_en || type.name}
                </label>
              ))}
            </div>
          ),
        },
        {
          id: 'condition',
          title: 'Condition',
          content: (
            <div className="space-y-1">
              {(['Used OEM', 'OEM Original', 'Excellent', 'Good', 'For Parts'] as any[]).map(
                (cond) => (
                  <label
                    key={cond}
                    className="flex cursor-pointer items-center gap-2 text-sm text-foreground-secondary"
                  >
                    <input
                      type="checkbox"
                      checked={filters.conditions.includes(cond)}
                      onChange={() => toggleCondition(cond)}
                      className={checkboxClass}
                    />
                    {cond} ({getConditionCount(cond)})
                  </label>
                ),
              )}
            </div>
          ),
        },
        {
          id: 'price',
          title: 'Price Range',
          content: (
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="$ Min"
                value={filters.priceRange[0]}
                onChange={(e) => handlePriceChange(0, parseInt(e.target.value))}
                className={selectClass}
              />
              <span className="text-foreground-muted">-</span>
              <input
                type="number"
                placeholder="$ Max"
                value={filters.priceRange[1]}
                onChange={(e) => handlePriceChange(1, parseInt(e.target.value))}
                className={selectClass}
              />
            </div>
          ),
        },
      ].map((section) => (
        <div key={section.id} className="space-y-2">
          <div
            onClick={() => toggleSection(section.id)}
            className="flex cursor-pointer items-center justify-between border-b border-stroke-subtle pb-2"
          >
            <span className="font-display text-sm uppercase tracking-wider text-foreground-primary">
              {section.title}
            </span>
            {collapsedSections[section.id] ? (
              <ChevronRight className="h-4 w-4 text-foreground-muted" />
            ) : (
              <ChevronDown className="h-4 w-4 text-foreground-muted" />
            )}
          </div>
          {!collapsedSections[section.id] && section.content}
        </div>
      ))}

      {/* Apply Filters Button */}
      <Button className="w-full font-display text-xs font-black uppercase tracking-widest">
        Apply Filters
      </Button>
    </div>
  );
};
