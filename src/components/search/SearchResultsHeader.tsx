import React from "react";
import { SearchFilters } from "@/types";
import { composeSearchHeader } from "./utils/header-utils";

interface SearchResultsHeaderProps {
  filters: SearchFilters;
  totalCount: number;
  isLoading: boolean;
  className?: string;
}

export const SearchResultsHeader: React.FC<SearchResultsHeaderProps> = ({
  filters,
  totalCount,
  isLoading,
  className = "",
}) => {
  const { title, subtitle } = composeSearchHeader(
    filters,
    totalCount,
    isLoading,
  );

  return (
    <div className={className}>
      <h1 className="text-2xl font-bold uppercase tracking-tight text-zinc-900">
        {title}
      </h1>
      <p className="text-base text-zinc-500 mt-1">{subtitle}</p>
    </div>
  );
};
