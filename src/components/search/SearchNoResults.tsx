import React from 'react';
import { SearchX } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';

interface SearchNoResultsProps {
  onClearSearch: () => void;
}

export const SearchNoResults: React.FC<SearchNoResultsProps> = ({ onClearSearch }) => {
  return (
    <EmptyState
      title="No parts found"
      description="Try adjusting your filters or search terms to find what you're looking for."
      actionText="Clear Search"
      onAction={onClearSearch}
      icon={<SearchX className="h-12 w-12 text-brand-primary" />}
    />
  );
};
