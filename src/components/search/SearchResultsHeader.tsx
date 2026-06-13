import React from "react";

interface SearchResultsHeaderProps {
  query: string;
  count: number;
  totalCount: number;
  currentPage: number;
  hitsPerPage: number;
  className?: string;
}

export const SearchResultsHeader: React.FC<SearchResultsHeaderProps> = ({
  query,
  count,
  totalCount,
  currentPage,
  hitsPerPage,
  className = "",
}) => {
  const currentRangeEnd = Math.min(currentPage * hitsPerPage, totalCount);

  return (
    <div className={className}>
      <h1 className="text-2xl font-bold uppercase tracking-tight text-zinc-900">
        {query ? (
          <>
            {count} RESULTS FOR &quot;{query.toUpperCase()}&quot;
          </>
        ) : (
          <>FULL PARTS CATALOG</>
        )}
      </h1>
      {!query && (
        <p className="text-base text-zinc-500 mt-1">
          Viewing{" "}
          <span className="font-bold text-zinc-900">{currentRangeEnd}</span> of{" "}
          <span className="font-bold text-zinc-900">{totalCount}</span> parts in
          the store
        </p>
      )}
    </div>
  );
};
