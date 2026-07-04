import type { APIRequestContext } from "@playwright/test";

interface SearchHit {
  objectID?: string;
  id?: string;
}

interface SearchResponse {
  hits?: SearchHit[];
}

export async function fetchSmokeListingId(
  request: APIRequestContext,
  baseURL: string,
): Promise<string> {
  const response = await request.post(`${baseURL}/api/search/parts`, {
    data: { query: "", page: 0, hitsPerPage: 1 },
  });

  if (!response.ok()) {
    throw new Error(`Search API failed with status ${response.status()}`);
  }

  const payload = (await response.json()) as SearchResponse;
  const listingId = payload.hits?.[0]?.objectID ?? payload.hits?.[0]?.id;

  if (!listingId) {
    throw new Error("No listing available for smoke test");
  }

  return listingId;
}
