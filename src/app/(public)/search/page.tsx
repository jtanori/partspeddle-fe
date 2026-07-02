import React, { Suspense } from "react";
import { unstable_noStore as noStore } from "next/cache";
import { SearchPageClient } from "@/components/search/SearchPageClient";
import { buildSearchResultCard } from "@/projection/search";
import {
  parseSearchParams,
  serializeSearchRequest,
} from "@/lib/search/parse-search-params";
import { fetchSearchResults } from "@/lib/search/server-search";

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function SearchPageLoader({
  searchParams,
}: SearchPageProps) {
  noStore();
  const params = await searchParams;
  const parsedRequest = parseSearchParams(params);
  const result = await fetchSearchResults(parsedRequest);

  const initialData = {
    cards: result.hits.map(buildSearchResultCard),
    facets: result.facets,
    pagination: {
      totalPages: result.totalPages,
      currentPage: result.page + 1,
      totalHits: result.totalHits,
    },
    requestKey: serializeSearchRequest(parsedRequest),
  };

  return <SearchPageClient initialData={initialData} />;
}

export default function SearchPage(props: SearchPageProps) {
  return (
    <Suspense fallback={null}>
      <SearchPageLoader {...props} />
    </Suspense>
  );
}