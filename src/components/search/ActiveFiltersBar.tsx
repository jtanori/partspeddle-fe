import React from "react";
import { X } from "lucide-react";

interface Filter {
  key: string;
  label: string;
}

interface ActiveFiltersBarProps {
  filters: Filter[];
  onRemove: (key: string) => void;
  onClearAll: () => void;
  className?: string;
}

export const ActiveFiltersBar: React.FC<ActiveFiltersBarProps> = ({
  filters,
  onRemove,
  onClearAll,
  className = "",
}) => {
  if (filters.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {filters.map((filter) => (
        <span
          key={filter.key}
          className="flex items-center gap-1.5 bg-zinc-100 border border-zinc-200 text-zinc-900 text-xs font-semibold px-2.5 py-1 rounded-sm"
        >
          {filter.label}
          <button
            onClick={() => onRemove(filter.key)}
            className="hover:text-red-500 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <button
        onClick={onClearAll}
        className="text-xs text-zinc-500 hover:text-zinc-900 font-medium underline underline-offset-4 ml-2"
      >
        Clear All
      </button>
    </div>
  );
};
