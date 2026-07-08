import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const SearchInitialState: React.FC = () => {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center justify-center space-y-4 rounded border border-stroke-subtle bg-surface-primary p-12 shadow-sm md:max-w-md lg:max-w-2xl">
      <AlertTriangle className="h-12 w-12 text-brand-primary" />
      <h3 className="font-display text-lg font-bold uppercase text-foreground-primary">
        Start Your Search
      </h3>
      <p className="text-center font-sans text-xs leading-relaxed text-foreground-muted">
        Use the filters or search bar to explore our OEM auto parts.
      </p>
    </div>
  );
};
