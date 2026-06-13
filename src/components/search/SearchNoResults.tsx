import React from "react";
import { AlertTriangle } from "lucide-react";

interface SearchNoResultsProps {
  onClearSearch: () => void;
}

export const SearchNoResults: React.FC<SearchNoResultsProps> = ({
  onClearSearch,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white border border-zinc-200 rounded max-w-sm md:max-w-md lg:max-w-2xl mx-auto space-y-4 shadow-sm">
      <AlertTriangle className="w-12 h-12 text-rust-copper" />
      <h3 className="font-display text-lg font-bold uppercase text-zinc-900">
        No Results Found
      </h3>
      <p className="text-xs text-zinc-500 text-center leading-relaxed">
        We couldn&apos;t find any parts matching your search. Try adjusting your
        search or filters.
      </p>
      <button
        onClick={onClearSearch}
        className="bg-rust-copper text-white text-xs font-bold uppercase py-2 px-6 rounded-sm hover:bg-[#8B6239] transition-all"
      >
        Clear Search
      </button>
    </div>
  );
};
