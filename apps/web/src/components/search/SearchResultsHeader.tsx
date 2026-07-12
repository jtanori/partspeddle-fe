import React from 'react';
import { SearchFilters } from '@/types';
import { composeSearchHeader } from './utils/header-utils';

interface SearchResultsHeaderProps {
  filters: SearchFilters;
  totalCount: number;
  isLoading: boolean;
  className?: string;
}

export const SearchResultsHeader: React.FC<SearchResultsHeaderProps> = ({
  filters,
  totalCount,
  isLoading,
  className = '',
}) => {
  const { title, subtitle } = composeSearchHeader(filters, totalCount, isLoading);

  return (
    <div className={className}>
      <h1 className="font-display text-2xl font-bold uppercase tracking-tight text-foreground-primary">
        {title}
      </h1>
      <p className="mt-1 font-sans text-base text-foreground-muted">{subtitle}</p>
    </div>
  );
};
