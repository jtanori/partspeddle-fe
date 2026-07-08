import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface SearchNoResultsProps {
  onClearSearch: () => void;
}

export const SearchNoResults: React.FC<SearchNoResultsProps> = ({ onClearSearch }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 bg-transparent p-12">
      <AlertTriangle className="h-16 w-16 text-brand-primary/70" />
      <h3 className="font-display text-2xl font-black uppercase tracking-wider text-foreground-primary">
        PART NOT FOUND
      </h3>
      <button
        onClick={onClearSearch}
        className="font-display text-sm font-bold uppercase text-brand-primary transition-colors hover:text-brand-primary-hover"
      >
        BACK TO MARKETPLACE
      </button>
    </div>
  );
};
