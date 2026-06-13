import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchDropdownController } from "../search/SearchDropdownController";
import { SearchResultsDropdown } from "../search/SearchResultsDropdown";
import { useSearchCommandRegistry } from "../search/utils/search-command-registry";
import { LiveSearchResults } from "../search/types/search-types";
import { saveRecentSearch } from "../search/utils/recent-searches";

interface NavbarSearchProps {
  placeholderText: string;
}

export const NavbarSearch: React.FC<NavbarSearchProps> = ({
  placeholderText,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<
    LiveSearchResults | { recent: any[]; popular: any[] } | null
  >(null);
  const [isFocused, setIsFocused] = useState(false);
  const { executeCommand } = useSearchCommandRegistry();

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (query) {
      saveRecentSearch(query);
      router.push(`/search?q=${encodeURIComponent(query)}`);
    } else {
      router.push("/search");
    }
    setIsFocused(false);
  };

  return (
    <div
      className="relative w-80 lg:w-96 hidden min-[860px]:block portrait:!hidden"
      id="tour-search"
      onBlur={(e) => {
        // Prevent closing when clicking inside dropdown
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsFocused(false);
        }
      }}
    >
      <form onSubmit={handleSearchSubmit} className="relative">
        <input
          name="q"
          type="text"
          autoComplete="off"
          placeholder={placeholderText}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="w-full bg-charcoal border border-oil-dark rounded-sm px-3 py-2 text-sm text-base-cream placeholder-warm-gray focus:outline-none focus:border-rust-copper focus:ring-1 focus:ring-rust-copper/50 transition-all font-sans font-medium h-[40px] pr-16"
          id="input-nav-search"
        />
        <div className="absolute right-3 top-2.5 flex items-center gap-2">
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setIsFocused(true);
              }}
              className="text-warm-gray hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="text-warm-gray hover:text-rust-copper cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </form>

      {isFocused && (
        <SearchDropdownController
          query={query}
          onResults={setResults}
          onStateChange={(state) => {
            if (state === 6) setIsFocused(false); // Executed state
          }}
        />
      )}

      {isFocused && results && (
        <SearchResultsDropdown
          results={results}
          onSelect={(s) => {
            executeCommand(s);
            setIsFocused(false);
          }}
          onViewAll={() => handleSearchSubmit()}
          onViewAllSection={(section) => {
            // Navigate to search page with current query
            handleSearchSubmit();
          }}
          query={query}
          onClose={() => setIsFocused(false)}
        />
      )}
    </div>
  );
};
