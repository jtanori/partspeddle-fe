import React from "react";

interface SearchSidebarDisabledProps {
  className?: string;
}

export const SearchSidebarDisabled: React.FC<SearchSidebarDisabledProps> = ({
  className = "",
}) => {
  return (
    <aside
      className={`w-full max-w-[280px] bg-zinc-900/50 text-zinc-500 p-6 flex flex-col gap-6 opacity-60 pointer-events-none ${className}`}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
          Filter By
        </h2>
        <span className="text-xs uppercase tracking-wide">Clear All</span>
      </div>

      <div className="flex-1 space-y-6">
        {[
          "Category",
          "Part Type",
          "Condition",
          "Make",
          "Model",
          "Year",
          "Price Range",
        ].map((filter) => (
          <div
            key={filter}
            className="h-10 border-b border-zinc-800 flex items-center justify-between"
          >
            <span className="text-sm">{filter}</span>
            <span className="text-xs">›</span>
          </div>
        ))}
      </div>

      <div className="w-full bg-zinc-700 py-3 rounded-sm font-bold uppercase tracking-wider text-center text-zinc-500">
        Apply Filters
      </div>
    </aside>
  );
};
