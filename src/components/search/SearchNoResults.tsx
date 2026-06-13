import React from "react";
import { AlertTriangle } from "lucide-react";

interface SearchNoResultsProps {
  onClearSearch: () => void;
}

export const SearchNoResults: React.FC<SearchNoResultsProps> = ({
  onClearSearch,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-transparent space-y-4">
      <AlertTriangle className="w-16 h-16 text-rust-copper/70" />
      <h3 className="font-display text-2xl font-black uppercase text-zinc-800 tracking-wider">
        PART NOT FOUND
      </h3>
      <button
        onClick={onClearSearch}
        className="font-display text-sm font-bold uppercase text-rust-copper hover:text-[#8B6239] transition-all"
      >
        BACK TO MARKETPLACE
      </button>
    </div>
  );
};
