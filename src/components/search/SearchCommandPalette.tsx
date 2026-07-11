'use client';

import * as React from 'react';
import { Search, Clock, TrendingUp, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog } from '@base-ui/react/dialog';
import { SearchInput } from '@/components/ui/search-input';
import { SearchDropdownController } from './SearchDropdownController';
import { SearchResultsDropdown } from './SearchResultsDropdown';
import { LiveSearchResults, SearchSuggestion } from './types/search-types';
import { useSearchCommandRegistry } from './utils/search-command-registry';
import { SearchInputState } from './hooks/useSearchStateMachine';

export interface SearchCommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function SearchCommandPalette({ open, onClose }: SearchCommandPaletteProps) {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<
    LiveSearchResults | Record<'recent' | 'popular', SearchSuggestion[]> | null
  >(null);
  const [loading, setLoading] = React.useState(false);
  const { executeCommand } = useSearchCommandRegistry();

  const handleSelect = React.useCallback(
    (suggestion: SearchSuggestion) => {
      executeCommand(suggestion);
      onClose();
      setQuery('');
      setResults(null);
    },
    [executeCommand, onClose],
  );

  const handleViewAll = React.useCallback(() => {
    window.location.href = `/search?q=${encodeURIComponent(query)}`;
    onClose();
  }, [query, onClose]);

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen: boolean) => !isOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop
          className="fixed inset-0 z-50 bg-foreground-primary/50 backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
        <Dialog.Popup
          className={cn(
            'fixed left-1/2 top-[15%] z-50 w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 rounded-xl border border-stroke-subtle bg-surface-primary shadow-floating outline-none focus-visible:ring-2 focus-visible:ring-brand-primary',
          )}
        >
          <div className="border-b border-stroke-subtle p-3">
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-foreground-muted" />
              <SearchInput
                value={query}
                onChange={(value) => setQuery(value)}
                onSubmit={(value) => {
                  if (value.trim()) {
                    handleViewAll();
                  }
                }}
                placeholder="Search parts, vehicles, categories, sellers..."
                className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                formClassName="flex-1"
                autoFocus
              />
              {loading && <Loader2 className="h-5 w-5 animate-spin text-foreground-muted" />}
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1 text-foreground-muted outline-none transition-colors hover:bg-surface-secondary hover:text-foreground-primary focus-visible:ring-2 focus-visible:ring-brand-primary"
                aria-label="Close command palette"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {results ? (
              <SearchResultsDropdown
                results={results}
                onSelect={handleSelect}
                onViewAll={handleViewAll}
                query={query}
                onClose={onClose}
              />
            ) : (
              <div className="p-8 text-center text-foreground-secondary">
                <Search className="mx-auto h-10 w-10 text-foreground-muted" />
                <p className="mt-3">Start typing to search across the marketplace.</p>
                <div className="mt-4 flex items-center justify-center gap-4 text-meta text-foreground-muted">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Recent
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> Trending
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-stroke-subtle px-4 py-2 text-meta text-foreground-muted">
            <div className="flex items-center gap-3">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>esc Close</span>
            </div>
            <div>
              <span>Cmd/Ctrl + K to open</span>
            </div>
          </div>

          <SearchDropdownController
            query={query}
            onResults={(nextResults) => {
              setResults(nextResults);
              setLoading(false);
            }}
            onStateChange={(state) => {
              setLoading(state === SearchInputState.LOADING);
            }}
          />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
